import React, { useState, useContext, useEffect } from "react";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import Button from "../components/Buttons";
import { AuthContext } from "../context/AuthContext";
import PatternBackground from "../components/PatternedBackground";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import axiosClient from "../api/axiosClient";

const RegisterPage = () => {
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
    branchId: "",
    viberPhone: "",
  });

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({ hasError: false, message: "" });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, branchRes] = await Promise.all([
          axiosClient.get("/departments?active=true"),
          axiosClient.get("/branches?active=true"),
        ]);
        setDepartments(deptRes.data);
        setBranches(branchRes.data);
      } catch {
        setError({
          hasError: true,
          message: "Failed to load registration options. Please refresh.",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

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

    setSubmitting(true);

    try {
      const result = await register(formData);

      if (!result.success) {
        setError({ hasError: true, message: result.message });
      }
    } catch (err) {
      setError({
        hasError: true,
        message: err.response?.data?.message || "Registration failed.",
      });
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

  if (loadingOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="z-0 relative min-h-screen flex-col flex justify-center items-center py-8">
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
        <div className="z-20 bg-red-200 p-2 rounded-md border border-red-300 mb-5 max-w-87.5 overflow-hidden shadow-lg text-red-700 font-semibold duration-300">
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
            required
          />
          <TextInput
            label="Company Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            required
          />

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-300 focus:border bg-white"
              required
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-300 focus:border bg-white"
              required
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <TextInput
            label="Viber Phone Number"
            name="viberPhone"
            type="tel"
            value={formData.viberPhone}
            onChange={handleChange}
            placeholder="09171234567"
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

          <Button className="mt-5 w-full" type="submit" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" /> Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
};

export default RegisterPage;
