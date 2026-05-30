import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryIcon from "@mui/icons-material/Category";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { getCurrentAccount, getRefreshToken, clearAuth } from "../utils/auth";
import { authApi } from "../api/authApi";

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = getCurrentAccount() || { fullName: "Admin", email: "" };
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      await authApi.logout(refreshToken);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const menuItems = [
    { text: "Products", path: "/admin/products", icon: <StorefrontIcon /> },
    { text: "Categories", path: "/admin/categories", icon: <CategoryIcon /> },
    { text: "Orders", path: "/admin/orders", icon: <ReceiptIcon /> },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header in Drawer */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            border: "2px solid #F26522",
          }}
        >
          7
        </Box>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          7-11 <span style={{ color: "#F26522" }}>ADMIN</span>
        </Typography>
      </Box>
      <Divider />

      {/* Main Admin Menu */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  color: isActive ? "primary.main" : "text.secondary",
                  backgroundColor: isActive ? "rgba(0, 132, 61, 0.08)" : "transparent",
                  "& .MuiListItemIcon-root": {
                    color: isActive ? "primary.main" : "text.secondary",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(0, 132, 61, 0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={isActive ? 700 : 500}>
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Drawer Footer Actions */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            to="/products"
            sx={{ borderRadius: 2, color: "text.secondary" }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Back to Store" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              "& .MuiListItemIcon-root": { color: "error.main" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            {location.pathname.includes("/products")
              ? "Product Management"
              : location.pathname.includes("/categories")
              ? "Category Management"
              : location.pathname.includes("/orders")
              ? "Order Management"
              : "Admin Dashboard"}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {account.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {account.email}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              {account.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="admin nav"
      >
        {/* Temporary Drawer for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Permanent Drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid #e9ecef",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: "background.default",
          mt: "64px",
        }}
      >
        <Container maxWidth="lg" disableGutters sx={{ py: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
