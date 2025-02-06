import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const HomePage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: null,
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat-app"); // Replace with your Cloudinary preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/db84ew3bf/image/upload",
        formData
      );
      setLoading(false);
      return response.data.secure_url;
    } catch (error) {
      setLoading(false);
      toast.error("Image upload failed!");
      return null;
    }
  };

  // Signup Function
  const handleSignup = async () => {
    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword
    ) {
      toast.error("All fields are required!");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    let imageUrl = "";
    if (signupData.pic) {
      imageUrl = await uploadImage(signupData.pic);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/user", {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        pic: imageUrl,
      });

      toast.success("Signup successful! Redirecting...");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  // Login Function
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error("Email and password are required!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/user/login",
        loginData
      );

      toast.success("Login successful! Redirecting...");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFD95F",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          width: 400,
          bgcolor: "white",
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* Tabs for Login & Signup */}
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Signup" />
        </Tabs>

        {tabIndex === 0 ? (
          // Login Form
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </Box>
        ) : (
          // Signup Form
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={signupData.confirmPassword}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  confirmPassword: e.target.value,
                })
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSignupData({ ...signupData, pic: e.target.files[0] })
              }
              style={{ marginTop: "10px" }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
