import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { orderApi } from "../../api/orderApi";
import { formatCurrency, formatDateTime } from "../../utils/format";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await orderApi.getMyOrders();
      // Handle standard array or paginated list
      const data = Array.isArray(res) ? res : res.content || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="My Orders" subtitle="Track and review your convenience store purchases." />

      {error && <ErrorState message={error} onRetry={fetchOrders} />}

      {loading ? (
        <LoadingState message="Loading purchases..." />
      ) : orders.length === 0 ? (
        <EmptyState
          message="No orders placed yet"
          description="Browse our items catalog and stock your first cart!"
        />
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date Placed</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {order.paymentMethod ? order.paymentMethod.replace(/_/g, " ") : "N/A"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "secondary.main" }}>
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={order.status} type="status" />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={order.paymentStatus} type="payment" />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MyOrdersPage;
