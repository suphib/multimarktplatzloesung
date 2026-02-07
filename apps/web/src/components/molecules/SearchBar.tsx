import { useState, useRef, useEffect, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../atoms';

interface Suggestion {
  text: string;
  hint: string;
  searchTerm?: string;
}

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function SearchBar({ onSearch, isLoading, initialValue = '' }: SearchBarProps) {
  const { t } = useTranslation();
  const suggestions = t('search.suggestions', { returnObjects: true }) as Suggestion[];

  const [value, setValue] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const filtered = value.trim().length >= 1
    ? suggestions.filter((s) =>
        s.text.toLowerCase().includes(value.toLowerCase()) ||
        s.hint.toLowerCase().includes(value.toLowerCase())
      )
    : suggestions;

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

  const handleSelect = (suggestion: Suggestion) => {
    const searchTerm = suggestion.searchTerm ?? suggestion.text;
    setValue(suggestion.text);
    setShowSuggestions(false);
    onSearch(searchTerm);
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
      handleSelect(filtered[selectedIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full" ref={wrapperRef}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
        <Input
          placeholder={t('search.placeholder')}
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
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
              {t('search.suggestionsLabel', { count: filtered.length })}
            </div>
            {filtered.map((s, i) => (
              <button
                key={s.text}
                type="button"
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors ${
                  i === selectedIdx ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                }`}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{s.text}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading || value.trim().length < 2} size="lg">
        {isLoading ? t('search.buttonLoading') : t('search.button')}
      </Button>
    </form>
  );
}
