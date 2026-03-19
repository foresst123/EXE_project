import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = async ({ productId, quantity = 1, productName }) => {
    const { data } = await api.post("/cart/add", { product_id: productId, quantity });
    setCart(data);
    setCartNotice({
      productName: productName || "Product",
      quantity,
      timestamp: Date.now(),
    });
  };

  const updateCartQuantity = async (productId, quantity) => {
    const { data } = await api.patch("/cart/quantity", { product_id: productId, quantity });
    setCart(data);
  };

  const removeFromCart = async (product_id) => {
    const { data } = await api.delete("/cart/remove", { data: { product_id } });
    setCart(data);
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        cartNotice,
        clearCartNotice: () => setCartNotice(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
