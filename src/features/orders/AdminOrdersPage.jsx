import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Box,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Grid,
  Typography,
  Card,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import { orderApi } from "../../api/orderApi";
import { formatCurrency, formatDateTime } from "../../utils/format";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../utils/constants";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // View/Manage Dialog State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [orderStatusVal, setOrderStatusVal] = useState("");
  const [paymentStatusVal, setPaymentStatusVal] = useState("");
  const [dialogError, setDialogError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        accountId: accountIdFilter || undefined,
        page: page - 1,
        size: pageSize,
      };
      const res = await orderApi.getAdminOrders(params);
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setPaymentStatusFilter("");
    setAccountIdFilter("");
    setPage(1);
  };

  // Open details & management modal
  const handleOpenManage = async (orderId) => {
    setDialogError("");
    setDialogOpen(true);
    setDialogLoading(true);
    try {
      const fullOrder = await orderApi.getAdminOrderById(orderId);
      setSelectedOrder(fullOrder);
      setOrderStatusVal(fullOrder.status);
      setPaymentStatusVal(fullOrder.paymentStatus);
    } catch (err) {
      console.error(err);
      setDialogError("Failed to fetch full order details.");
    } finally {
      setDialogLoading(false);
    }
  };

  // Update order status trigger
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setDialogLoading(true);
    setDialogError("");
    try {
      // 1. Update order status if changed
      if (orderStatusVal !== selectedOrder.status) {
        await orderApi.updateOrderStatus(selectedOrder.id, orderStatusVal);
      }
      
      // 2. Update payment status if changed
      if (paymentStatusVal !== selectedOrder.paymentStatus) {
        await orderApi.updateOrderPaymentStatus(selectedOrder.id, paymentStatusVal);
      }

      setDialogOpen(false);
      fetchOrders(); // Refresh table
    } catch (err) {
      console.error(err);
      setDialogError(err.message || "Failed to update order status details.");
    } finally {
      setDialogLoading(false);
    }
  };

  // Determine selectable order status options based on current status transition rules
  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return [
          { value: "PENDING", label: "Pending" },
          { value: "CONFIRMED", label: "Confirmed" },
          { value: "CANCELLED", label: "Cancelled" },
        ];
      case "CONFIRMED":
        return [
          { value: "CONFIRMED", label: "Confirmed" },
          { value: "PREPARING", label: "Preparing" },
          { value: "CANCELLED", label: "Cancelled" },
        ];
      case "PREPARING":
        return [
          { value: "PREPARING", label: "Preparing" },
          { value: "COMPLETED", label: "Completed" },
          { value: "CANCELLED", label: "Cancelled" },
        ];
      case "COMPLETED":
        return [{ value: "COMPLETED", label: "Completed" }];
      case "CANCELLED":
        return [{ value: "CANCELLED", label: "Cancelled" }];
      default:
        return [];
    }
  };

  const statusOptions = selectedOrder ? getAvailableStatusOptions(selectedOrder.status) : [];
  const isStatusDisabled = selectedOrder
    ? selectedOrder.status === "COMPLETED" || selectedOrder.status === "CANCELLED"
    : false;

  return (
    <div>
      <PageHeader
        title="Order Fulfilments"
        subtitle="Manage client convenience store orders, check payments, and process status transitions."
      />

      {/* Search & Filters */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            label="Account ID"
            size="small"
            value={accountIdFilter}
            onChange={(e) => setAccountIdFilter(e.target.value)}
            sx={{ width: 140 }}
          />

          <TextField
            select
            label="Order Status"
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {Object.keys(ORDER_STATUS).map((key) => (
              <MenuItem key={key} value={ORDER_STATUS[key]}>
                {ORDER_STATUS[key]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Payment Status"
            size="small"
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Payments</MenuItem>
            {Object.keys(PAYMENT_STATUS).map((key) => (
              <MenuItem key={key} value={PAYMENT_STATUS[key]}>
                {PAYMENT_STATUS[key]}
              </MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" startIcon={<FilterListIcon />}>
            Filter
          </Button>

          <Button variant="outlined" color="inherit" onClick={handleClearFilters}>
            Clear
          </Button>
        </Box>
      </Card>

      {error && <ErrorState message={error} onRetry={fetchOrders} />}

      {loading ? (
  <LoadingState message="Loading orders logs..." />
) : orders.length === 0 ? (
  <EmptyState
    message="No orders registered yet"
    description="Orders placed by users will appear here."
  />
) : (
  <Stack spacing={4} alignItems="center">
    <TableContainer component={Paper} elevation={1}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Order Status</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell align="right">Manage</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>

              <TableCell>{formatDateTime(order.createdAt)}</TableCell>

              <TableCell>
  <Typography variant="body2" fontWeight={600}>
    {order.customerName || "Unknown customer"}
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Account ID: {order.accountId || "N/A"}
  </Typography>
</TableCell>

              <TableCell sx={{ fontWeight: 700, color: "secondary.main" }}>
                {formatCurrency(order.totalAmount)}
              </TableCell>

              <TableCell>
                <StatusChip status={order.status} type="status" />
              </TableCell>

              <TableCell>
                <StatusChip status={order.paymentStatus} type="payment" />
              </TableCell>

              <TableCell align="right">
                <IconButton
                  color="primary"
                  onClick={() => handleOpenManage(order.id)}
                >
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {totalPages > 1 && (
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        color="primary"
        size="large"
      />
    )}
  </Stack>
)}

      {/* Details & Manage Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details & Processing</DialogTitle>
        <DialogContent dividers>
          {dialogLoading ? (
            <LoadingState message="Fetching details..." />
          ) : dialogError ? (
            <Alert severity="error">{dialogError}</Alert>
          ) : selectedOrder ? (
            <Grid container spacing={3}>
              {/* Product and items summary */}
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 2 }}>
                  Ordered Items Checklist
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {selectedOrder.items?.map((item) => (
                    <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={650}>
                          {item.productName || item.product?.name || `Product ID: ${item.productId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quantity: {item.quantity} x {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.subtotal)}
                      </Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Total Order Amount:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={850} color="secondary.main">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 2 }}>
  Delivery Address Details
</Typography>
<Divider sx={{ mb: 2 }} />

<Stack spacing={0.5}>
  <Typography variant="body2" fontWeight={700}>
    Receiver: {selectedOrder.customerName}
  </Typography>

  <Typography variant="caption" color="text.secondary">
    Phone: {selectedOrder.phoneNumber}
  </Typography>

  <Typography variant="caption" color="text.secondary">
    Address: {selectedOrder.address}
  </Typography>
</Stack>
</Grid>

{/* Status editing controls */}
<Grid item xs={12} md={5}>
  <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 2 }}>
    Fulfillment Controls
  </Typography>
  <Divider sx={{ mb: 2 }} />

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Current Order Status: <strong>{selectedOrder.status}</strong>
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      label="Modify Order Status"
                      value={orderStatusVal}
                      onChange={(e) => setOrderStatusVal(e.target.value)}
                      disabled={isStatusDisabled}
                      size="small"
                    >
                      {statusOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {isStatusDisabled && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                        Fulfillment complete. Terminal states (COMPLETED/CANCELLED) cannot be changed.
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Current Payment Status: <strong>{selectedOrder.paymentStatus}</strong>
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      label="Modify Payment Status"
                      value={paymentStatusVal}
                      onChange={(e) => setPaymentStatusVal(e.target.value)}
                      size="small"
                    >
                      {Object.keys(PAYMENT_STATUS).map((key) => (
                        <MenuItem key={key} value={PAYMENT_STATUS[key]}>
                          {PAYMENT_STATUS[key]}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
  Customer:
</Typography>
<Typography variant="body2" fontWeight={600}>
  {selectedOrder.customerName || "Unknown customer"}
</Typography>

<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
  Account ID:
</Typography>
<Typography variant="body2" fontWeight={600}>
  {selectedOrder.accountId || "N/A"}
</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Payment Method Used:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: "capitalize" }}>
                      {selectedOrder.paymentMethod?.replace(/_/g, " ")}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={dialogLoading || !selectedOrder}
          >
            Update Fulfilment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
