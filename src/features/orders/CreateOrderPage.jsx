import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stack,
  Alert,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { productApi } from "../../api/productApi";
import { addressApi } from "../../api/addressApi";
import { walletApi } from "../../api/walletApi";
import { orderApi } from "../../api/orderApi";
import { formatCurrency } from "../../utils/format";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import PageHeader from "../../components/PageHeader";

const CreateOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract checkout items from navigation state
  const { productId, quantity } = location.state || {};

  const [product, setProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Order Fields State
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  
  // Submit state
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!productId || !quantity) {
      setError("No product selected. Please return to the store catalog.");
      setLoading(false);
      return;
    }
    fetchOrderDetails();
  }, [productId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch product details
      const prodRes = await productApi.getProductById(productId);
      setProduct(prodRes);

      // 2. Fetch addresses
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

      // 3. Fetch wallet details
      try {
        const walletData = await walletApi.getMyWallet();
        setWallet(walletData);
      } catch (err) {
        // If no wallet exists, keep wallet state null (payment option can be disabled or prompt to open)
        console.warn("User has no wallet yet.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load checkout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (!selectedAddressId) {
      setSubmitError("Please select a delivery address.");
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setSubmitError("Quantity must be greater than 0.");
      return;
    }

    if (product && product.stockQuantity !== undefined && parseInt(quantity) > product.stockQuantity) {
      setSubmitError(`Requested quantity exceeds available stock (${product.stockQuantity} items).`);
      return;
    }

    const subtotal = (product?.price || 0) * (quantity || 0);

    // Validate wallet balance if selected
    if (paymentMethod === "WALLET") {
      if (!wallet) {
        setSubmitError("You do not have a store wallet yet. Please open a wallet first.");
        return;
      }
      if (wallet.balance < subtotal) {
        setSubmitError("Insufficient balance in your store wallet. Please top up or choose a different payment method.");
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const payload = {
        addressId: parseInt(selectedAddressId),
        paymentMethod,
        items: [
          {
            productId: parseInt(productId),
            quantity: parseInt(quantity),
          },
        ],
      };

      const result = await orderApi.createOrder(payload);
      
      // Dispatch event to notify top bar wallet balance to refresh
      window.dispatchEvent(new CustomEvent("wallet-updated"));

      // On success, navigate to order history
      if (result && result.id) {
        navigate(`/my-orders/${result.id}`);
      } else {
        navigate("/my-orders");
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to place order.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingState message="Preparing checkout details..." />;
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <ErrorState message={error} />
        <Button variant="contained" component={Link} to="/products" sx={{ mt: 2 }}>
          Back to Store
        </Button>
      </Box>
    );
  }

  const subtotal = (product?.price || 0) * (quantity || 0);

  return (
    <Box>
      <PageHeader title="Checkout" subtitle="Review your items, select an address, and choose a payment method." />

      {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

      <Grid container spacing={4}>
        {/* Left Side: Address & Payment */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* 1. Address Card */}
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

            {/* 2. Payment Method Card */}
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
                <ReceiptIcon color="primary" /> Order Summary
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "70%" }}>
                    {product?.name} x <strong>{quantity}</strong>
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency((product?.price || 0) * (quantity || 0))}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" fontWeight={700}>
                    Total amount
                  </Typography>
                  <Typography variant="h6" fontWeight={850} color="secondary.main">
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={submitLoading || !selectedAddressId}
                onClick={handleSubmit}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateOrderPage;
