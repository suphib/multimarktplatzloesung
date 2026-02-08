const API_URL = import.meta.env.PUBLIC_API_URL || 'https://app.procurement-ai.de/api/v1';

interface LeadFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  organisation: string;
  abteilung?: string;
  position?: string;
  typ: 'KONTAKT' | 'DEMO' | 'NEWSLETTER';
  nachricht?: string;
  interesseAn?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  anzahlNutzer?: number;
  datenschutzAkzeptiert: boolean;
  newsletterOptIn?: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitLead(data: LeadFormData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error: error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      };
    }

    return { success: true, message: 'Ihre Anfrage wurde erfolgreich gesendet.' };
  } catch {
    return {
      success: false,
      error: 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.',
    };
  }
}
