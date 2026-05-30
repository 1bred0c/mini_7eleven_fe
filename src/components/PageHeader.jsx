import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        width: "100%",
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
