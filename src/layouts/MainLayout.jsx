import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Divider,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocationIcon from "@mui/icons-material/LocationOn";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getCurrentAccount, getRefreshToken, clearAuth } from "../utils/auth";
import { authApi } from "../api/authApi";
import { useCart } from "../context/CartContext";
import { walletApi } from "../api/walletApi";
import { formatCurrency } from "../utils/format";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const account = getCurrentAccount() || { fullName: "User", email: "", role: "USER" };
  const { cartCount } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);

  // Wallet Balance top-bar integration
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletStatus, setWalletStatus] = useState("loading"); // "loading", "active", "not_opened", "error"

  const fetchWalletBalance = async () => {
    if (!account || account.role !== "USER") return;
    try {
      const w = await walletApi.getMyWallet();
      setWalletBalance(w.balance);
      setWalletStatus("active");
    } catch (err) {
      if (err.status === 404 || err.message?.toLowerCase().includes("not found")) {
        setWalletStatus("not_opened");
      } else {
        setWalletStatus("error");
      }
    }
  };

  useEffect(() => {
    fetchWalletBalance();

    const handleWalletUpdate = () => {
      fetchWalletBalance();
    };

    window.addEventListener("wallet-updated", handleWalletUpdate);
    return () => {
      window.removeEventListener("wallet-updated", handleWalletUpdate);
    };
  }, []);

  // Also refresh wallet balance on route changes to keep it in sync
  useEffect(() => {
    fetchWalletBalance();
  }, [location.pathname]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuEl(null);
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

  const navItems = [
    { label: "Products", path: "/products", icon: <StorefrontIcon fontSize="small" /> },
    { label: "My Orders", path: "/my-orders", icon: <ShoppingBagIcon fontSize="small" /> },
    { label: "Wallet", path: "/wallet", icon: <WalletIcon fontSize="small" /> },
    { label: "Addresses", path: "/addresses", icon: <LocationIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* Brand Logo */}
            <Link
              to="/products"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
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
                <Typography
                  variant="h6"
                  noWrap
                  fontWeight={800}
                  sx={{
                    display: { xs: "none", sm: "block" },
                    color: "primary.main",
                    letterSpacing: 0.5,
                  }}
                >
                  ELEVEN <span style={{ color: "#F26522" }}>MINI</span>
                </Typography>
              </Stack>
            </Link>

            {/* Desktop Nav Items */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? "primary.main" : "text.secondary",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "rgba(0, 132, 61, 0.08)" : "transparent",
                      px: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 132, 61, 0.04)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* User Info & Avatar */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {account.role === "USER" && (
                <Button
                  component={Link}
                  to="/wallet"
                  startIcon={<WalletIcon fontSize="small" />}
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    color: "primary.main",
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: "rgba(0, 132, 61, 0.05)",
                    border: "1px solid rgba(0, 132, 61, 0.15)",
                    borderRadius: "8px",
                    px: 1.5,
                    fontSize: "0.85rem",
                    "&:hover": {
                      bgcolor: "rgba(0, 132, 61, 0.1)",
                    }
                  }}
                >
                  {walletStatus === "active"
                    ? `Wallet: ${formatCurrency(walletBalance)}`
                    : walletStatus === "not_opened"
                    ? "Wallet: Not opened"
                    : walletStatus === "error"
                    ? "Wallet: --"
                    : "Wallet: Loading..."}
                </Button>
              )}

              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                sx={{
                  color: location.pathname === "/cart" ? "primary.main" : "text.secondary",
                  bgcolor: location.pathname === "/cart" ? "rgba(0, 132, 61, 0.08)" : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(0, 132, 61, 0.04)",
                  },
                }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{ display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>

              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" fontWeight={600}>
                  {account.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {account.email}
                </Typography>
              </Box>

              <IconButton
                size="large"
                edge="end"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "secondary.main",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  {account.fullName?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Stack>

            {/* Account Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 220,
                  overflow: "visible",
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.08)",
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {account.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {account.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    px: 0.8,
                    py: 0.2,
                    bgcolor: "rgba(0, 132, 61, 0.1)",
                    color: "primary.main",
                    borderRadius: 1,
                    display: "inline-block",
                    fontWeight: 600,
                  }}
                >
                  Role: {account.role}
                </Typography>
              </Box>
              <Divider />
              {account.role === "ADMIN" && (
                <MenuItem
                  component={Link}
                  to="/admin/products"
                  onClick={handleMenuClose}
                >
                  <StorefrontIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem component={Link} to="/wallet" onClick={handleMenuClose}>
                <WalletIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
                My Wallet
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleLogout();
                }}
                sx={{ color: "error.main" }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>

            {/* Mobile Dropdown Nav */}
            <Menu
              anchorEl={mobileMenuEl}
              open={Boolean(mobileMenuEl)}
              onClose={handleMobileMenuClose}
              transformOrigin={{ horizontal: "left", vertical: "top" }}
              anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 200,
                  borderRadius: 2,
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.label}
                  component={Link}
                  to={item.path}
                  onClick={handleMobileMenuClose}
                  selected={location.pathname.startsWith(item.path)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {item.icon}
                    {item.label}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e9ecef",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Mini 7-Eleven Convenience Store Ordering System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
