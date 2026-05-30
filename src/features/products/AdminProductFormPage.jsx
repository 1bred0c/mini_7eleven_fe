import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Typography,
  Alert,
  Box,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";

const AdminProductFormPage = () => {
  const { id } = useParams(); // present if editing
  const isEdit = !!id;
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [categoryId, setCategoryId] = useState("");

  // System states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch categories
      const categoriesRes = await categoryApi.getCategories();
      const categoriesList = Array.isArray(categoriesRes)
        ? categoriesRes
        : categoriesRes.content || [];
      setCategories(categoriesList);

      // 2. Fetch product if edit
      if (isEdit) {
        const product = await productApi.getProductById(id);
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price);
        setStockQuantity(product.stockQuantity);
        setImageUrl(product.imageUrl || "");
        setStatus(product.status);
        setCategoryId(product.category?.id || "");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load form details.");
    } finally {
      setLoading(false);
    }
  };

  // Enforce status constraint when stock quantity changes
  const handleStockChange = (val) => {
    setStockQuantity(val);
    if (errors.stockQuantity) setErrors({ ...errors, stockQuantity: "" });
    if (val !== "" && parseInt(val) <= 0) {
      // Stock <= 0 must be OUT_OF_STOCK or INACTIVE
      setStatus("OUT_OF_STOCK");
    } else if (status === "OUT_OF_STOCK" && val !== "" && parseInt(val) > 0) {
      // Stock > 0 can revert to ACTIVE
      setStatus("ACTIVE");
    }
  };

  const handleStatusChange = (val) => {
    const stockNum = parseInt(stockQuantity);
    if (val === "ACTIVE" && (!isNaN(stockNum) && stockNum <= 0)) {
      setValidationError("Cannot set status to ACTIVE when stock is 0 or negative.");
      return;
    }
    setValidationError("");
    if (errors.status) setErrors({ ...errors, status: "" });
    setStatus(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    
    // Client-side validation
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Product name is required.";
    }
    if (!categoryId) {
      newErrors.categoryId = "Category is required.";
    }
    if (!status) {
      newErrors.status = "Status is required.";
    }
    if (price === "" || isNaN(price)) {
      newErrors.price = "Price is required.";
    } else if (parseFloat(price) <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }
    if (stockQuantity === "" || isNaN(stockQuantity)) {
      newErrors.stockQuantity = "Stock quantity is required.";
    } else if (parseInt(stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock quantity must be 0 or positive.";
    }
    if (imageUrl.trim() && !/^https?:\/\/.+/i.test(imageUrl)) {
      newErrors.imageUrl = "Image URL must be a valid HTTP/HTTPS URL.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setValidationError("Please fix the validation errors below.");
      return;
    }

    setErrors({});
    const stockNum = parseInt(stockQuantity);
    // Force OUT_OF_STOCK if stock <= 0
    let finalStatus = status;
    if (stockNum <= 0) {
      finalStatus = "OUT_OF_STOCK";
    }

    setSubmitLoading(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        stockQuantity: stockNum,
        imageUrl,
        status: finalStatus,
        categoryId: parseInt(categoryId),
      };

      if (isEdit) {
        await productApi.updateProduct(id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setValidationError(err.message || "Failed to submit product details.");
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchInitialData} />;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          onClick={() => navigate("/admin/products")}
          sx={{ cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: "inherit" }} /> Dashboard
        </Link>
        <Typography color="text.primary">{isEdit ? "Edit Product" : "Create Product"}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={850} sx={{ mb: 3 }}>
        {isEdit ? "Edit Catalog Item" : "Create Catalog Item"}
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Image Preview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 2 }}>
            {imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt="Product Preview"
                sx={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "contain",
                  borderRadius: 2,
                  mb: 2,
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=400";
                }}
              />
            ) : (
              <Box sx={{ textAlign: "center", color: "text.disabled", mb: 2 }}>
                <PhotoCameraIcon sx={{ fontSize: 60 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  No Image URL Provided
                </Typography>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              Live Image Preview
            </Typography>
          </Card>
        </Grid>

        {/* Right Side: Fields Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  {validationError && <Alert severity="error">{validationError}</Alert>}

                  <TextField
                    label="Product Name"
                    required
                    fullWidth
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={submitLoading}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Category"
                        required
                        fullWidth
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                        }}
                        error={!!errors.categoryId}
                        helperText={errors.categoryId}
                        disabled={submitLoading}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Status"
                        required
                        fullWidth
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        error={!!errors.status}
                        helperText={errors.status}
                        disabled={submitLoading}
                      >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Price"
                        type="number"
                        required
                        fullWidth
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (errors.price) setErrors({ ...errors, price: "" });
                        }}
                        error={!!errors.price}
                        helperText={errors.price}
                        disabled={submitLoading}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Stock Quantity"
                        type="number"
                        required
                        fullWidth
                        value={stockQuantity}
                        onChange={(e) => handleStockChange(e.target.value)}
                        error={!!errors.stockQuantity}
                        helperText={errors.stockQuantity}
                        disabled={submitLoading}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Image URL"
                    fullWidth
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
                    }}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl}
                    disabled={submitLoading}
                    placeholder="https://example.com/image.jpg"
                  />

                  <TextField
                    label="Product Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitLoading}
                  />

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => navigate("/admin/products")}
                      disabled={submitLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitLoading}
                      sx={{ px: 4 }}
                    >
                      {submitLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : isEdit ? (
                        "Save Changes"
                      ) : (
                        "Create Product"
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProductFormPage;
