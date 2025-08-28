import React, { useState, useRef, useEffect } from 'react';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const SignUp = ({ cfg }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [gender, setGender] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [organisationType, setOrganisationType] = useState('');
  const [thematicInterest, setThematicInterest] = useState([]);
  const [country, setCountry] = useState([]);
  const [timeframe, setTimeframe] = useState('');
  const [sourceOfReferral, setSourceOfReferral] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const formRef = useRef(null); // Ref for scrolling to top
  const navigate = useNavigate(); // Hook for navigation

  // Initialize CognitoUserPool with cfg prop
  const userPool = new CognitoUserPool(cfg);

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const siteKey = cfg.recaptchaSiteKey;
    if (!siteKey) {
      console.error('reCAPTCHA site key is missing.');
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // E.164 phone number validation (e.g., +12345678901)
  const validatePhoneNumber = (phone) => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!email || !password || !givenName || !familyName || !organisation || !gender || !ageCategory || !phoneNumber || !organisationType || !thematicInterest.length || !country.length || !timeframe || !sourceOfReferral) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Phone number must be in E.164 format (e.g., +441234567890).');
      return;
    }

    // Execute reCAPTCHA v3
    const siteKey = cfg.recaptchaSiteKey;
    if (!siteKey) {
      setError('reCAPTCHA configuration error. Please refresh the page.');
      return;
    }
    if (window.grecaptcha) {
      try {
        await window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'signup' })
            .then((token) => {
              if (!token) {
                setError('reCAPTCHA verification failed. Please try again.');
                return;
              }

              // Format thematicInterest as comma-separated string for Cognito
              const thematicInterestString = thematicInterest.join(',');
              const countryString = country.join(',');

              const attributeList = [
                { Name: 'given_name', Value: givenName },
                { Name: 'family_name', Value: familyName },
                { Name: 'gender', Value: gender },
                { Name: 'custom:age_category', Value: ageCategory },
                { Name: 'phone_number', Value: phoneNumber },
                { Name: 'custom:organisation', Value: organisation },
                { Name: 'custom:organisation_type', Value: organisationType },
                { Name: 'custom:thematic_interest', Value: thematicInterestString },
                { Name: 'custom:country', Value: countryString },
                { Name: 'custom:timeframe', Value: timeframe },
                { Name: 'custom:source_of_referral', Value: sourceOfReferral },
              ];

              userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                  setError(err.message || 'An error occurred during sign-up.');
                  return;
                }
                setSuccess('Sign-up successful! Please check your phone for verification code.');
                setShowVerification(true);
              });
            });
        });
      } catch (err) {
        setError('reCAPTCHA error. Please try again.');
      }
    } else {
      setError('reCAPTCHA not loaded. Please refresh the page.');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        setError(err.message || 'An error occurred during verification.');
        return;
      }
      setSuccess('Verification successful! Redirecting to login in 5 seconds...');
      setIsVerified(true);
      setTimeout(() => {
        window.location.replace(cfg.loginUrl);
      }, 5000); // 5-second delay after successful verification
    });
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Execute reCAPTCHA v3 for resend action
    const siteKey = cfg.recaptchaSiteKey;
    if (!siteKey) {
      setError('reCAPTCHA configuration error. Please refresh the page.');
      return;
    }
    if (window.grecaptcha) {
      try {
        await window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'resend_code' })
            .then((token) => {
              if (!token) {
                setError('reCAPTCHA verification failed. Please try again.');
                return;
              }

              const user = new CognitoUser({
                Username: email,
                Pool: userPool,
              });

              user.resendConfirmationCode((err, result) => {
                if (err) {
                  setError(err.message || 'Failed to resend verification code.');
                  return;
                }
                setSuccess('Verification code resent successfully! Please check your phone.');
              });
            });
        });
      } catch (err) {
        setError('reCAPTCHA error. Please try again.');
      }
    } else {
      setError('reCAPTCHA not loaded. Please refresh the page.');
    }
  };

  // Options for Gender dropdown
  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  // Options for Age category
  const ageCategoryOptions = [
    { value: '', label: 'Select age category' },
    { value: '10-15', label: '10-15' },
    { value: '16-20', label: '16-20' },
    { value: '21-30', label: '21-30' },
    { value: '31-40', label: '31-40' },
    { value: '41-50', label: '41-50' },
    { value: '51-60', label: '51-60' },
    { value: '61-70', label: '61-70' },
    { value: '71-80', label: '71-80' },
    { value: '81+', label: '81+' },
  ];

  // Options for organisation type
  const organisationTypeOptions = [
    { value: '', label: 'Select organisation type' },
    { value: 'Academic Institution', label: 'Academic Institution' },
    { value: 'Government', label: 'Government' },
    { value: 'Implementing Partner', label: 'Implementing Partner' },
    { value: 'Non-government Organisation (NGO)', label: 'Non-government Organisation (NGO)' },
    { value: 'Intergovernmental Organisation (IGO)', label: 'Intergovernmental Organisation (IGO)' },
    { value: 'Private Sector', label: 'Private Sector' },
    { value: 'Technical Partner', label: 'Technical Partner' },
    { value: 'UN Agency', label: 'UN Agency' },
    { value: 'Other', label: 'Other' },
  ];

  // Options for thematic interest
  const thematicInterestOptions = [
    { value: 'Agriculture / Food Security', label: 'Agriculture / Food Security' },
    { value: 'Automated Land Cover Mapping', label: 'Automated Land Cover Mapping' },
    { value: 'Biodiversity Conservation', label: 'Biodiversity Conservation' },
    { value: 'Crop Monitoring', label: 'Crop Monitoring' },
    { value: 'Land Degradation', label: 'Land Degradation' },
    { value: 'Precision Agriculture', label: 'Precision Agriculture' },
    { value: 'Urban Expansion', label: 'Urban Expansion' },
    { value: 'Urban Planning', label: 'Urban Planning' },
    { value: 'Urbanisation', label: 'Urbanisation' },
    { value: 'Water Management', label: 'Water Management' },
    { value: 'Water Resources Management', label: 'Water Resources Management' },
    { value: 'Wetlands', label: 'Wetlands' },
    { value: 'Other', label: 'Other' },
  ];

  // Options for Country dropdown
  const countryOptions = [
    { value: 'Continental', label: 'Continental' },
    { value: 'Algeria', label: 'Algeria' },
    { value: 'Angola', label: 'Angola' },
    { value: 'Benin', label: 'Benin' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Burundi', label: 'Burundi' },
    { value: 'Cabo Verde', label: 'Cabo Verde' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Chad', label: 'Chad' },
    { value: 'Comoros', label: 'Comoros' },
    { value: 'Congo', label: 'Congo' },
    { value: 'Côte d’Ivoire', label: 'Côte d’Ivoire' },
    { value: 'Democratic Republic of the Congo', label: 'Democratic Republic of the Congo' },
    { value: 'Djibouti', label: 'Djibouti' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Eswatini', label: 'Eswatini' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Gabon', label: 'Gabon' },
    { value: 'Gambia', label: 'Gambia' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Lesotho', label: 'Lesotho' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Libya', label: 'Libya' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Malawi', label: 'Malawi' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Mauritania', label: 'Mauritania' },
    { value: 'Mauritius', label: 'Mauritius' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'Namibia', label: 'Namibia' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Seychelles', label: 'Seychelles' },
    { value: 'Sierra Leone', label: 'Sierra Leone' },
    { value: 'Somalia', label: 'Somalia' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'South Sudan', label: 'South Sudan' },
    { value: 'Sudan', label: 'Sudan' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Togo', label: 'Togo' },
    { value: 'Tunisia', label: 'Tunisia' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Zambia', label: 'Zambia' },
    { value: 'Zimbabwe', label: 'Zimbabwe' },
  ];

  // Options for Timeframe
  const timeframeOptions = [
    { value: '', label: 'Select timeframe' },
    { value: '1 week', label: '1 week' },
    { value: '1 month', label: '1 month' },
    { value: '<6months', label: '< 6 months' },
    { value: '>6months', label: '> 6 months' },
    { value: '<1 year', label: '< 1 year' },
    { value: '>1 year', label: '> 1 year' },
  ];

  // Options for referral source
  const sourceOfReferralOptions = [
    { value: '', label: 'Select referral source' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Google search', label: 'Google search' },
    { value: 'I am an existing user', label: 'I am an existing user' },
    { value: 'Training event', label: 'Training event' },
    { value: 'Word of mouth', label: 'Word of mouth' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="signup-container" ref={formRef}>
      <h2>Create Your DE Africa Sandbox Account</h2>
      <center><h4>All fields are required</h4></center>
      {!showVerification ? (
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Given Name</label>
                <input type="text" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Family Name</label>
                <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Age Category</label>
                <select value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)} required>
                  {ageCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>
                  Password
                  <span className="tooltip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-dark)">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <text x="8" y="12" fontSize="11" textAnchor="middle" fill="currentColor">i</text>
                    </svg>
                    <span className="tooltip-text">Password policy: Minimum length 8 characters. Require: numbers, lowercase, uppercase.</span>
                  </span>
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>
                  Phone Number
                  <span className="tooltip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-dark)">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <text x="8" y="12" fontSize="11" textAnchor="middle" fill="currentColor">i</text>
                    </svg>
                    <span className="tooltip-text">Enter your phone number in E.164 format (e.g., +441234567890). The phone number will be verified via SMS.</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+441234567890"
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Organisation Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Organisation</label>
                <input type="text" value={organisation} onChange={(e) => setOrganisation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Organisation Type</label>
                <select value={organisationType} onChange={(e) => setOrganisationType(e.target.value)} required>
                  {organisationTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Interests and Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Thematic Interest</label>
                <Select
                  isMulti
                  options={thematicInterestOptions}
                  value={thematicInterestOptions.filter((option) => thematicInterest.includes(option.value))}
                  onChange={(selected) => setThematicInterest(selected ? selected.map((opt) => opt.value) : [])}
                  className="multi-select"
                  classNamePrefix="select"
                  placeholder="Select one or more..."
                  required
                />
              </div>
              <div className="form-group">
              <label>
                Locations for analysis
                <span className="tooltip">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-dark)">
                    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <text x="8" y="12" fontSize="11" textAnchor="middle" fill="currentColor">i</text>
                  </svg>
                  <span className="tooltip-text">Intended locations that you wish to access data for.</span>
                </span>
              </label>
                <Select
                  isMulti
                  options={countryOptions}
                  value={countryOptions.filter((option) => country.includes(option.value))}
                  onChange={(selected) => setCountry(selected ? selected.map((opt) => opt.value) : [])}
                  className="multi-select"
                  classNamePrefix="select"
                  placeholder="Select one or more..."
                  required
                />
              </div>
              <div className="form-group">
              <label>
                Timeframe
                <span className="tooltip">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-dark)">
                    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <text x="8" y="12" fontSize="11" textAnchor="middle" fill="currentColor">i</text>
                  </svg>
                  <span className="tooltip-text">Anticipated timeframe for your use of the Sandbox.</span>
                </span>
              </label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} required>
                  {timeframeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>How did you hear about DE Africa?</label>
                <select value={sourceOfReferral} onChange={(e) => setSourceOfReferral(e.target.value)} required>
                  {sourceOfReferralOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {error && (
            <p className="error-message" aria-live="polite">
              {error}
            </p>
          )}
          {success && (
            <p className="success-message" aria-live="polite">
              {success}
            </p>
          )}
          <button type="submit">Create Account</button>
        </form>
      ) : !isVerified ? (
        <form onSubmit={handleVerificationSubmit}>
          <div className="form-section">
            <h3>Verify Your Phone Number</h3>
            <div className="form-group">
              <label>Phone Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the code sent to your phone"
                required
              />
              <span className="help-text">Check your phone for the SMS verification code.</span>
              <p>
                <a href="#" className="resend-link" onClick={handleResendCode}>Resend Code</a>
              </p>
            </div>
            {error && (
              <p className="error-message" aria-live="polite">
                {error}
              </p>
            )}
            {success && (
              <p className="success-message" aria-live="polite">
                {success}
              </p>
            )}
            <div className="button-group">
              <button type="submit">Verify</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="form-section">
          <h3>Verification Successful</h3>
          <p className="success-message" aria-live="polite">
            {success}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUp;
