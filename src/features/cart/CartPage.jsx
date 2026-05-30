import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stack,
  Alert,
  Box,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  TextField,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "../../context/CartContext";
import { addressApi } from "../../api/addressApi";
import { walletApi } from "../../api/walletApi";
import { orderApi } from "../../api/orderApi";
import { formatCurrency } from "../../utils/format";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Checkout Form States
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  
  // Submit states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchCheckoutDetails();
  }, []);

  const fetchCheckoutDetails = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch addresses
      const addrRes = await addressApi.getAddresses();
      const addrList = Array.isArray(addrRes) ? addrRes : addrRes.content || [];
      setAddresses(addrList);

      // Select default address if available
      const defaultAddr = addrList.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }

      // 2. Fetch wallet details
      try {
        const walletData = await walletApi.getMyWallet();
        setWallet(walletData);
      } catch (err) {
        console.warn("User has no wallet opened yet.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load checkout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setSubmitError("");
    setValidationErrors({});

    if (cartItems.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      setSubmitError("Please select a delivery address.");
      return;
    }

    // Validate wallet balance if selected
    if (paymentMethod === "WALLET") {
      if (!wallet) {
        setSubmitError("You do not have a store wallet yet. Please open a wallet first.");
        return;
      }
      if (wallet.balance < cartTotal) {
        setSubmitError("Insufficient balance in your store wallet. Please top up or choose a different payment method.");
        return;
      }
    }

    // Verify quantities against stock limits
    const stockErrors = {};
    cartItems.forEach((item) => {
      if (item.stockQuantity !== undefined && item.quantity > item.stockQuantity) {
        stockErrors[item.productId] = `Only ${item.stockQuantity} items in stock.`;
      }
    });

    if (Object.keys(stockErrors).length > 0) {
      setValidationErrors(stockErrors);
      setSubmitError("Some items exceed available stock. Please adjust quantities.");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        addressId: parseInt(selectedAddressId),
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
        })),
      };

      const result = await orderApi.createOrder(payload);
      
      // Clear cart on successful order placement
      clearCart();

      // Dispatch event to notify top bar wallet balance to refresh
      window.dispatchEvent(new CustomEvent("wallet-updated"));

      // Navigate to order history or details
      if (result && result.id) {
        navigate(`/my-orders/${result.id}`);
      } else {
        navigate("/my-orders");
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to place order.");
      if (err.errors) {
        setValidationErrors(err.errors);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingState message="Setting up checkout table..." />;

  return (
    <Box>
      <PageHeader
        title="My Cart"
        subtitle="Manage selected products, select delivery address, and proceed to checkout."
      />

      {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

      {cartItems.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Stack spacing={2} alignItems="center">
            <ShoppingCartIcon sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography variant="h5" fontWeight={700}>
              Your Cart is Empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse our products and add them to your cart to checkout.
            </Typography>
            <Button variant="contained" component={Link} to="/products" sx={{ mt: 1 }}>
              Shop Products
            </Button>
          </Stack>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {/* Left Side: Cart Items Table, Address, and Payment */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* 1. Cart Items List */}
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight={750} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ShoppingCartIcon color="primary" /> Shopping Cart ({cartCount} Items)
                    </Typography>
                    <Button color="error" variant="outlined" size="small" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </Box>
                  <Divider />
                  
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead sx={{ bgcolor: "action.hover" }}>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Price</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow key={item.productId} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                {item.imageUrl ? (
                                  <Box
                                    component="img"
                                    src={item.imageUrl}
                                    alt={item.name}
                                    sx={{ width: 50, height: 50, objectFit: "cover", borderRadius: 1 }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=400";
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      bgcolor: "action.selected",
                                      borderRadius: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <ShoppingCartIcon fontSize="small" color="disabled" />
                                  </Box>
                                )}
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.name}
                                  </Typography>
                                  {item.stockQuantity !== undefined && (
                                    <Typography variant="caption" color={item.stockQuantity <= 0 ? "error.main" : "text.secondary"}>
                                      Stock: {item.stockQuantity} available
                                    </Typography>
                                  )}
                                  {validationErrors[item.productId] && (
                                    <Typography variant="caption" color="error.main" display="block" sx={{ fontWeight: 600 }}>
                                      {validationErrors[item.productId]}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography sx={{ width: 30, textAlign: "center", fontWeight: 700 }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  disabled={item.stockQuantity !== undefined && item.quantity >= item.stockQuantity}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "secondary.main" }}>
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton color="error" size="small" onClick={() => removeFromCart(item.productId)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* 2. Address Select Card */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={750} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon color="primary" /> Delivery Address
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {addresses.length === 0 ? (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography color="text.secondary" gutterBottom>
                        You don't have any delivery addresses yet.
                      </Typography>
                      <Button variant="outlined" component={Link} to="/addresses">
                        Manage Addresses
                      </Button>
                    </Box>
                  ) : (
                    <FormControl component="fieldset" sx={{ width: "100%" }}>
                      <RadioGroup
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                      >
                        <Stack spacing={2}>
                          {addresses.map((addr) => (
                            <Card
                              key={addr.id}
                              variant="outlined"
                              sx={{
                                p: 2,
                                border: selectedAddressId === String(addr.id) ? "2px solid #00843D" : "1px solid #e9ecef",
                                cursor: "pointer",
                              }}
                              onClick={() => setSelectedAddressId(String(addr.id))}
                            >
                              <FormControlLabel
                                value={String(addr.id)}
                                control={<Radio color="primary" />}
                                label={
                                  <Box sx={{ ml: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                      {addr.receiverName} ({addr.phoneNumber})
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0, alignItems: "flex-start" }}
                              />
                            </Card>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  )}
                </CardContent>
              </Card>

              {/* 3. Payment Method Card */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={750} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <PaymentIcon color="primary" /> Payment Method
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Stack spacing={2}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            border: paymentMethod === "WALLET" ? "2px solid #00843D" : "1px solid #e9ecef",
                            cursor: "pointer",
                          }}
                          onClick={() => setPaymentMethod("WALLET")}
                        >
                          <FormControlLabel
                            value="WALLET"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Store Wallet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Pay securely with your 7-Eleven digital balance.
                                </Typography>
                                {wallet ? (
                                  <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, mt: 0.5, display: "block" }}>
                                    Current Balance: {formatCurrency(wallet.balance)}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600, mt: 0.5, display: "block" }}>
                                    Wallet not opened yet. <Link to="/wallet" style={{ color: "inherit", decoration: "underline" }}>Open now</Link>.
                                  </Typography>
                                )}
                              </Box>
                            }
                            sx={{ m: 0, alignItems: "flex-start" }}
                          />
                        </Card>

                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            border: paymentMethod === "CASH_ON_DELIVERY" ? "2px solid #00843D" : "1px solid #e9ecef",
                            cursor: "pointer",
                          }}
                          onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                        >
                          <FormControlLabel
                            value="CASH_ON_DELIVERY"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Cash On Delivery (COD)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Pay in cash to the carrier upon receiving.
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, alignItems: "flex-start" }}
                          />
                        </Card>

                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            border: paymentMethod === "CASH_AT_STORE" ? "2px solid #00843D" : "1px solid #e9ecef",
                            cursor: "pointer",
                          }}
                          onClick={() => setPaymentMethod("CASH_AT_STORE")}
                        >
                          <FormControlLabel
                            value="CASH_AT_STORE"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Pay at Store
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Pay cash directly when collecting your items from the shop counter.
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, alignItems: "flex-start" }}
                          />
                        </Card>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Side: Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: "sticky", top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  Checkout Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal ({cartCount} Items)
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(cartTotal)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping Fee
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Free
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" fontWeight={700}>
                      Total Price
                    </Typography>
                    <Typography variant="h6" fontWeight={850} color="secondary.main">
                      {formatCurrency(cartTotal)}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={submitLoading || cartItems.length === 0 || !selectedAddressId}
                  onClick={handleCheckout}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CartPage;
