import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    validateOciSession: vi.fn(),
    submitOciCart: vi.fn(),
  },
}));

// Mock react-router-dom
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams],
}));

import { api } from '../lib/api';

describe('OCI Session utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('oci_session');
    mockSearchParams.delete('buyer_cookie');
  });

  describe('getOciTokenFromUrl', () => {
    it('should extract oci_session from URL params', async () => {
      const { getOciTokenFromUrl } = await import('./useOciSession');
      mockSearchParams.set('oci_session', 'test-token-123');

      const token = getOciTokenFromUrl(mockSearchParams);
      expect(token).toBe('test-token-123');
    });

    it('should return null when no oci_session param', async () => {
      const { getOciTokenFromUrl } = await import('./useOciSession');

      const token = getOciTokenFromUrl(mockSearchParams);
      expect(token).toBeNull();
    });
  });

  describe('OCI cart operations', () => {
    it('should add item to cart', async () => {
      const { createOciCart } = await import('./useOciSession');
      const cart = createOciCart();

      cart.addItem({
        description: 'Dell Latitude 5550',
        quantity: 1,
        unit: 'EA',
        price: 1049,
        currency: 'EUR',
        vendorMat: 'LAT-5550',
        vendor: 'Bechtle AG',
      });

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].description).toBe('Dell Latitude 5550');
    });

    it('should remove item from cart', async () => {
      const { createOciCart } = await import('./useOciSession');
      const cart = createOciCart();

      cart.addItem({
        description: 'Item 1',
        quantity: 1,
        unit: 'EA',
        price: 100,
        currency: 'EUR',
        vendorMat: 'A',
        vendor: 'V',
      });
      cart.addItem({
        description: 'Item 2',
        quantity: 1,
        unit: 'EA',
        price: 200,
        currency: 'EUR',
        vendorMat: 'B',
        vendor: 'V',
      });

      cart.removeItem(0);
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].description).toBe('Item 2');
    });

    it('should clear cart', async () => {
      const { createOciCart } = await import('./useOciSession');
      const cart = createOciCart();

      cart.addItem({
        description: 'Item 1',
        quantity: 1,
        unit: 'EA',
        price: 100,
        currency: 'EUR',
        vendorMat: 'A',
        vendor: 'V',
      });

      cart.clear();
      expect(cart.getItems()).toHaveLength(0);
    });

    it('should update quantity of item', async () => {
      const { createOciCart } = await import('./useOciSession');
      const cart = createOciCart();

      cart.addItem({
        description: 'Item 1',
        quantity: 1,
        unit: 'EA',
        price: 100,
        currency: 'EUR',
        vendorMat: 'A',
        vendor: 'V',
      });

      cart.updateQuantity(0, 5);
      expect(cart.getItems()[0].quantity).toBe(5);
    });
  });
});
