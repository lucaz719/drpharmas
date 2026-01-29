import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Filter, Download, Upload, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedFilter, FilterConfig } from '@/hooks/useAdvancedFilter';
import { useExport } from '@/hooks/useExport';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'string' | 'number' | 'date' | 'boolean' | 'select';
  filterOptions?: { label: string; value: any }[];
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  exportable?: boolean;
  printable?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchable = true,
  exportable = true,
  printable = true,
  className = ''
}: DataTableProps<T>) {
  const [showFilters, setShowFilters] = useState(false);
  const { exportToCSV, exportToPDF } = useExport();
  
  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    sortConfig,
    addSort,
    removeSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems,
    filteredItems
  } = useAdvancedFilter(data);

  const handleSort = (field: string) => {
    const existingSort = sortConfig.find(s => s.field === field);
    if (existingSort) {
      if (existingSort.direction === 'asc') {
        addSort(field, 'desc');
      } else {
        removeSort(field);
      }
    } else {
      addSort(field, 'asc');
    }
  };

  const handleFilterChange = (column: Column<T>, operator: string, value: any) => {
    if (value === '' || value === null || value === undefined) {
      removeFilter(String(column.key));
    } else {
      addFilter({
        field: String(column.key),
        operator: operator as any,
        value,
        type: column.filterType || 'string'
      });
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => item[col.key] || '')
    );
    
    exportToCSV({
      headers,
      rows,
      filename: title ? title.toLowerCase().replace(/\s+/g, '-') : 'data-export',
      title
    });
  };

  const handleExportPDF = () => {
    exportToPDF('data-table-container', title ? title.toLowerCase().replace(/\s+/g, '-') : 'data-export');
  };

  const getSortIcon = (field: string) => {
    const sort = sortConfig.find(s => s.field === field);
    if (!sort) return null;
    return sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {title && <CardTitle className="text-xl">{title}</CardTitle>}
            <p className="text-sm text-muted-foreground mt-1">
              Showing {filteredItems} of {totalItems} items
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.length}
                </Badge>
              )}
            </Button>
            
            {exportable && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </>
            )}
            
            {printable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.filter(col => col.filterable).map((column) => (
                <div key={String(column.key)} className="space-y-2">
                  <label className="text-sm font-medium">{column.label}</label>
                  {column.filterType === 'select' && column.filterOptions ? (
                    <Select onValueChange={(value) => handleFilterChange(column, 'equals', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {column.filterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={`Filter by ${column.label.toLowerCase()}`}
                      onChange={(e) => handleFilterChange(column, 'contains', e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {filters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Badge
                    key={filter.field}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeFilter(filter.field)}
                  >
                    {columns.find(col => String(col.key) === filter.field)?.label}: {String(filter.value)} ×
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div id="data-table-container" className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`text-left p-3 font-medium ${
                      column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && getSortIcon(String(column.key))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="p-3">
                      {column.render 
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}