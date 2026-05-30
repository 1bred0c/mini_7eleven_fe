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
  IconButton,
  TextField,
  MenuItem,
  Box,
  Pagination,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import { formatCurrency } from "../../utils/format";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import PageHeader from "../../components/PageHeader";

const AdminProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Stock Quick Edit
  const [stockOpen, setStockOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [stockVal, setStockVal] = useState("");
  const [stockError, setStockError] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  // Delete Confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, status, page]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      const data = Array.isArray(res) ? res : res.content || [];
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
        page: page - 1,
        size: pageSize,
      };
      const res = await productApi.getProducts(params);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setStatus("");
    setPage(1);
  };

  // Quick toggle status
  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await productApi.updateProductStatus(product.id, nextStatus);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update product status.");
    }
  };

  // Open stock quick edit
  const handleOpenStock = (product) => {
    setStockProductId(product.id);
    setStockVal(product.stockQuantity);
    setStockError("");
    setStockOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (stockVal === "" || isNaN(stockVal) || parseInt(stockVal) < 0) {
      setStockError("Please enter a valid stock quantity (0 or positive).");
      return;
    }
    setStockError("");
    setStockLoading(true);
    try {
      const quantity = parseInt(stockVal);
      await productApi.updateProductStock(stockProductId, quantity);
      setStockOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setStockError(err.message || "Failed to update stock quantity.");
    } finally {
      setStockLoading(false);
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
  if (!deleteId) return;

  setDeleteLoading(true);

  try {
    // Do not hard delete products because old orders may still reference them.
    // Instead, mark the product as INACTIVE so it is hidden from user ordering.
    await productApi.updateProductStatus(deleteId, "INACTIVE");

    setDeleteOpen(false);
    fetchProducts();
  } catch (err) {
    console.error(err);
    setError(err.message || "Failed to deactivate product.");
    setDeleteOpen(false);
  } finally {
    setDeleteLoading(false);
  }
};

  return (
    <div>
      <PageHeader
        title="Products Dashboard"
        subtitle="Create, update, and manage your convenience store inventory catalog."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/products/new")}
          >
            Create Product
          </Button>
        }
      />

      {/* Filter Toolbar */}
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
            label="Search product name..."
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <TextField
            select
            label="Category"
            size="small"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            size="small"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
            <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
          </TextField>

          <Button type="submit" variant="contained">
            Search
          </Button>

          <Button variant="outlined" color="inherit" onClick={handleClearFilters}>
            Clear
          </Button>
        </Box>
      </Card>

      {error && <ErrorState message={error} onRetry={fetchProducts} />}

      {loading ? (
        <LoadingState message="Loading inventory..." />
      ) : products.length === 0 ? (
        <EmptyState message="No products found" description="Create a product item to begin stocking." />
      ) : (
        <Stack spacing={4} alignItems="center">
          <TableContainer component={Paper} elevation={1}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Preview</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={product.imageUrl}
                        sx={{ width: 44, height: 44, bgcolor: "action.selected" }}
                      >
                        <LocalPizzaIcon fontSize="small" />
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                    <TableCell>{product.category?.name || "General"}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
  {formatCurrency(product.price)}
</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleOpenStock(product)}
                        sx={{
                          textTransform: "none",
                          color: "text.primary",
                          fontWeight: 700,
                          backgroundColor: product.stockQuantity <= 0 ? "rgba(238, 28, 37, 0.1)" : "rgba(0, 132, 61, 0.08)",
                          px: 1.5,
                        }}
                      >
                        {product.stockQuantity} Items
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        onClick={() => handleToggleStatus(product)}
                        sx={{ cursor: "pointer" }}
                      >
                        <StatusChip
                          status={product.stockQuantity <= 0 ? "OUT_OF_STOCK" : product.status}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="warning" onClick={() => handleOpenDelete(product.id)}>
  <BlockIcon />
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
              onChange={(e, val) => setPage(val)}
              color="primary"
              size="large"
            />
          )}
        </Stack>
      )}

      {/* Stock Edit Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleStockSubmit}>
          <DialogTitle>Quick Adjust Stock</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {stockError && <Alert severity="error">{stockError}</Alert>}
              <TextField
                label="Stock Quantity"
                type="number"
                fullWidth
                required
                value={stockVal}
                onChange={(e) => setStockVal(e.target.value)}
                disabled={stockLoading}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setStockOpen(false)} disabled={stockLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={stockLoading}>
              Update Stock
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
  open={deleteOpen}
  title="Deactivate Product"
  message="This product will be marked as INACTIVE and hidden from users. Existing orders will not be affected."
  confirmText="Deactivate"
  loading={deleteLoading}
  onConfirm={handleDeleteConfirm}
  onClose={() => setDeleteOpen(false)}
/>
    </div>
  );
};

export default AdminProductListPage;
