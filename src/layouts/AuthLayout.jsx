import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Box, Card, Typography, Container, Stack } from "@mui/material";
import { isLoggedIn, isAdmin } from "../utils/auth";

const AuthLayout = () => {
  if (isLoggedIn()) {
    return isAdmin() ? (
      <Navigate to="/admin/products" replace />
    ) : (
      <Navigate to="/products" replace />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} alignItems="center">
          {/* 7-Eleven Mini Brand Logo */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 20,
                border: "3px solid #F26522",
              }}
            >
              7
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: "primary.main", letterSpacing: 0.5 }}
            >
              ELEVEN <span style={{ color: "#F26522" }}>MINI</span>
            </Typography>
          </Stack>

          <Card sx={{ p: 4, width: "100%" }}>
            <Outlet />
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default AuthLayout;
