import React from "react";
import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const EmptyState = ({ message = "No items found", description }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "250px",
        gap: 1,
        py: 6,
        textAlign: "center",
        width: "100%",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default EmptyState;
