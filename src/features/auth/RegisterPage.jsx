import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { authApi } from "../../api/authApi";
import { setTokens, setCurrentAccount } from "../../utils/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Please fix the validation errors below.");
      return;
    }

    setError("");
    setErrors({});
    setLoading(true);
    try {
      // 1. Call register API
      const registerRes = await authApi.register({ fullName, email, password });
      const { accessToken, refreshToken } = registerRes;
      setTokens(accessToken, refreshToken);

      // 2. Call me API for profile info
      const account = await authApi.me();
      setCurrentAccount(account);

      // 3. Redirect by role
      if (account.role === "ADMIN") {
        navigate("/admin/products");
      } else {
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Try again.");
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Join Mini 7-Eleven Convenience Store
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Full Name"
          fullWidth
          required
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: "" });
          }}
          error={!!errors.fullName}
          helperText={errors.fullName}
          disabled={loading}
        />

        <TextField
          label="Email Address"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ py: 1.2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
        </Button>

        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          sx={{ mt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            to="/login"
            sx={{
              color: "secondary.main",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Login here
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default RegisterPage;
