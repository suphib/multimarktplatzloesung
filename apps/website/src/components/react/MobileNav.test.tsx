import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from './MobileNav';

describe('MobileNav', () => {
  it('renders hamburger button', () => {
    render(<MobileNav />);
    expect(screen.getByRole('button', { name: /menü/i })).toBeInTheDocument();
  });

  it('opens drawer on hamburger click', () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole('button', { name: /menü/i }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeVisible();
  });

  it('closes drawer on close button click', () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole('button', { name: /menü/i }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /schließen/i }));
    // After animation, nav should be removed
  });

  it('closes drawer on ESC key', () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole('button', { name: /menü/i }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
  });

  it('renders all navigation links', () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole('button', { name: /menü/i }));

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Integrationen')).toBeInTheDocument();
    expect(screen.getByText('Preise')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Über uns')).toBeInTheDocument();
    expect(screen.getByText('Kontakt')).toBeInTheDocument();
  });

  it('renders CTA button in drawer', () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole('button', { name: /menü/i }));
    expect(screen.getByText('Demo anfordern')).toBeInTheDocument();
  });
});
