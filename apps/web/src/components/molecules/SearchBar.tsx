import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button, Input } from '../atoms';

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function SearchBar({ onSearch, isLoading, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().length >= 2) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Artikel suchen... (z.B. Laptop, Buerostuhl)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" disabled={isLoading || value.trim().length < 2} size="lg">
        {isLoading ? 'Suche...' : 'Suchen'}
      </Button>
    </form>
  );
}
