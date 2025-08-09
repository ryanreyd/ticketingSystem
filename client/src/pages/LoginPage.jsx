import React, { useState, useContext } from "react";
import Card from "../components/Card";
import TextInput from "../components/TextInput";
import Button from "../components/Buttons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const LoginPage = () => {
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
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
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F3F5F7]">
      <form onSubmit={handleLogin}>
        <Card label="Login">
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
        </Card>
      </form>
    </div>
  );
};

export default LoginPage;
