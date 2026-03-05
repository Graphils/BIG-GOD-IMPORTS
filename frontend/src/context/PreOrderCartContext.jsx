import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const PreOrderCartContext = createContext();
export const usePreOrderCart = () => useContext(PreOrderCartContext);

export function PreOrderCartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/pre-order-cart');
      setCart(res.data.cart || { items: [] });
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/pre-order-cart/add', { productId, quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put('/pre-order-cart/update', { productId, quantity });
    setCart(res.data.cart);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/pre-order-cart/remove/${productId}`);
    setCart(res.data.cart || { items: [] });
  };

  const clearCart = async () => {
    await api.delete('/pre-order-cart/clear');
    setCart({ items: [] });
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;

  return (
    <PreOrderCartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </PreOrderCartContext.Provider>
  );
}