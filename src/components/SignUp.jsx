import React, { useState, useRef, useEffect } from 'react';
import { CognitoUserPool, CognitoUserAttribute } from "amazon-cognito-identity-js";
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
  const formRef = useRef(null); // Ref for scrolling to top
  const navigate = useNavigate(); // Hook for navigation

  // Initialize CognitoUserPool with cfg prop
  const userPool = new CognitoUserPool(cfg);

  // Redirect to /signin after 5 seconds on successful sign-up
/*   useEffect(() => {
    const loginUrl = cfg.loginUrl;
    console.log('Test: ',success)
    if (success) {
      const timer = setTimeout(() => {
        window.location.replace(loginUrl);
      }, 5000); // 5-second delay
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [success, navigate]); */

  // Scroll to top when error or success state changes
  /*
  useEffect(() => {
    if ((error || success) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error, success]);*/

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

  // Handle multi-select change for thematic interest
  //const handleThematicInterestChange = (e) => {
  //  const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
  //  setThematicInterest(selectedOptions);
  //};

  // Handle multi-select change for country
  //const handleCountryChange = (e) => {
  //  const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
  //  setCountry(selectedOptions);
  //};

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
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'signup' }) // Replace with your v3 site key
            .then((token) => {
              // Client-side token check (not secure; use for basic validation)
              if (!token) {
                setError('reCAPTCHA verification failed. Please try again.');
                return;
              }

              // For client-side, proceed with token (less secure)
              // For server-side verification, send token to backend here
              // Example: fetch('/verify-recaptcha', { method: 'POST', body: JSON.stringify({ token }) })
              // Backend would call https://www.google.com/recaptcha/api/siteverify
              // Check score >= 0.5 and action === 'signup'

              // Format thematicInterest as comma-separated string for Cognito
              const thematicInterestString = thematicInterest.join(',');
              const countryString = country.join(',');

              const attributeList = [
                new CognitoUserAttribute({ Name: 'given_name', Value: givenName }),
                new CognitoUserAttribute({ Name: 'family_name', Value: familyName }),
                new CognitoUserAttribute({ Name: 'gender', Value: gender }),
                new CognitoUserAttribute({ Name: 'custom:age_category', Value: ageCategory }),
                new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNumber }),
                new CognitoUserAttribute({ Name: 'custom:organisation', Value: organisation }),
                new CognitoUserAttribute({ Name: 'custom:organisation_type', Value: organisationType }),
                new CognitoUserAttribute({ Name: 'custom:thematic_interest', Value: thematicInterestString }),
                new CognitoUserAttribute({ Name: 'custom:country', Value: countryString }),
                new CognitoUserAttribute({ Name: 'custom:timeframe', Value: timeframe }),
                new CognitoUserAttribute({ Name: 'custom:source_of_referral', Value: sourceOfReferral }),
              ];

              console.log('Thematic: ', thematicInterestString)
              console.log('Country: ', countryString)

              userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                  setError(err.message || 'An error occurred during sign-up.');
                  return;
                }
                const cognitoUser = result.user;
                console.log("Signup success:", cognitoUser.getUsername());
                setSuccess('Sign-up successful! Please check your email for a verification link and enter the SMS code sent to your phone number. You will be redirected shortly to complete phone verification.');
                sessionStorage.setItem("username", cognitoUser.getUsername());
                setTimeout(() => {
                  navigate("/verify-phone", { state: { username: cognitoUser.getUsername() } });
                }, 5000);
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
  // Academic Institution, Government, Implementing Partner, Non-government Organisation (NGO), Intergovernmental Organisation (IGO), Private Sector, Technical Partner, UN Agency
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
  // Agriculture / Food Security, Automated land cover mapping, Biodiversity Conservation, Crop Monitoring, Land Degradation, Precision Agriculture, Urban Expansion, Urban Planning, Urbanisation, Water Management, Water Resources Management, Wetlands
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
    { value: 'Ivory Coast', label: 'Ivory Coast' },
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
    { value: 'Zimbabwe', label: 'Zimbabwe' }
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
                  <span className="tooltip-text">Enter your phone number in E.164 format (e.g., +441234567890). The phone number will be used for multi-factor authentication.</span>
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
                value={thematicInterestOptions.filter(option => thematicInterest.includes(option.value))}
                onChange={(selected) => setThematicInterest(selected ? selected.map(opt => opt.value) : [])}
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
                value={countryOptions.filter(option => country.includes(option.value))}
                onChange={(selected) => setCountry(selected ? selected.map(opt => opt.value) : [])}
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
                  <span className="tooltip-text">*Anticipated timeframe for your use of the Sandbox.</span>
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
        {error && <p className="error-message" aria-live="polite">{error}</p>}
        {success && <p className="success-message" aria-live="polite">{success}</p>}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default SignUp;
