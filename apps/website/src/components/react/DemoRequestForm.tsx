import { useState } from 'react';
import type { FormEvent } from 'react';
import { submitLead } from '../../lib/api';

interface FormErrors {
  vorname?: string;
  nachname?: string;
  email?: string;
  organisation?: string;
  datenschutz?: string;
}

export function DemoRequestForm() {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    organisation: '',
    abteilung: '',
    position: '',
    interesseAn: '' as string,
    anzahlNutzer: '',
    nachricht: '',
    datenschutzAkzeptiert: false,
    newsletterOptIn: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.vorname.trim()) newErrors.vorname = 'Vorname ist erforderlich';
    if (!formData.nachname.trim()) newErrors.nachname = 'Nachname ist erforderlich';
    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Ungültige E-Mail-Adresse';
    if (!formData.organisation.trim()) newErrors.organisation = 'Organisation ist erforderlich';
    if (!formData.datenschutzAkzeptiert)
      newErrors.datenschutz = 'Datenschutzbestimmungen müssen akzeptiert werden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    const result = await submitLead({
      vorname: formData.vorname,
      nachname: formData.nachname,
      email: formData.email,
      telefon: formData.telefon || undefined,
      organisation: formData.organisation,
      abteilung: formData.abteilung || undefined,
      position: formData.position || undefined,
      typ: 'DEMO',
      interesseAn: (formData.interesseAn as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') || undefined,
      anzahlNutzer: formData.anzahlNutzer ? parseInt(formData.anzahlNutzer, 10) : undefined,
      nachricht: formData.nachricht || undefined,
      datenschutzAkzeptiert: formData.datenschutzAkzeptiert,
      newsletterOptIn: formData.newsletterOptIn,
      quelle: 'website_demo',
    });

    if (result.success) {
      setStatus('success');
      setApiMessage(result.message || 'Ihre Demo-Anfrage wurde erfolgreich gesendet.');
    } else {
      setStatus('error');
      setApiMessage(result.error || 'Ein Fehler ist aufgetreten.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center p-6 sm:p-8 bg-green-50 rounded-2xl border border-green-200">
        <svg className="w-12 h-12 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-bold text-green-800 mb-2">Demo-Anfrage gesendet!</h3>
        <p className="text-sm text-green-700">{apiMessage}</p>
        <p className="text-sm text-green-600 mt-2">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
      {status === 'error' && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">{apiMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="demo-vorname" className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
          <input id="demo-vorname" type="text" value={formData.vorname}
            onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.vorname ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
          />
          {errors.vorname && <p className="mt-1 text-xs text-red-600">{errors.vorname}</p>}
        </div>
        <div>
          <label htmlFor="demo-nachname" className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
          <input id="demo-nachname" type="text" value={formData.nachname}
            onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.nachname ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
          />
          {errors.nachname && <p className="mt-1 text-xs text-red-600">{errors.nachname}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
        <input id="demo-email" type="email" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="demo-telefon" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input id="demo-telefon" type="tel" value={formData.telefon}
            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="demo-organisation" className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
          <input id="demo-organisation" type="text" value={formData.organisation}
            onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.organisation ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
          />
          {errors.organisation && <p className="mt-1 text-xs text-red-600">{errors.organisation}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="demo-abteilung" className="block text-sm font-medium text-gray-700 mb-1">Abteilung</label>
          <input id="demo-abteilung" type="text" value={formData.abteilung}
            onChange={(e) => setFormData({ ...formData, abteilung: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="demo-position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input id="demo-position" type="text" value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="demo-interesse" className="block text-sm font-medium text-gray-700 mb-1">Interesse an</label>
          <select id="demo-interesse" value={formData.interesseAn}
            onChange={(e) => setFormData({ ...formData, interesseAn: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
          >
            <option value="">Bitte wählen</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
        <div>
          <label htmlFor="demo-nutzer" className="block text-sm font-medium text-gray-700 mb-1">Anzahl Nutzer</label>
          <input id="demo-nutzer" type="number" min="1" value={formData.anzahlNutzer}
            onChange={(e) => setFormData({ ...formData, anzahlNutzer: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-nachricht" className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
        <textarea id="demo-nachricht" rows={3} value={formData.nachricht}
          onChange={(e) => setFormData({ ...formData, nachricht: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
          placeholder="Wie können wir Ihnen helfen?"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.datenschutzAkzeptiert}
            onChange={(e) => setFormData({ ...formData, datenschutzAkzeptiert: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-xs sm:text-sm text-gray-600">
            Ich habe die <a href="/datenschutz/" className="text-primary-600 underline">Datenschutzbestimmungen</a> gelesen und bin damit einverstanden. *
          </span>
        </label>
        {errors.datenschutz && <p className="text-xs text-red-600">{errors.datenschutz}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.newsletterOptIn}
            onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-xs sm:text-sm text-gray-600">Ich möchte den Newsletter erhalten.</span>
        </label>
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Wird gesendet...' : 'Demo anfordern'}
      </button>
    </form>
  );
}

export default DemoRequestForm;
