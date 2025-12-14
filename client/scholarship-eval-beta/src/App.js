import React, { useState, useRef } from 'react';
import './App.css'; // Importing the plain CSS file

function App() {
  // State variable to manage the current step/page of the application
  // 1: Landing Page (form input)
  // 2: Loading Page (processing data)
  // 3: Check Page (displaying results)
  const [step, setStep] = useState(1);

  // State object to store user input data from the form
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    experience: '',
    ctc: '',
    productInterest: '',
    reason: '',
    resume: null,
    email: '', // Added email field
  });

  // State to store the analysis results received as JSON from the backend
  const [analysisResults, setAnalysisResults] = useState(null);

  // Ref for the form section, used for smooth scrolling
  const formSectionRef = useRef(null);

  // Event handler for input changes (text fields and file input)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function to scroll to the form section
  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(2); // Immediately switch to the loading page

    const data = new FormData();
    data.append("jobRole", formData.jobRole);
    data.append("experience", formData.experience);
    data.append("ctc", formData.ctc);
    data.append("companyName", formData.companyName);
    data.append("productInterest", formData.productInterest);
    data.append("reason", formData.reason);
    data.append("email", formData.email); // Append email to form data

    if (formData.resume) {
      data.append("resume", formData.resume);
    }

    try {
      const response = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setAnalysisResults(result.result);
      setStep(3); // Move to the results page after successful analysis
    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysisResults({
        error: "Failed to get analysis results. Please check your network or try again.",
        details: error.message
      });
      setStep(3); // Still move to the check page to display the error
    }
  };

  return (
    <div className="app-container">

      {/* Step 1: Landing Page */}
      {step === 1 && (
        <>
          {/* Header */}
          <header className="main-header">
            <div className="header-logo-container">
              <img src="/cn-logo.png" alt="Coding Ninjas Logo" className="header-logo" />
            </div>
            <nav className="header-nav">
              <a href="#" className="nav-link">Home</a>
              <a href="#" className="nav-link">About Us</a>
              <a href="#" className="nav-link">Contact</a>
              <button onClick={scrollToForm} className="header-button">
                Check Eligibility
              </button>
            </nav>
          </header>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content-container">
              <div className="hero-text-content">
                <h1 className="hero-title">Scholarship Check</h1>
                <p className="hero-description">
                  Claim a scholarship worth of <span className="hero-highlight">INR 15000 to INR 25000</span> on different courses with your purchase. Hit the button below to get your profile evaluated now!
                </p>
                <button onClick={scrollToForm} className="hero-button">
                  Check Eligibility
                </button>
              </div>
              <div className="hero-image-container">
                <img
                  src="/scholarship-hero.png"
                  alt="Scholarship illustration"
                  className="hero-image no-shadow" /* no-shadow class ensures no shadow */
                />
              </div>
            </div>
            {/* Background elements for visual interest */}
            <div className="hero-bg-pattern"></div>
            <div className="hero-bg-blob hero-bg-blob-1"></div>
            <div className="hero-bg-blob hero-bg-blob-2"></div>
          </section>

          {/* Why We Offer a Scholarship? Section */}
          <section className="scholarship-reason-section">
            <div className="scholarship-reason-content">
              {/* Wrapper for text content to ensure vertical alignment with the form */}
              <div className="scholarship-reason-text-wrapper">
                <h2 className="scholarship-reason-title">
                  Why We Offer a Scholarship?
                </h2>
                <div className="reason-list">
                  <div className="reason-item">
                    <span className="reason-icon">✔</span>
                    <p className="reason-description">
                      We believe money shouldn't be a barrier to quality education.
                    </p>
                  </div>
                  <div className="reason-item">
                    <span className="reason-icon">✔</span>
                    <p className="reason-description">
                      To support deserving learners aiming to excel, irrespective of their financial background.
                    </p>
                  </div>
                  <div className="reason-item">
                    <span className="reason-icon">✔</span>
                    <p className="reason-description">
                      Whether you're a student, experienced, or unexperienced - we support your career growth.
                    </p>
                  </div>
                  <div className="reason-item">
                    <span className="reason-icon">✔</span>
                    <p className="reason-description">
                      Empowering individuals who are ready to embrace the power of data analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Me / Form Section */}
              <div ref={formSectionRef} className="contact-form-container">
                <h2 className="contact-form-title">Check Eligibility</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                  {/* Company Name */}
                  <div className="form-group">
                    <label htmlFor="companyName" className="form-label">Company Name:</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      className="form-input"
                      placeholder="e.g., Google, Infosys"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Job Role Input */}
                  <div className="form-group">
                    <label htmlFor="jobRole" className="form-label">Current Job Profile:</label>
                    <input
                      type="text"
                      id="jobRole"
                      name="jobRole"
                      className="form-input"
                      placeholder="e.g., Data Analyst, Software Engineer"
                      value={formData.jobRole}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* CTC and Years of Experience in same row */}
                  <div className="form-row">
                    {/* CTC Input */}
                    <div className="form-group">
                      <label htmlFor="ctc" className="form-label">CTC (in LPA):</label>
                      <input
                        type="number"
                        id="ctc"
                        name="ctc"
                        step="0.1"
                        className="form-input"
                        placeholder="e.g., 5.5, 8.0"
                        value={formData.ctc}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {/* Years of Experience Input */}
                    <div className="form-group">
                      <label htmlFor="experience" className="form-label">Years of Experience:</label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        className="form-input"
                        placeholder="e.g., 2, 5"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Email Input */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="e.g., your.name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Product Interest */}
                  <div className="form-group">
                    <label htmlFor="productInterest" className="form-label">Product:</label>
                    <input
                      type="text"
                      id="productInterest"
                      name="productInterest"
                      className="form-input"
                      placeholder="e.g., Data Analytics Bootcamp"
                      value={formData.productInterest}
                      onChange={handleChange}
                    />
                  </div>
                  {/* Reason / Message */}
                  <div className="form-group">
                    <label htmlFor="reason" className="form-label">Reason / Your question or message:</label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows="3"
                      className="form-input textarea-input"
                      placeholder="Tell us why you're interested or ask a question"
                      value={formData.reason}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  {/* Resume Upload */}
                  <div className="form-group">
                    <label htmlFor="resume" className="form-label">Upload Resume:</label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf,.txt,.doc,.docx"
                      className="file-input"
                      onChange={handleChange}
                      required
                    />
                    {formData.resume && (
                        <p className="file-info">Selected: {formData.resume.name}</p>
                    )}
                  </div>
                  {/* Check Now Button (Submit) */}
                  <button type="submit" className="submit-button">
                    Check Now
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="main-footer">
            <div className="footer-top-section">
              {/* Column 1: Logo and Address */}
              <div className="footer-column footer-info">
                <div className="footer-logo-container">
                  <img src="/cn-logo.png" alt="Coding Ninjas Logo" className="footer-logo" />
                </div>
                <p className="footer-address">Unit 007-008, GF, Tower-A, Unitech Cyber Park</p>
                <p className="footer-address">Sector 39, Gurgaon</p>
                <p className="footer-contact">Email: <a href="mailto:support@codingninjas.com" className="footer-email-link">hire@codingninjas.com</a></p>
              </div>

              {/* Column 2: Useful Links */}
              <div className="footer-column">
                <h3 className="footer-heading">Useful Links</h3>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link-item">Home</a></li>
                  <li><a href="#" className="footer-link-item">Reviews</a></li>
                  <li><a href="#" className="footer-link-item">Press Release</a></li>
                  <li><a href="#" className="footer-link-item">Terms and Conditions</a></li>
                  <li><a href="#" className="footer-link-item">Privacy Policy</a></li>
                </ul>
              </div>

              {/* Column 3: Products */}
              <div className="footer-column">
                <h3 className="footer-heading">Products</h3>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link-item">Full Stack Web Development Job Bootcamp</a></li>
                  <li><a href="#" className="footer-link-item">Data Analytics Job Bootcamp</a></li>
                  <li><a href="#" className="footer-link-item">Code 360</a></li>
                </ul>
              </div>

              {/* Column 4: Follow Us */}
              <div className="footer-column">
                <h3 className="footer-heading">Follow Us</h3>
                <p className="footer-follow-text">Stay connected with us—follow us on social media for the latest updates</p>
                <div className="footer-social-icons">
                  {/* Inline SVGs for social icons (Facebook, Instagram, LinkedIn, YouTube) */}
                  <a href="#" className="social-icon-circle" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.123 7.822h-1.897c-1.345 0-1.579 0.637-1.579 1.547v2.028h3.178l-0.518 3.253h-2.66v8.324H9.42V14.65h-2.659V11.4h2.659v-2.883c0-2.628 1.597-4.062 3.931-4.062 1.139 0 2.115 0.086 2.395 0.124v2.793z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-icon-circle" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0a12 12 0 0 0-12 12c0 6.627 5.373 12 12 12 6.627 0 12-5.373 12-12C24 5.373 18.627 0 12 0zm0 2.25c3.208 0 3.611 0.012 4.887 0.071 1.25.059 1.831.258 2.228.411a3.023 3.023 0 0 1 1.765 1.127c.502.502.894 1.144 1.127 1.765.153.398.352.978.411 2.228.059 1.276.071 1.679.071 4.887s-0.012 3.611-0.071 4.887c-0.059 1.25-0.258 1.831-0.411 2.228a3.023 3.023 0 0 1-1.127 1.765c-0.502.502-1.144.894-1.765 1.127-0.398.153-0.978.352-2.228 0.411-1.276.059-1.679 0.071-4.887 0.071s-3.611-0.012-4.887-0.071c-1.25-0.059-1.831-0.258-2.228-0.411a3.023 3.023 0 0 1-1.765-1.127c-0.502-0.502-0.894-1.144-1.127-1.765-0.153-0.398-0.352-0.978-0.411-2.228-0.059-1.276-0.071-1.679-0.071-4.887s0.012-3.611 0.071-4.887c0.059-1.25 0.258-1.831 0.411-2.228a3.023 3.023 0 0 1 1.127-1.765c0.502-0.502 1.144-0.894 1.765-1.127 0.398-0.153 0.978-0.352 2.228-0.411C8.389 2.262 8.792 2.25 12 2.25zm0 2.25c-3.208 0-3.568 0.011-4.836 0.07-1.171 0.055-1.693 0.24-1.956 0.34-0.706 0.274-1.286 0.613-1.865 1.192-0.579 0.579-0.918 1.159-1.192 1.865-0.101 0.263-0.286 0.785-0.34 1.956-0.059 1.268-0.07 1.628-0.07 4.836s0.011 3.568 0.07 4.836c0.055 1.171 0.24 1.693 0.34 1.956 0.274 0.706 0.613 1.286 1.192 1.865 0.579 0.579 1.159 0.918 1.192-1.865-0.263-0.101-0.785-0.286-1.956-0.34C15.568 4.511 15.208 4.5 12 4.5zm0 3.328c-2.316 0-4.195 1.879-4.195 4.195S9.684 16.27 12 16.27s4.195-1.879 4.195-4.195S14.316 7.828 12 7.828zm0 2.25c1.077 0 1.945 0.868 1.945 1.945s-0.868 1.945-1.945 1.945-1.945-0.868-1.945-1.945S10.923 10.078 12 10.078zm6.495-5.263a1.442 1.442 0 1 0 0-2.884 1.442 1.442 0 0 0 0 2.884z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-icon-circle" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-3V8h3v8zm-1.5-9.141c-1.391 0-2.5-1.107-2.5-2.499s1.109-2.5 2.5-2.5 2.5 1.107 2.5 2.499c0 1.392-1.109 2.501-2.5 2.501zm11.5 9.141h-3s0-0.796 0-3.238c0-2.542-1.185-3.899-3.693-3.899-1.849 0-2.886 1.241-2.886 3.829v3.308h-3V8h2.992s0.015 0.643 0.015 0.857c0.113-0.217 0.446-0.841 1.791-0.841 1.283 0 2.289 0.835 2.289 2.657v3.297z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-icon-circle" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.735 16.711c-0.291 1.108-1.196 1.229-2.282 1.266-2.585 0.117-6.043 0.117-8.629 0-1.085-0.038-1.99-0.158-2.282-1.266-0.272-1.025-0.272-4.148 0-5.174 0.291-1.108 1.196-1.229 2.282-1.266 2.585-0.117 6.043-0.117 8.629 0 1.085 0.038 1.99 0.158 2.282 1.266 0.272 1.025 0.272 4.148 0 5.174zm-5.467-3.955l4.316-2.256-4.316-2.257v4.513z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="footer-separator"></div>

            <div className="footer-bottom-section">
              <p className="footer-copyright">© Copyright Sunrise Mentors Private Limited. All Rights Reserved</p>
            </div>
          </footer>
        </>
      )}

      {/* Step 2: Loading Page */}
      {step === 2 && (
        <div className="loading-page-container">
          <div className="loader"></div> {/* Reverted to original loader */}
          <p className="loading-text">Analyzing your profile...</p>
          <p className="loading-subtext">Please wait while we check your eligibility and provide personalized insights.</p>
          <div className="loading-logo-container">
            <img src="/cn-logo.png" alt="Coding Ninjas Logo" className="loading-logo" />
          </div>
        </div>
      )}

      {/* Step 3: Check Page - Displays the analysis results */}
      {step === 3 && (
        <div className="results-page-container">
          <div className="results-card">
            <h2 className="results-title">Your Eligibility Results</h2>

            {analysisResults && analysisResults.error ? (
              // Display error message if analysis failed
              <div className="error-message-box">
                <strong className="error-bold">Error!</strong>
                <span className="error-text">{analysisResults.error}</span>
                {analysisResults.details && <p className="error-details">{analysisResults.details}</p>}
                <button onClick={() => setStep(1)} className="error-back-button">
                  Go Back
                </button>
              </div>
            ) : (
              // Display successful analysis results
              <div className="results-content">
                {/* Benefits Section */}
                <div className="results-section">
                  <h3 className="section-heading">
                    <span className="icon-star">⭐</span> Benefits of the Program:
                  </h3>
                  <div className="section-card">
                    <ul className="benefits-list">
                      {analysisResults?.benefits?.map((benefit, index) => (
                        <li key={index} className="benefits-item">
                          <span className="icon-check">★</span> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* DA Alignment Section */}
                <div className="results-section">
                  <h3 className="section-heading">
                    <span className="icon-chart">📈</span> Data Analytics & Your Job Role:
                  </h3>
                  <div className="section-card">
                    <ol className="alignment-list">
                      {analysisResults?.alignment?.map((item, index) => (
                        <li key={index} className="alignment-item">
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Removed Resume Review Section
                <div className="results-section">
                  <h3 className="section-heading">
                    <span className="icon-clipboard">📝</span> Areas for Improvement (Resume Review):
                  </h3>
                  <div className="section-card">
                    <p className="review-text">
                      {analysisResults?.resumeReview || "No specific review available."}
                    </p>
                  </div>
                </div>
                */}

                {/* Scholarship Eligibility Section */}
                <div className="scholarship-eligibility-section">
                  <div
                    className={`eligibility-status ${analysisResults?.scholarshipEligibility?.includes("Eligible") ? 'eligible' : 'not-eligible'}`}
                  >
                    {analysisResults?.scholarshipEligibility === "Eligible ✅" ? "Eligible ✅ 🎉" : "Not Eligible ❌ 😔"}
                  </div>
                  <p className="scholarship-message">
                    {analysisResults?.scholarshipMessage}
                  </p>
                </div>

                {/* Back to Home Button */}
                <div className="back-home-button-container">
                  <button onClick={() => setStep(1)} className="back-home-button">
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
