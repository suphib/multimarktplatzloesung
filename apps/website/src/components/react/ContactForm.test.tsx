import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from './ContactForm';

// Mock the api module
vi.mock('../../lib/api', () => ({
  submitLead: vi.fn(),
}));

import { submitLead } from '../../lib/api';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/vorname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nachname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nachricht/i)).toBeInTheDocument();
  });

  it('renders DSGVO checkbox', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/datenschutz/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: /senden/i }));

    await waitFor(() => {
      expect(screen.getByText(/vorname ist erforderlich/i)).toBeInTheDocument();
    });
  });

  it('shows error when DSGVO checkbox is not checked', async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/vorname/i), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/nachname/i), { target: { value: 'Muster' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'max@test.de' } });
    fireEvent.change(screen.getByLabelText(/organisation/i), { target: { value: 'Stadt' } });

    fireEvent.click(screen.getByRole('button', { name: /senden/i }));

    await waitFor(() => {
      expect(screen.getByText(/datenschutzbestimmungen müssen akzeptiert werden/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockSubmit = vi.mocked(submitLead);
    mockSubmit.mockResolvedValue({ success: true, message: 'Erfolgreich' });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/vorname/i), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/nachname/i), { target: { value: 'Muster' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'max@test.de' } });
    fireEvent.change(screen.getByLabelText(/organisation/i), { target: { value: 'Stadtverwaltung' } });
    fireEvent.change(screen.getByLabelText(/nachricht/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByLabelText(/datenschutz/i));

    fireEvent.click(screen.getByRole('button', { name: /senden/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          vorname: 'Max',
          nachname: 'Muster',
          email: 'max@test.de',
          organisation: 'Stadtverwaltung',
          typ: 'KONTAKT',
          datenschutzAkzeptiert: true,
        }),
      );
    });
  });

  it('shows success message after submission', async () => {
    const mockSubmit = vi.mocked(submitLead);
    mockSubmit.mockResolvedValue({ success: true, message: 'Erfolgreich' });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/vorname/i), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/nachname/i), { target: { value: 'Muster' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'max@test.de' } });
    fireEvent.change(screen.getByLabelText(/organisation/i), { target: { value: 'Stadt' } });
    fireEvent.click(screen.getByLabelText(/datenschutz/i));
    fireEvent.click(screen.getByRole('button', { name: /senden/i }));

    await waitFor(() => {
      expect(screen.getByText(/erfolgreich gesendet/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    const mockSubmit = vi.mocked(submitLead);
    mockSubmit.mockResolvedValue({ success: false, error: 'Server-Fehler' });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/vorname/i), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/nachname/i), { target: { value: 'Muster' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'max@test.de' } });
    fireEvent.change(screen.getByLabelText(/organisation/i), { target: { value: 'Stadt' } });
    fireEvent.click(screen.getByLabelText(/datenschutz/i));
    fireEvent.click(screen.getByRole('button', { name: /senden/i }));

    await waitFor(() => {
      expect(screen.getByText(/server-fehler/i)).toBeInTheDocument();
    });
  });
});
