import React, { useState } from "react";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import Button from "../components/Buttons";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

const SetupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({ hasError: false, message: "" });
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);

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

  const handleSetup = async (e) => {
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

    setSubmitting(true);
    try {
      await axiosClient.post("/auth/setup", formData);
      setCredentials({
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate("/login", { replace: true });
      } else {
        setError({
          hasError: true,
          message: err.response?.data?.message || "Setup failed",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderRule = (label, met) => (
    <div className="flex items-center text-sm">
      {met ? (
        <FiCheckCircle size={16} className="text-green-500 mr-1" />
      ) : (
        <FiXCircle size={16} className="text-red-400 mr-1" />
      )}
      <span className={met ? "text-green-600" : "text-red-400"}>{label}</span>
    </div>
  );

  if (success && credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card type="custom" label="Setup Complete" hasError={false}>
          <div className="text-center space-y-4">
            <FiCheckCircle className="text-green-500 text-5xl mx-auto" />
            <h2 className="text-xl font-semibold">Super Admin Account Created</h2>
            <p className="text-gray-600">
              Save these credentials now. You won't see the password again.
            </p>
            <div className="bg-gray-100 p-4 rounded-md text-left space-y-2">
              <div>
                <span className="font-medium">Email:</span> {credentials.email}
              </div>
              <div>
                <span className="font-medium">Password:</span>{" "}
                <span className="font-mono bg-white px-2 py-1 rounded border">
                  {credentials.password}
                </span>
              </div>
            </div>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="z-0 relative min-h-screen flex-col flex justify-center items-center py-8">
      <Card type="custom" label="Create Super Admin" hasError={error.hasError}>
        <form onSubmit={handleSetup}>
          <TextInput
            label="Fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Administrator name"
            required
          />
          <TextInput
            label="Company Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@company.com"
            required
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 chars, letter + number"
            required
          />

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
            required
          />
          {error.hasError && (
            <div className="bg-red-200 p-2 rounded-md border border-red-300 mt-4 text-red-700 font-semibold">
              {error.message}
            </div>
          )}
          <Button className="mt-5 w-full" type="submit" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" /> Creating...
              </span>
            ) : (
              "Create Super Admin"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;
