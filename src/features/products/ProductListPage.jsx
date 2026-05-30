import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import { formatCurrency } from "../../utils/format";
import { useCart } from "../../context/CartContext";

import StatusChip from "../../components/StatusChip";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";

const ProductListPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 8;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, page]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.content)
        ? res.content
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.content)
        ? res.data.content
        : [];

      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page: page - 1,
        size: pageSize,
        status: "ACTIVE",
      };

      const res = await productApi.getProducts(params);

      const pageData = res?.data ?? res;

      setProducts(pageData?.content ?? []);
      setTotalPages(pageData?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <Box>
      <PageHeader
        title="Browse Products"
        subtitle="Fresh food, drinks, snacks, and daily essentials delivered to your door."
      />

      <Card
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
        }}
      >
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
            label="Search products..."
            size="small"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            sx={{ flexGrow: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Category"
            size="small"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Min Price"
            type="number"
            size="small"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            sx={{ width: 120 }}
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Max Price"
            type="number"
            size="small"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            sx={{ width: 120 }}
            inputProps={{ min: 0 }}
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<FilterListIcon />}
          >
            Filter
          </Button>

          <Button variant="outlined" color="inherit" onClick={handleClearFilters}>
            Clear
          </Button>
        </Box>
      </Card>

      {error && <ErrorState message={error} onRetry={fetchProducts} />}

      {loading ? (
        <LoadingState message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          message="No products found"
          description="Try adjusting your filters or search keywords."
        />
      ) : (
        <Stack spacing={4} alignItems="center">
          <Box
  sx={{
    width: "100%",
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
      lg: "repeat(4, 1fr)",
    },
    gap: 3,
    alignItems: "stretch",
  }}
>
  {products.map((product) => {
    const isAvailable =
      product.status === "ACTIVE" && Number(product.stockQuantity) > 0;

    const productStatus =
      Number(product.stockQuantity) <= 0 ? "OUT_OF_STOCK" : product.status;

    return (
      <Card
        key={product.id}
        sx={{
          height: 500,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.10)",
          },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            sx={{
              height: 180,
              width: "100%",
              objectFit: "cover",
              bgcolor: "grey.100",
            }}
          />

          <Box sx={{ position: "absolute", top: 10, right: 10 }}>
            <StatusChip status={productStatus} />
          </Box>
        </Box>

        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            pb: 1,
            minHeight: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{
              mb: 0.75,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              minHeight: 18,
            }}
          >
            {product.category?.name || "General"}
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            fontWeight={800}
            sx={{
              fontSize: "1.05rem",
              lineHeight: 1.3,
              height: 54,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
  mt: 1.5,
  height: 72,
  lineHeight: "24px",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
}}
          >
            {product.description || "No description provided."}
          </Typography>

          <Box sx={{ mt: "auto", pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Stock: <strong>{product.stockQuantity}</strong>
            </Typography>

            <Typography
              variant="h6"
              fontWeight={850}
              color="secondary.main"
              sx={{ mt: 0.5 }}
            >
              {formatCurrency(product.price)}
            </Typography>
          </Box>
        </CardContent>

        <CardActions
          sx={{
            p: 2,
            pt: 0,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "stretch",
          }}
        >
          <Button
    variant="outlined"
    fullWidth
    onClick={() => navigate(`/products/${product.id}`)}
    sx={{
      height: 48,
      fontWeight: 800,
      borderRadius: 2,
      m: "0 !important",
    }}
  >
    Details
  </Button>

  <Button
    variant="contained"
    color="primary"
    fullWidth
    disabled={!isAvailable}
    onClick={() => handleAddToCart(product)}
    sx={{
      height: 48,
      fontWeight: 800,
      borderRadius: 2,
      m: "0 !important",
    }}
  >
    {isAvailable ? "Add to Cart" : "Out of Stock"}
  </Button>
        </CardActions>
      </Card>
    );
  })}
</Box>

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ProductListPage;