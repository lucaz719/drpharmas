import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface Option {
  id: string | number;
  name: string;
  contact?: string;
  current_stock?: number;
  unit?: string;
  strength?: string;
  dosage_form?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: Option) => void;
  onSearch: (query: string) => Promise<Option[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  onSearch,
  placeholder = "Type to search...",
  className,
  disabled = false
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = async (inputValue: string) => {
    if (disabled) return;
    
    onChange(inputValue);
    
    if (inputValue.length >= 2) {
      setIsSearching(true);
      try {
        const results = await onSearch(inputValue);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelect = (option: Option) => {
    onSelect(option);
    setShowSuggestions(false);
    setSuggestions([]);
  };



  return (
    <div className="relative" ref={inputRef}>
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (!disabled && value.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {isSearching ? (
            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              {value.length >= 2 ? 'No results found' : 'Type to search'}
            </div>
          ) : (
            suggestions.map((option) => (
              <div
                key={option.id}
                className="px-2 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium">{option.name}</div>
                {option.strength && option.dosage_form && (
                  <div className="text-xs text-muted-foreground">
                    {option.strength} - {option.dosage_form}
                  </div>
                )}
                {option.contact && (
                  <div className="text-xs text-muted-foreground">{option.contact}</div>
                )}
                {option.current_stock !== undefined && (
                  <div className="text-xs text-green-600">
                    Stock: {option.current_stock} {option.unit}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}