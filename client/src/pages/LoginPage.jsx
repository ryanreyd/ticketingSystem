import React, { useState, useContext } from "react";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import Button from "../components/Buttons";
import { AuthContext } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";
import PatternBackground from "../components/PatternedBackground";
const LoginPage = () => {
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState({ hasError: false, message: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    setError({
      hasError: false,
      message: "",
    });
    e.preventDefault();
    try {
      const res = await axiosClient.post("auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.token) {
        login(res.data.token);
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      // Optional: show error to user
      setError({
        hasError: true,
        message: error.response?.data?.message,
      });
    }
  };

  return (
    <div className="z-0 relative min-h-screen flex-col flex justify-center items-center ">
      <PatternBackground
        lineColor={error.hasError ? "#C4332E" : "#B6B6B6"}
        lineThickness={1}
        squareSize={100}
        fadeStart={error.hasError ? 25 : 5}
        fadeEnd={100}
        coverage={error.hasError ? 90 : 70}
        shape="square"
      />
      {error.hasError ? (
        <div
          className={`z-20 bg-red-200 p-2 rounded-md border border-solid
      border-red-300  absolute shadow-lg  text-red-700 font-semibold ${
        error.hasError ? "  absolute shadow-lg top-1/4 duration-300 " : " "
      }`}
        >
          <h1>{error.message}</h1>
        </div>
      ) : (
        ""
      )}
      <form className="z-20" onSubmit={handleLogin}>
        <Card label="Login" hasError={error.hasError}>
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
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <Button type="submit">Login</Button>
          <span className="flex-1 py-1 text-center text-neutral-500">or</span>
          <Link
            to="/register"
            className="flex-1 text-center text-neutral-500 hover:text-blue-500"
          >
            Create new account
          </Link>
        </Card>
      </form>
    </div>
  );
};

export default LoginPage;
