import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { categoryApi } from "../../api/categoryApi";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import PageHeader from "../../components/PageHeader";

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // null means "Create"
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete Confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await categoryApi.getCategories();
      // Handle both array and paginated formats
      const data = Array.isArray(res) ? res : res.content || [];
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCurrentCategory(null);
    setFormName("");
    setFormDescription("");
    setSubmitError("");
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (category) => {
    setCurrentCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || "");
    setSubmitError("");
    setErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");
    
    // Client-side validation
    if (!formName.trim()) {
      setErrors({ name: "Category name is required." });
      setSubmitError("Please fix the validation errors below.");
      return;
    }
    
    setSubmitLoading(true);
    try {
      const payload = {
        name: formName,
        description: formDescription,
      };

      if (currentCategory) {
        // Edit flow
        await categoryApi.updateCategory(currentCategory.id, payload);
      } else {
        // Create flow
        await categoryApi.createCategory(payload);
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to save category.");
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitLoading(false);
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
      await categoryApi.deleteCategory(deleteId);
      setDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete category.");
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Category Management"
        subtitle="Manage product categories used in the ordering system."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Category
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchCategories} />}

      {loading ? (
        <LoadingState message="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState message="No categories found" description="Create a category to get started." />
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Category Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{category.name}</TableCell>
                  <TableCell>{category.description || "N/A"}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(category.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogTitle>{currentCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <TextField
                label="Category Name"
                fullWidth
                required
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                error={!!errors.name}
                helperText={errors.name}
                disabled={submitLoading}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={submitLoading}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDialogClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitLoading}>
              {currentCategory ? "Save Changes" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default AdminCategoryPage;
