import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  TextField,
  Breadcrumbs,
  Link,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { productApi } from "../../api/productApi";
import { formatCurrency } from "../../utils/format";
import { useCart } from "../../context/CartContext";
import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productApi.getProductById(id);
      setProduct(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleCheckout = () => {
    if (!product) return;
    // Redirect to checkout with product and quantity in route state
    navigate("/create-order", {
      state: {
        productId: product.id,
        quantity,
      },
    });
  };

  if (loading) return <LoadingState message="Loading product details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProduct} />;
  if (!product) return <ErrorState message="Product not found" />;

  const isAvailable = product.status === "ACTIVE" && product.stockQuantity > 0;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          onClick={() => navigate("/products")}
          sx={{ cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: "inherit" }} /> Store
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left Side: Product Image */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, bgcolor: "#fff", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box
              component="img"
              src={product.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600"}
              alt={product.name}
              sx={{
                width: "100%",
                maxHeight: 400,
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          </Card>
        </Grid>

        {/* Right Side: Details & Actions */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <StatusChip status={product.stockQuantity <= 0 ? "OUT_OF_STOCK" : product.status} />
                <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
                  Category: {product.category?.name || "General"}
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h5" color="secondary.main" fontWeight={800}>
                {formatCurrency(product.price)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {product.description || "No detailed description is available for this product."}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stock Available: <strong>{product.stockQuantity} items</strong>
              </Typography>

              {isAvailable ? (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  {/* Quantity selector */}
                  <Stack direction="row" alignItems="center" sx={{ border: "1px solid #ced4da", borderRadius: 1, px: 1 }}>
                    <IconButton onClick={handleDecrement} disabled={quantity <= 1}>
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      value={quantity}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      inputProps={{
                        style: { textAlign: "center", width: 40, fontWeight: 700 },
                        readOnly: true,
                      }}
                    />
                    <IconButton onClick={handleIncrement} disabled={quantity >= product.stockQuantity}>
                      <AddIcon />
                    </IconButton>
                  </Stack>

                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => addToCart(product, quantity)}
                    sx={{ px: 3, fontWeight: 700 }}
                  >
                    Add to Cart
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<ShoppingBagIcon />}
                    onClick={handleCheckout}
                    sx={{ px: 4, fontWeight: 700 }}
                  >
                    Order Now
                  </Button>
                </Stack>
              ) : (
                <Button variant="contained" disabled size="large" sx={{ mt: 2, width: "fit-content" }}>
                  Product Unavailable
                </Button>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
