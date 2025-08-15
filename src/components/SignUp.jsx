import React, { useState } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { getUserPool } from "../cognito";

export default function SignUp({ cfg }) {
  const pool = getUserPool(cfg);
  const [form, setForm] = useState({
    email: "",
    password: "",
    given_name: "",
    family_name: "",
    phone_number: "",
    gender: "",
    purpose: "",
    organization: "",
    country: ""
  });
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setMsg("");

    const attrs = [
      new CognitoUserAttribute({ Name: "email", Value: form.email }),
      new CognitoUserAttribute({ Name: "given_name", Value: form.given_name }),
      new CognitoUserAttribute({ Name: "family_name", Value: form.family_name }),
      new CognitoUserAttribute({ Name: "phone_number", Value: form.phone_number }),
      new CognitoUserAttribute({ Name: "gender", Value: form.gender }),
      new CognitoUserAttribute({ Name: "custom:purpose", Value: form.purpose }),
      new CognitoUserAttribute({ Name: "custom:organization", Value: form.organization }),
      new CognitoUserAttribute({ Name: "custom:country", Value: form.country })
    ];

    pool.signUp(form.email, form.password, attrs, null, (err, data) => {
      if (err) {
        setMsg(err.message || JSON.stringify(err));
        return;
      }
      setMsg(
        "Sign up successful. Please check your email to verify your account, then sign in."
      );
      console.log("signUp result:", data);
    });
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />

      <input name="given_name" placeholder="First name" value={form.given_name} onChange={onChange} required />
      <input name="family_name" placeholder="Last name" value={form.family_name} onChange={onChange} required />
      <input name="phone_number" placeholder="Phone (+12025550123)" value={form.phone_number} onChange={onChange} required />
      <label> Gender: <select name="gender" value={form.gender} onChange={onChange} required> <option value="">Select Gender</option> <option value="Male">Male</option> <option value="Female">Female</option> <option value="Other">Other</option> <option value="Prefer not to say">Prefer not to say</option> </select> </label>

      <input name="purpose" placeholder="Purpose" value={form.purpose} onChange={onChange} required />
      <input name="organization" placeholder="Organization" value={form.organization} onChange={onChange} required />
      <input name="country" placeholder="Country" value={form.country} onChange={onChange} required />

      <button type="submit">Create account</button>
      {msg && <div style={{ whiteSpace: "pre-wrap", color: "#333" }}>{msg}</div>}
    </form>
  );
}
