import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string | number;
  name: string;
  contact?: string;
  current_stock?: number;
  unit?: string;
  strength?: string;
  dosage_form?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  onSearch?: (query: string) => Promise<Option[]>;
}

export default function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  className,
  onSearch
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Option[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Option | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = onSearch ? searchResults : options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle async search
  useEffect(() => {
    if (onSearch && searchTerm.trim()) {
      setIsSearching(true);
      const searchTimeout = setTimeout(async () => {
        try {
          const results = await onSearch(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      return () => clearTimeout(searchTimeout);
    } else if (!onSearch) {
      setSearchResults([]);
    }
  }, [searchTerm, onSearch]);

  const selectedOption = options.find(option => option.id === value) || 
                         searchResults.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedProduct(option);
    onValueChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedProduct ? selectedProduct.name : placeholder}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="p-2 text-sm text-muted-foreground">Searching...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {searchTerm ? 'No products found' : 'Type to search products'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(option)}
                >
                  <div>
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
                  {value === option.id && <Check className="h-4 w-4" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}