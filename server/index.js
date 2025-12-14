// Load environment variables from .env file FIRST.
// This allows you to securely store your API key outside of the code.
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

// Enable CORS for all origins. In a production environment, you might want to restrict this
// to specific frontend origins for better security.
app.use(cors());

// Parse JSON request bodies. This is needed for receiving form data like jobRole, experience, ctc.
app.use(express.json());

// Enable file uploads. This middleware processes file data from the request body,
// making it accessible via req.files.
app.use(fileUpload());

// --- Gemini API Configuration ---
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const GEMINI_MODEL = "gemini-2.5-flash"; // Using gemini-2.5-flash for text generation

// --- API Endpoint for Analysis ---
// This endpoint will receive user details and a resume file,
// process them, and then call the Gemini API for analysis.
app.post("/analyze", async (req, res) => {
  try {
    // Extract basic details from the request body
    const { jobRole, experience, ctc } = req.body;

    // Validate if a resume file was uploaded
    if (!req.files || !req.files.resume) {
      // If no resume is provided, send a 400 Bad Request error.
      return res.status(400).send("Resume file is required.");
    }

    // Convert the uploaded resume data (Buffer) to a string.
    // Assuming the resume content is text-based (e.g., plain text, parsed PDF text).
    const resume = req.files.resume.data.toString();

    // Parse CTC as a float for numerical comparison
    const parsedCtc = parseFloat(ctc);

    // --- Scholarship Eligibility & Amount Determination Logic (Initialized) ---
    // These will be determined after the AI response, based on CTC and AI's 'isHighlyAlignedOrIntellectual' flag.
    let scholarshipAmount = 0;
    let scholarshipEligibility = "Not Applicable"; // Will be updated
    let scholarshipMessage = ""; // Will be updated

    // --- Constructing the Prompt for Gemini API ---
    // The prompt is designed to instruct the Gemini model to provide structured JSON output.
    // It leverages the fact that the model implicitly has context about the brochure content
    // from our previous interactions.
    // We now ask the AI for a boolean flag: isHighlyAlignedOrIntellectual.
    const prompt = `
A user has submitted the following details for a Data Analytics Bootcamp evaluation:
Resume Text: ${resume}
Current Job Role: ${jobRole}
Experience: ${experience} years
Current CTC: ${ctc} LPA

Based on the Data Analytics Job Bootcamp brochure (which you have context on), provide a JSON response with the following keys.

For 'benefits', provide exactly 3 concise points that highlight the advantages of the program, including general career growth potential and salary hike data in the Indian job industry for Data Analytics. Keep it short and to the point.

For 'alignment', provide exactly 3 concise points. The first two points should explain how Data Analytics aligns with their current job role or career aspirations. The last point should specifically outline a clear career progression path taking in account the user's current '${jobRole}' after learning Data Analystics and subsequent advancements according to the Indian job industry (e.g., 'HR -> HR Analyst -> Senior HR Analyst').

For 'resumeReview', provide a single short and honest paragraph (maximum 2-3 sentences), directly to the point, highlighting current skill gaps and areas for immediate improvement relevant to a Data Analytics domain, based on the provided skills provided in resume text.

For the 'isHighlyAlignedOrIntellectual' field, please evaluate the user's 'Job Role' and 'Resume Text'.
Set 'isHighlyAlignedOrIntellectual' to 'true' if the profile indicates a strong alignment with Data Analytics (e.g., currently an analyst, data-related roles) OR if the resume suggests high intellectual capacity, strong problem-solving skills, or a strong likelihood of converting a scholarship into enrollment. Otherwise, set it to 'false'.

{
  "benefits": [
    "Benefit 1 (e.g., General career growth/salary hike, concise, short)",
    "Benefit 2 (from brochure, concise)",
    "Benefit 3 (from brochure, concise)"
  ],
  "alignment": [
    "How DA aligns with job role point 2 (concise, to the point)",
    "How DA aligns with job role point 3 (concise, to the point)",
    "Career progression for ${jobRole} after Data Analytics and future progression according to Indian job market (e.g., HR -> HR Analyst -> Senior HR Analyst)"
  ],
  "resumeReview": "A short and honest paragraph ( maximum 2-3 sentences) directly to the point, highlighting current skill gaps and areas for immediate improvement relevant to a Data Analytics bootcamp, based on the provided resume text.",
  "isHighlyAlignedOrIntellectual": true // true or false based on AI's evaluation
}

Ensure the entire output is valid JSON. Do not include any extra text before or after the JSON.
`;

    // Prepare the chat history for the Gemini API payload.
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    // Define the full payload for the Gemini API call, including the updated schema.
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json", // Request JSON output
        responseSchema: { // Define the expected structure of the JSON
          type: "OBJECT",
          properties: {
            "benefits": {
              "type": "ARRAY",
              "items": { "type": "STRING" }
            },
            "alignment": {
              "type": "ARRAY",
              "items": { "type": "STRING" }
            },
            "resumeReview": {
              "type": "STRING"
            },
            "isHighlyAlignedOrIntellectual": { // New field for AI's boolean assessment
              "type": "BOOLEAN"
            }
          },
          // Ensure all defined properties are present in the response
          "required": ["benefits", "alignment", "resumeReview", "isHighlyAlignedOrIntellectual"]
        }
      }
    };

    // Retrieve the Gemini API key from environment variables.
    const apiKey = process.env.GEMINI_API_KEY;

    // Crucial check: ensure the API key is actually set.
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set.");
      return res.status(500).send("Server configuration error: Gemini API Key is missing. Please check your .env file.");
    }

    // Construct the full API URL with the model and key.
    const apiUrl = `${GEMINI_API_BASE_URL}${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    // Make the HTTP POST request to the Gemini API.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Send the payload as a JSON string
    });

    // Parse the JSON response from the Gemini API.
    const result = await response.json();

    // Validate the structure of the Gemini API response.
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const parsedAiResponse = JSON.parse(jsonString); // Parse the AI's JSON string

      const isHighlyAlignedOrIntellectual = parsedAiResponse.isHighlyAlignedOrIntellectual;

      // Apply the new scholarship rules based on CTC and AI's assessment
      if (parsedCtc <= 6.9) {
        // Everyone below 6.9 LPA gets 25k
        scholarshipAmount = 25000;
        scholarshipEligibility = "Eligible ✅";
        scholarshipMessage = "Hurray! You are eligible for a scholarship of 25,000/-.";
      } else if (parsedCtc > 6.9 && parsedCtc <= 13) {
        // Between 6.9 and 13 LPA, always get a scholarship, determined by AI
        if (isHighlyAlignedOrIntellectual) {
          scholarshipAmount = 25000;
          scholarshipEligibility = "Eligible ✅";
          scholarshipMessage = "Great news! You are eligible for a scholarship of 25,000/- based on your strong profile alignment!";
        } else {
          scholarshipAmount = 15000;
          scholarshipEligibility = "Eligible ✅";
          scholarshipMessage = "Good news! You are eligible for a scholarship of 15,000/-. Secure your spot now and don't miss out on the 25,000/- opportunity!"; // Added FOMO
        }
      } else { // parsedCtc > 13 LPA
        // Above 13 LPA, scholarship is conditional based on AI
        if (isHighlyAlignedOrIntellectual) {
          scholarshipAmount = 15000; // Award 15k even if above 13 LPA if highly intellectual
          scholarshipEligibility = "Eligible ✅";
          scholarshipMessage = "Congratulations! You're eligible for a 15,000/- scholarship based on your exceptional profile. Don't miss this chance to upskill!";
        } else {
          scholarshipAmount = 0; // No scholarship
          scholarshipEligibility = "Not Eligible ❌";
          scholarshipMessage = "Based on your current CTC and profile alignment, you are not eligible for a scholarship at this time.";
        }
      }

      // Combine AI's response with backend-determined scholarship info
      const finalResult = {
        ...parsedAiResponse, // Include benefits, alignment, resumeReview from AI
        scholarshipEligibility: scholarshipEligibility,
        scholarshipMessage: scholarshipMessage,
        scholarshipAmount: scholarshipAmount // Add the determined amount for display if needed
      };

      res.json({ result: finalResult }); // Send the combined result back to the frontend
    } else {
      console.error("Gemini API response structure unexpected:", JSON.stringify(result, null, 2));
      res.status(500).send("Error: Unexpected response from AI model.");
    }
  } catch (err) {
    console.error("Error in /analyze endpoint:", err);
    res.status(500).send("Error processing request: " + err.message);
  }
});

// Start the server and listen on port 3001.
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
