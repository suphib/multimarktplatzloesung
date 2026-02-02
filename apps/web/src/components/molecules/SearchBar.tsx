import { useState, useRef, useEffect, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button, Input } from '../atoms';

const SUGGESTIONS = [
  { text: 'Laptop', hinweis: 'Dell, Lenovo, HP, Apple, Surface' },
  { text: 'Monitor', hinweis: 'Dell, LG, Samsung, 27 Zoll, 4K' },
  { text: 'Schreibtisch', hinweis: 'Höhenverstellbar, FlexiSpot, IKEA' },
  { text: 'Bürostuhl', hinweis: 'Steelcase, Herman Miller, Interstuhl' },
  { text: 'Drucker', hinweis: 'HP LaserJet, Brother Farblaser' },
  { text: 'Maus', hinweis: 'Logitech MX Master, kabellos' },
  { text: 'Tastatur', hinweis: 'Logitech MX Keys, beleuchtet' },
  { text: 'Headset', hinweis: 'Jabra Evolve, ANC, UC-zertifiziert' },
  { text: 'Webcam', hinweis: 'Logitech Brio, 4K, USB-C' },
  { text: 'Docking Station', hinweis: 'CalDigit, Thunderbolt 4' },
  { text: 'Desktop PC', hinweis: 'Dell OptiPlex, Lenovo ThinkCentre' },
  { text: 'Papier', hinweis: 'Navigator A4, FSC-zertifiziert' },
  { text: 'Ordner', hinweis: 'Leitz, A4, Wolkenmarmor' },
  { text: 'Videokonferenz', hinweis: 'Logitech Rally Bar, 4K' },
  { text: 'Monitorarm', hinweis: 'Ergotron LX, VESA' },
  { text: 'Salzsäure', hinweis: 'HCl 37%, Carl Roth, Laborqualität' },
  { text: 'Pipette', hinweis: 'Eppendorf Research Plus, 100-1000µL' },
  { text: 'Schutzbrille', hinweis: 'Uvex pheos, EN 166, Labor' },
  { text: 'Analysenwaage', hinweis: 'Sartorius Quintix, 0,1mg' },
  { text: 'Nitrilhandschuhe', hinweis: 'Puderfrei, EN 374, Gr. M' },
  { text: 'GPU', hinweis: 'NVIDIA A100, KI-Training, HPC' },
  { text: 'Raspberry Pi', hinweis: 'Pi 5, 8GB, Starter Kit' },
  { text: 'NAS', hinweis: 'Synology DS1621+, 6-Bay' },
  { text: 'Multimeter', hinweis: 'Keysight 34465A, 6½ Stellen' },
];

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function SearchBar({ onSearch, isLoading, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length >= 1
    ? SUGGESTIONS.filter((s) =>
        s.text.toLowerCase().includes(value.toLowerCase()) ||
        s.hinweis.toLowerCase().includes(value.toLowerCase())
      )
    : SUGGESTIONS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().length >= 2) {
      setShowSuggestions(false);
      onSearch(value.trim());
    }
  };

  const handleSelect = (text: string) => {
    setValue(text);
    setShowSuggestions(false);
    onSearch(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      handleSelect(filtered[selectedIdx].text);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full" ref={wrapperRef}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
        <Input
          placeholder="Artikel suchen... (z.B. Laptop, Bürostuhl, Monitor)"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
            setSelectedIdx(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          autoComplete="off"
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100">
              Vorschläge ({filtered.length})
            </div>
            {filtered.map((s, i) => (
              <button
                key={s.text}
                type="button"
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-primary-50 transition-colors ${
                  i === selectedIdx ? 'bg-primary-50' : ''
                }`}
                onClick={() => handleSelect(s.text)}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-sm text-gray-900">{s.text}</span>
                </div>
                <span className="text-xs text-gray-400 truncate">{s.hinweis}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading || value.trim().length < 2} size="lg">
        {isLoading ? 'Suche...' : 'Suchen'}
      </Button>
    </form>
  );
}
