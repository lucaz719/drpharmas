import { useState, useMemo } from "react";

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
}

export function useSearch<T>({ data, searchFields, filterFn }: UseSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && 
            String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    if (filterFn && Object.keys(filters).length > 0) {
      result = result.filter((item) => filterFn(item, filters));
    }

    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        
        return sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortBy, sortOrder, searchFields, filterFn]);

  const clearSearch = () => {
    setSearchTerm("");
    setFilters({});
    setSortBy("");
    setSortOrder("asc");
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData,
    clearSearch,
    resultCount: filteredData.length,
    totalCount: data.length,
  };
}