import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import HistoryIcon from "@mui/icons-material/History";
import { walletApi } from "../../api/walletApi";
import { formatCurrency, formatDateTime } from "../../utils/format";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import PageHeader from "../../components/PageHeader";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noWallet, setNoWallet] = useState(false);

  // Top up state
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDesc, setTopUpDesc] = useState("");
  const [topUpError, setTopUpError] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWalletAndTransactions();
  }, []);

  const fetchWalletAndTransactions = async () => {
    setLoading(true);
    setError("");
    setNoWallet(false);
    try {
      // 1. Fetch current wallet
      try {
        const walletData = await walletApi.getMyWallet();
        setWallet(walletData);

        // 2. If wallet exists, fetch transactions
        const txRes = await walletApi.getTransactions({ page: 0, size: 50 });
        const txList = Array.isArray(txRes) ? txRes : txRes.content || [];
        setTransactions(txList);
      } catch (err) {
        // If 404 or error status indicates no wallet, handle onboarding flow
        if (err.status === 404 || err.message?.toLowerCase().includes("not found")) {
          setNoWallet(true);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load wallet details.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWallet = async () => {
    setLoading(true);
    setError("");
    try {
      await walletApi.openWallet();
      fetchWalletAndTransactions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to open wallet. Try again later.");
      setLoading(false);
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setTopUpError("");
    setErrors({});

    const amountNum = parseFloat(topUpAmount);
    const newErrors = {};
    if (topUpAmount === "" || isNaN(amountNum)) {
      newErrors.topUpAmount = "Top-up amount is required.";
    } else if (amountNum <= 0) {
      newErrors.topUpAmount = "Top-up amount must be greater than 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTopUpError("Please fix the validation errors below.");
      return;
    }

    setTopUpLoading(true);
    try {
      const payload = {
        amount: amountNum,
        description: topUpDesc || "Wallet Top Up",
      };
      await walletApi.topUp(payload);
      setTopUpAmount("");
      setTopUpDesc("");
      setErrors({});
      fetchWalletAndTransactions();
      
      // Dispatch a custom event to notify MainLayout to refresh the balance!
      // This satisfies Requirement 5: "dispatch a custom event like wallet-updated after top-up/checkout and listen in MainLayout."
      window.dispatchEvent(new CustomEvent("wallet-updated"));
    } catch (err) {
      console.error(err);
      setTopUpError(err.message || "Top-up failed.");
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) return <LoadingState message="Connecting to secure wallet..." />;
  if (error) return <ErrorState message={error} onRetry={fetchWalletAndTransactions} />;

  // Wallet onboarding flow (not opened yet)
  if (noWallet) {
    return (
      <Box sx={{ maxWidth: 500, mx: "auto", mt: 6, textAlign: "center" }}>
        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3} alignItems="center">
            <Avatar sx={{ width: 80, height: 80, bgcolor: "rgba(0, 132, 61, 0.1)", color: "primary.main" }}>
              <WalletIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Open Your Store Wallet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep cash in your digital store wallet for swift and safe checkout. Easily top up and get immediate refunds.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleOpenWallet}
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              Open Digital Wallet
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="My Wallet" subtitle="Check your balance, top up, and review transaction logs." />

      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #00843D 0%, #005c2a 100%)",
              color: "#ffffff",
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background design accents */}
            <Box
              sx={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "-30px",
                left: "-30px",
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.03)",
              }}
            />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.8 }}>
                  7-Eleven Store Wallet
                </Typography>
                <WalletIcon sx={{ fontSize: 32, opacity: 0.9 }} />
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Secure Payment Balance
              </Typography>
            </Box>

            <Box sx={{ my: 4 }}>
              <Typography variant="h3" fontWeight={850}>
                {formatCurrency(wallet?.balance || 0)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Wallet ID: {wallet?.id || "N/A"}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Top-up Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <AddCardIcon color="primary" /> Quick Top-Up
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleTopUpSubmit} noValidate>
                <Stack spacing={3}>
                  {topUpError && <Alert severity="error">{topUpError}</Alert>}

                  <TextField
                    label="Amount (VND)"
                    type="number"
                    required
                    fullWidth
                    value={topUpAmount}
                    onChange={(e) => {
                      setTopUpAmount(e.target.value);
                      if (errors.topUpAmount) setErrors({ ...errors, topUpAmount: "" });
                    }}
                    error={!!errors.topUpAmount}
                    helperText={errors.topUpAmount}
                    disabled={topUpLoading}
                    placeholder="e.g., 50000"
                  />

                  <TextField
                    label="Description"
                    fullWidth
                    value={topUpDesc}
                    onChange={(e) => setTopUpDesc(e.target.value)}
                    disabled={topUpLoading}
                    placeholder="e.g., Weekly store fund"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    disabled={topUpLoading}
                  >
                    Proceed Top Up
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={750} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon color="primary" /> Transaction logs
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {transactions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No transactions logged yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const isCredit =
                      tx.type === "TOP_UP" ||
                      tx.type === "RECEIVE_PAYMENT" ||
                      tx.type === "REFUND";
                    return (
                      <TableRow key={tx.id} hover>
                        <TableCell>{tx.id}</TableCell>
                        <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                        <TableCell>
                          <StatusChip status={tx.type} type="transaction" />
                        </TableCell>
                        <TableCell>{tx.description || "N/A"}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color: isCredit ? "success.main" : "error.main",
                          }}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WalletPage;
