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

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    
    if (!password) {
      newErrors.password = "Password is required.";
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
      // 1. Call login API
      const loginRes = await authApi.login({ email, password });
      const { accessToken, refreshToken } = loginRes;
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
      setError(err.message || "Invalid credentials.");
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sign in to your Mini 7-Eleven account
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>

        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          sx={{ mt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Don't have an account?
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            to="/register"
            sx={{
              color: "secondary.main",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Register here
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LoginPage;
