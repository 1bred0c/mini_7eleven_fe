import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("mini_7eleven_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("mini_7eleven_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      
      // Check stock limit if known
      let targetQty = currentQtyInCart + quantityToAdd;
      if (product.stockQuantity !== undefined && targetQty > product.stockQuantity) {
        targetQty = product.stockQuantity;
      }
      
      if (targetQty <= 0) {
        return prevItems.filter((item) => item.productId !== product.id);
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: targetQty } : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stockQuantity: product.stockQuantity,
          quantity: targetQty,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.productId === productId);
      if (!item) return prevItems;

      let targetQty = newQuantity;
      if (item.stockQuantity !== undefined && targetQty > item.stockQuantity) {
        targetQty = item.stockQuantity;
      }

      if (targetQty <= 0) {
        return prevItems.filter((i) => i.productId !== productId);
      }

      return prevItems.map((i) =>
        i.productId === productId ? { ...i, quantity: targetQty } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
