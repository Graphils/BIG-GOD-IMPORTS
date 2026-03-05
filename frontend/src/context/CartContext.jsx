import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart || { items: [] });
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart/add', { productId, quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put('/cart/update', { productId, quantity });
    setCart(res.data.cart);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    setCart(res.data.cart || { items: [] });
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [] });
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}
