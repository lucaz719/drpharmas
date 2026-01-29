import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'select';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export function useAdvancedFilter<T extends Record<string, any>>(data: T[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters(prev => {
      const existingIndex = prev.findIndex(f => f.field === filter.field);
      if (existingIndex >= 0) {
        const newFilters = [...prev];
        newFilters[existingIndex] = filter;
        return newFilters;
      }
      return [...prev, filter];
    });
    setCurrentPage(1);
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const addSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(s => s.field === field);
      const newSort = { field, direction };
      
      if (existingIndex >= 0) {
        const newSorts = [...prev];
        newSorts[existingIndex] = newSort;
        return newSorts;
      }
      return [newSort, ...prev];
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSortConfig(prev => prev.filter(s => s.field !== field));
  }, []);

  const applyFilter = useCallback((item: T, filter: FilterConfig): boolean => {
    const value = item[filter.field];
    const filterValue = filter.value;

    switch (filter.operator) {
      case 'equals':
        return value === filterValue;
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'greaterThan':
        return Number(value) > Number(filterValue);
      case 'lessThan':
        return Number(value) < Number(filterValue);
      case 'between':
        return Number(value) >= Number(filterValue[0]) && Number(value) <= Number(filterValue[1]);
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      default:
        return true;
    }
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    result = result.filter(item =>
      filters.every(filter => applyFilter(item, filter))
    );

    // Apply sorting
    if (sortConfig.length > 0) {
      result.sort((a, b) => {
        for (const sort of sortConfig) {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
          
          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, applyFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  return {
    // Data
    filteredData: filteredAndSortedData,
    paginatedData,
    
    // Search
    searchTerm,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    
    // Filters
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    
    // Sorting
    sortConfig,
    addSort,
    removeSort,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage: (items: number) => {
      setItemsPerPage(items);
      setCurrentPage(1);
    },
    totalPages,
    
    // Stats
    totalItems: data.length,
    filteredItems: filteredAndSortedData.length,
  };
}