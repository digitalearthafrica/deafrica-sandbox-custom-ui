// custom-ui/src/components/VerifyPhone.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { CognitoUser } from "amazon-cognito-identity-js";
import { cognitoConfig } from "../cognito";

export default function VerifyPhone({ cfg }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const location = useLocation();

  // username passed from signup
  const username = location.state?.username;

  if (!username) {
    return <div>No username provided. Please go back to signup.</div>;
  }

  const userPool = cognitoConfig(cfg);

  const handleVerify = (e) => {
    e.preventDefault();

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.verifyAttribute("phone_number", code, (err, result) => {
      if (err) {
        console.error("Phone verification error:", err);
        setError(err.message || "Verification failed. Please try again.");
        return;
      }
      console.log("Phone verification result:", result);
      setSuccess("Phone verified successfully! Redirecting to login…");

      setTimeout(() => {
        window.location.replace(cfg.loginUrl); // redirect to Cognito Hosted UI login
      }, 3000);
    });
  };

  const handleResend = () => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.getAttributeVerificationCode("phone_number", {
      onSuccess: () => setSuccess("A new SMS code has been sent to your phone."),
      onFailure: (err) => setError(err.message || "Could not resend code. Try again."),
    });
  };

  return (
    <div className="verify-container">
      <h2>Verify Your Phone Number</h2>
      <p>
        Your email verification link has been sent.
        Now, please enter the SMS code sent to your phone number to complete the sign-up process.
      </p>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter SMS code"
          required
        />
        <button type="submit">Verify</button>
      </form>
      <button onClick={handleResend}>Resend Code</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
