import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import { orderApi } from "../../api/orderApi";
import { formatCurrency, formatDateTime } from "../../utils/format";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import ConfirmDialog from "../../components/ConfirmDialog";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel action state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await orderApi.getMyOrderById(id);
      setOrder(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      await orderApi.cancelMyOrder(id);
      setCancelOpen(false);
      fetchOrder(); // refresh order details
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to cancel order.");
      setCancelOpen(false);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading order details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOrder} />;
  if (!order) return <ErrorState message="Order not found." />;

  // Cancellation is only allowed if status is PENDING
  const isCancellable = order.status === "PENDING";

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          onClick={() => navigate("/my-orders")}
          sx={{ cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: "inherit" }} /> My Orders
        </MuiLink>
        <Typography color="text.primary">Order #{order.id}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={850} sx={{ mb: 4 }}>
        Order Details
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Items & Summary */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Items Card */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                  Ordered Items
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  {order.items?.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.productName || item.product?.name || `Product ID: ${item.productId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity} x {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={750}>
                        {formatCurrency(item.subtotal)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Billing Details */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                  Metadata Info
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Placed At
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDateTime(order.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Payment Mode
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: "capitalize" }}>
                      {order.paymentMethod?.replace(/_/g, " ")}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side: Status, Shipping & Cancel Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Status Card */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                  Status Overview
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                    <StatusChip status={order.status} type="status" />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                    <StatusChip status={order.paymentStatus} type="payment" />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" fontWeight={700}>Total Paid:</Typography>
                    <Typography variant="h6" fontWeight={850} color="secondary.main">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Shipping Destination */}
            {/* Shipping Destination */}
<Card>
  <CardContent sx={{ p: 3 }}>
    <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
      Delivery Address
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={700}>
        {order.customerName}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Phone: {order.phoneNumber}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {order.address}
      </Typography>
    </Stack>
  </CardContent>
</Card>

            {/* Cancel Button */}
            {isCancellable && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                size="large"
                startIcon={<CancelIcon />}
                onClick={() => setCancelOpen(true)}
              >
                Cancel Order
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this purchase order? Funds paid via wallet will be refunded."
        confirmText="Yes, Cancel"
        loading={cancelLoading}
        onConfirm={handleCancelOrder}
        onClose={() => setCancelOpen(false)}
      />
    </Box>
  );
};

export default OrderDetailPage;
