import React, { useState } from "react";
import { CognitoUserPool, CognitoUserAttribute } from "amazon-cognito-identity-js";
import "./SignUp.css";

const SignUp = ({ config }) => {
  const [form, setForm] = useState({
    given_name: "",
    family_name: "",
    email: "",
    password: "",
    phone_number: "",
    gender: "",
    purpose: "",
    organization: "",
    country: ""
  });

  const [msg, setMsg] = useState("");

  const cognitoLoginUrl = `https://${config.userPoolDomain}.auth.${config.region}.amazoncognito.com/login?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId
    });

    const attributeList = [
      new CognitoUserAttribute({ Name: "given_name", Value: form.given_name }),
      new CognitoUserAttribute({ Name: "family_name", Value: form.family_name }),
      new CognitoUserAttribute({ Name: "email", Value: form.email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: form.phone_number }),
      new CognitoUserAttribute({ Name: "gender", Value: form.gender }),
      new CognitoUserAttribute({ Name: "custom:purpose", Value: form.purpose }),
      new CognitoUserAttribute({ Name: "custom:organization", Value: form.organization }),
      new CognitoUserAttribute({ Name: "custom:country", Value: form.country })
    ];

    userPool.signUp(form.email, form.password, attributeList, null, (err) => {
      if (err) {
        if (err.code === "UsernameExistsException") {
          setMsg("⚠️ An account with this email already exists. Please sign in.");
        } else {
          setMsg(err.message || "Something went wrong. Please try again.");
        }
        return;
      }
      setMsg("✅ Sign up successful. Please check your email/SMS for verification.");
      // Optional: redirect to Cognito login
      // window.location.href = cognitoLoginUrl;
    });
  }; // <-- IMPORTANT: close onSubmit before return

  return (
    <div className="signup-container">
      <header className="brand">
        <h1>DEA Sandbox – Sign Up</h1>
      </header>

      <form onSubmit={onSubmit} className="signup-form">
        <label>First Name</label>
        <input name="given_name" value={form.given_name} onChange={onChange} required />

        <label>Last Name</label>
        <input name="family_name" value={form.family_name} onChange={onChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} required />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          required
          minLength={8}
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phone_number"
          placeholder="+12025550123"
          value={form.phone_number}
          onChange={onChange}
          required
          pattern="^\+[1-9]\d{1,14}$"
          title="Enter a valid phone number in E.164 format, e.g. +12025550123"
        />

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={onChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Purpose</label>
        <input name="purpose" value={form.purpose} onChange={onChange} required />

        <label>Organization</label>
        <input name="organization" value={form.organization} onChange={onChange} required />

        <label>Country</label>
        <input name="country" value={form.country} onChange={onChange} required />

        <button type="submit">Sign Up</button>
      </form>

      {msg && <p className="message">{msg}</p>}

      <p className="signin-link">
        Already have an account? <a href={cognitoLoginUrl}>Sign In here</a>
      </p>
    </div>
  );
};

export default SignUp;
