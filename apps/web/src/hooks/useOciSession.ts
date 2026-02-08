import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { OciCartItem } from '@procurement/shared';

interface OciSessionState {
  isActive: boolean;
  token: string | null;
  buyerCookie: string | null;
  expiresAt: string | null;
  isValidating: boolean;
  error: string | null;
}

// ─── Utility functions (testable without hooks) ──────────────

export function getOciTokenFromUrl(searchParams: URLSearchParams): string | null {
  return searchParams.get('oci_session') || null;
}

export function createOciCart() {
  let items: OciCartItem[] = [];

  return {
    addItem(item: OciCartItem) {
      items = [...items, item];
    },
    removeItem(index: number) {
      items = items.filter((_, i) => i !== index);
    },
    updateQuantity(index: number, quantity: number) {
      items = items.map((item, i) => (i === index ? { ...item, quantity } : item));
    },
    clear() {
      items = [];
    },
    getItems(): OciCartItem[] {
      return [...items];
    },
  };
}

// ─── React Hook ──────────────────────────────────────────────

export function useOciSession() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<OciSessionState>({
    isActive: false,
    token: null,
    buyerCookie: null,
    expiresAt: null,
    isValidating: false,
    error: null,
  });
  const [cartItems, setCartItems] = useState<OciCartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get('oci_session');
  const buyerCookie = searchParams.get('buyer_cookie');

  useEffect(() => {
    if (!token) {
      setSession((s) => ({ ...s, isActive: false, token: null }));
      return;
    }

    setSession((s) => ({ ...s, isValidating: true, token, buyerCookie }));

    api
      .validateOciSession(token)
      .then((result) => {
        setSession({
          isActive: result.valid,
          token,
          buyerCookie,
          expiresAt: result.expiresAt,
          isValidating: false,
          error: null,
        });
      })
      .catch(() => {
        setSession({
          isActive: false,
          token,
          buyerCookie: null,
          expiresAt: null,
          isValidating: false,
          error: 'Ungültige oder abgelaufene OCI-Sitzung',
        });
      });
  }, [token, buyerCookie]);

  const addToCart = useCallback((item: OciCartItem) => {
    setCartItems((prev) => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const submitCart = useCallback(async () => {
    if (!session.token || cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const html = await api.submitOciCart(session.token, cartItems);
      // The response is an HTML form that auto-submits to the ERP
      // Open it in the current window to complete the punch-out
      const newWindow = window.open('', '_self');
      if (newWindow) {
        newWindow.document.write(html as any);
        newWindow.document.close();
      }
    } catch {
      setSession((s) => ({ ...s, error: 'Fehler beim Senden des Warenkorbs' }));
    } finally {
      setIsSubmitting(false);
    }
  }, [session.token, cartItems]);

  return {
    ...session,
    cartItems,
    cartCount: cartItems.length,
    isSubmitting,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    submitCart,
  };
}
