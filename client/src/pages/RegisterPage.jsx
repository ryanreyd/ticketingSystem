import React, { useState, useContext } from "react";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import Button from "../components/Buttons";
import { AuthContext } from "../context/AuthContext";
import PatternBackground from "../components/PatternedBackground";
import { CheckCircle, XCircle } from "react-feather"; // small icon lib
import RadioGroup from "../components/RadioGroup";

const RegisterPage = () => {
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // default role
  });

  const [error, setError] = useState({ hasError: false, message: "" });

  // Password requirement states
  const passwordRules = {
    minLength: formData.password.length >= 6,
    hasLetter: /[A-Za-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    match:
      formData.password !== "" &&
      formData.password === formData.confirmPassword,
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError({ hasError: false, message: "" });

    const failedRules = [];

    if (!passwordRules.minLength) {
      failedRules.push("at least 6 characters");
    }
    if (!passwordRules.hasLetter) {
      failedRules.push("a letter");
    }
    if (!passwordRules.hasNumber) {
      failedRules.push("a number");
    }
    if (!passwordRules.match) {
      failedRules.push("both passwords to match");
    }

    if (failedRules.length > 0) {
      return setError({
        hasError: true,
        message: `Password must contain ${failedRules
          .join(", ")
          .replace(/,([^,]*)$/, " and$1")}.`,
      });
    }

    try {
      const result = await register(formData); // ✅ pass the whole object

      if (!result.success) {
        setError({ hasError: true, message: result.message });
      }
    } catch (err) {
      setError({
        hasError: true,
        message: err.response?.data?.message || "Registration failed.",
      });
    }
  };

  const renderRule = (label, met) => (
    <div className="flex items-center text-sm">
      {met ? (
        <CheckCircle size={16} className="text-green-500 mr-1" />
      ) : (
        <XCircle size={16} className="text-red-400 mr-1" />
      )}
      <span className={met ? "text-green-600" : "text-red-400"}>{label}</span>
    </div>
  );

  return (
    <div className="z-0 relative min-h-screen flex-col flex justify-center items-center">
      <PatternBackground
        lineColor={error.hasError ? "#C4332E" : "#B6B6B6"}
        lineThickness={1}
        squareSize={100}
        fadeStart={error.hasError ? 25 : 5}
        fadeEnd={100}
        coverage={error.hasError ? 90 : 70}
        shape="square"
      />

      {error.hasError && (
        <div className="z-20 bg-red-200 p-2 rounded-md border border-red-300 mb-5 max-w-[350px] overflow-hidden shadow-lg text-red-700 font-semibold duration-300">
          <h1>{error.message}</h1>
        </div>
      )}

      <form className="z-20" onSubmit={handleRegister}>
        <Card type="custom" label="Create account" hasError={error.hasError}>
          <TextInput
            label="Fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          {/* Password requirements */}
          <div className="mt-2 mb-4 space-y-1">
            {renderRule("At least 6 characters", passwordRules.minLength)}
            {renderRule("Contains a letter", passwordRules.hasLetter)}
            {renderRule("Contains a number", passwordRules.hasNumber)}
            {renderRule("Passwords match", passwordRules.match)}
          </div>

          <TextInput
            label="Re-type password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />

          <form>
            <RadioGroup
              label="Role"
              name="role"
              value={formData.role}
              className=""
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "support", label: "Support" },
              ]}
              onChange={handleChange}
            />
          </form>

          <Button className="mt-5" type="submit">
            Create
          </Button>
        </Card>
      </form>
    </div>
  );
};

export default RegisterPage;
