import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Auth Features
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";

// Customer Features
import ProductListPage from "./features/products/ProductListPage";
import ProductDetailPage from "./features/products/ProductDetailPage";
import AddressPage from "./features/addresses/AddressPage";
import WalletPage from "./features/wallet/WalletPage";
import CreateOrderPage from "./features/orders/CreateOrderPage";
import MyOrdersPage from "./features/orders/MyOrdersPage";
import OrderDetailPage from "./features/orders/OrderDetailPage";
import CartPage from "./features/cart/CartPage";

// Admin Features
import AdminProductListPage from "./features/products/AdminProductListPage";
import AdminProductFormPage from "./features/products/AdminProductFormPage";
import AdminCategoryPage from "./features/products/AdminCategoryPage";
import AdminOrdersPage from "./features/orders/AdminOrdersPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public / Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Authenticated Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/create-order" element={<CreateOrderPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/my-orders/:id" element={<OrderDetailPage />} />
          </Route>
        </Route>

        {/* Authenticated Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
            <Route path="/admin/products" element={<AdminProductListPage />} />
            <Route path="/admin/products/new" element={<AdminProductFormPage />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="/admin/categories" element={<AdminCategoryPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
