import React, { useState, useRef, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

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
  const [thematicInterest, setThematicInterest] = useState('');
  const [country, setCountry] = useState('');
  const [sourceOfReferral, setSourceOfReferral] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null); // Ref for scrolling to top

  // Initialize CognitoUserPool with cfg prop
  const userPool = new CognitoUserPool(cfg);

  // Scroll to top when error or success state changes
  useEffect(() => {
    if ((error || success) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error, success]);

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const siteKey = cfg.recaptchaSiteKey;
    if (!siteKey) {
      console.error('reCAPTCHA site key is missing. Please set REACT_APP_RECAPTCHA_SITE_KEY in environment variables.');
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
    if (!email || !password || !givenName || !familyName || !organisation || !gender || !ageCategory || !phoneNumber || !organisationType || !thematicInterest || !country || !sourceOfReferral) {
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

              const attributeList = [
                { Name: 'given_name', Value: givenName },
                { Name: 'family_name', Value: familyName },
                { Name: 'gender', Value: gender },
                { Name: 'custom:age_category', Value: ageCategory },
                { Name: 'phone_number', Value: phoneNumber },
                { Name: 'custom:organization', Value: organisation },
                { Name: 'custom:organization_type', Value: organisationType },
                { Name: 'custom:thematic_interest', Value: thematicInterest },
                { Name: 'custom:country', Value: country },
                { Name: 'custom:source_of_referral', Value: sourceOfReferral },
              ];

              userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                  setError(err.message || 'An error occurred during sign-up.');
                  return;
                }
                setSuccess('Sign-up successful! Please check your email for verification.');
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
    { value: '', label: 'Select thematic interest' },
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
    { value: '', label: 'Select country' },
    { value: 'Afghanistan', label: 'Afghanistan' },
    { value: 'Albania', label: 'Albania' },
    { value: 'Algeria', label: 'Algeria' },
    { value: 'Andorra', label: 'Andorra' },
    { value: 'Angola', label: 'Angola' },
    { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Armenia', label: 'Armenia' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Austria', label: 'Austria' },
    { value: 'Azerbaijan', label: 'Azerbaijan' },
    { value: 'Bahamas', label: 'Bahamas' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Barbados', label: 'Barbados' },
    { value: 'Belarus', label: 'Belarus' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Belize', label: 'Belize' },
    { value: 'Benin', label: 'Benin' },
    { value: 'Bhutan', label: 'Bhutan' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Brunei', label: 'Brunei' },
    { value: 'Bulgaria', label: 'Bulgaria' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Burundi', label: 'Burundi' },
    { value: 'Cabo Verde', label: 'Cabo Verde' },
    { value: 'Cambodia', label: 'Cambodia' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Chad', label: 'Chad' },
    { value: 'Chile', label: 'Chile' },
    { value: 'China', label: 'China' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Comoros', label: 'Comoros' },
    { value: 'Congo', label: 'Congo' },
    { value: 'Costa Rica', label: 'Costa Rica' },
    { value: 'Croatia', label: 'Croatia' },
    { value: 'Cuba', label: 'Cuba' },
    { value: 'Cyprus', label: 'Cyprus' },
    { value: 'Czech Republic', label: 'Czech Republic' },
    { value: 'Democratic Republic of the Congo', label: 'Democratic Republic of the Congo' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Djibouti', label: 'Djibouti' },
    { value: 'Dominica', label: 'Dominica' },
    { value: 'Dominican Republic', label: 'Dominican Republic' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'El Salvador', label: 'El Salvador' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Estonia', label: 'Estonia' },
    { value: 'Eswatini', label: 'Eswatini' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Fiji', label: 'Fiji' },
    { value: 'Finland', label: 'Finland' },
    { value: 'France', label: 'France' },
    { value: 'Gabon', label: 'Gabon' },
    { value: 'Gambia', label: 'Gambia' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Greece', label: 'Greece' },
    { value: 'Grenada', label: 'Grenada' },
    { value: 'Guatemala', label: 'Guatemala' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
    { value: 'Guyana', label: 'Guyana' },
    { value: 'Haiti', label: 'Haiti' },
    { value: 'Honduras', label: 'Honduras' },
    { value: 'Hungary', label: 'Hungary' },
    { value: 'Iceland', label: 'Iceland' },
    { value: 'India', label: 'India' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Iran', label: 'Iran' },
    { value: 'Iraq', label: 'Iraq' },
    { value: 'Ireland', label: 'Ireland' },
    { value: 'Israel', label: 'Israel' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Jamaica', label: 'Jamaica' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Kazakhstan', label: 'Kazakhstan' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Kiribati', label: 'Kiribati' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
    { value: 'Laos', label: 'Laos' },
    { value: 'Latvia', label: 'Latvia' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Lesotho', label: 'Lesotho' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Libya', label: 'Libya' },
    { value: 'Liechtenstein', label: 'Liechtenstein' },
    { value: 'Lithuania', label: 'Lithuania' },
    { value: 'Luxembourg', label: 'Luxembourg' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Malawi', label: 'Malawi' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Maldives', label: 'Maldives' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Marshall Islands', label: 'Marshall Islands' },
    { value: 'Mauritania', label: 'Mauritania' },
    { value: 'Mauritius', label: 'Mauritius' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'Micronesia', label: 'Micronesia' },
    { value: 'Moldova', label: 'Moldova' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Mongolia', label: 'Mongolia' },
    { value: 'Montenegro', label: 'Montenegro' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Namibia', label: 'Namibia' },
    { value: 'Nauru', label: 'Nauru' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Nicaragua', label: 'Nicaragua' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'North Korea', label: 'North Korea' },
    { value: 'North Macedonia', label: 'North Macedonia' },
    { value: 'Norway', label: 'Norway' },
    { value: 'Oman', label: 'Oman' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Palau', label: 'Palau' },
    { value: 'Palestine', label: 'Palestine' },
    { value: 'Panama', label: 'Panama' },
    { value: 'Papua New Guinea', label: 'Papua New Guinea' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Peru', label: 'Peru' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Poland', label: 'Poland' },
    { value: 'Portugal', label: 'Portugal' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Romania', label: 'Romania' },
    { value: 'Russia', label: 'Russia' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
    { value: 'Saint Lucia', label: 'Saint Lucia' },
    { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines' },
    { value: 'Samoa', label: 'Samoa' },
    { value: 'San Marino', label: 'San Marino' },
    { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Serbia', label: 'Serbia' },
    { value: 'Seychelles', label: 'Seychelles' },
    { value: 'Sierra Leone', label: 'Sierra Leone' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Slovakia', label: 'Slovakia' },
    { value: 'Slovenia', label: 'Slovenia' },
    { value: 'Solomon Islands', label: 'Solomon Islands' },
    { value: 'Somalia', label: 'Somalia' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'South Sudan', label: 'South Sudan' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Sudan', label: 'Sudan' },
    { value: 'Suriname', label: 'Suriname' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Syria', label: 'Syria' },
    { value: 'Taiwan', label: 'Taiwan' },
    { value: 'Tajikistan', label: 'Tajikistan' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Timor-Leste', label: 'Timor-Leste' },
    { value: 'Togo', label: 'Togo' },
    { value: 'Tonga', label: 'Tonga' },
    { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
    { value: 'Tunisia', label: 'Tunisia' },
    { value: 'Turkey', label: 'Turkey' },
    { value: 'Turkmenistan', label: 'Turkmenistan' },
    { value: 'Tuvalu', label: 'Tuvalu' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Ukraine', label: 'Ukraine' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'United States', label: 'United States' },
    { value: 'Uruguay', label: 'Uruguay' },
    { value: 'Uzbekistan', label: 'Uzbekistan' },
    { value: 'Vanuatu', label: 'Vanuatu' },
    { value: 'Vatican City', label: 'Vatican City' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Yemen', label: 'Yemen' },
    { value: 'Zambia', label: 'Zambia' },
    { value: 'Zimbabwe', label: 'Zimbabwe' },
  ];

  // Options for referral source
  const sourceOfReferralOptions = [
    { value: '', label: 'Select referral source' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Google search', label: 'Google search' },
    { value: 'Previous user', label: 'Previous user' },
    { value: 'Training event', label: 'Training event' },
    { value: 'Word of mouth', label: 'Word of mouth' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="signup-container" ref={formRef}>
      <h2>Create Your Account</h2>
      {error && <p className="error-message" aria-live="polite">{error}</p>}
      {success && <p className="success-message" aria-live="polite">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Given Name *</label>
              <input type="text" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Family Name *</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Age Category *</label>
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
              <label>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
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
              <label>Organisation *</label>
              <input type="text" value={organisation} onChange={(e) => setOrganisation(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Organisation Type *</label>
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
              <label>Thematic Interest *</label>
              <select value={thematicInterest} onChange={(e) => setThematicInterest(e.target.value)} required>
                {thematicInterestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Country *</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} required>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>How did you hear about DE Africa? *</label>
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
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default SignUp;
