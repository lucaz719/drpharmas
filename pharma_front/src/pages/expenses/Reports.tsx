import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Download, Calendar, TrendingUp, 
  DollarSign, BarChart3, PieChart, FileSpreadsheet, Package, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI, ExpenseCategory, Expense, InventoryLoss } from "@/services/expensesAPI";

export default function ExpenseReports() {
  const [dateRange, setDateRange] = useState({ from: "2025-01-01", to: "2025-12-31" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventoryLosses, setInventoryLosses] = useState<InventoryLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, expensesRes, lossesRes] = await Promise.all([
        expensesAPI.getCategories(),
        expensesAPI.getExpenses(),
        expensesAPI.getInventoryLosses()
      ]);
      
      console.log('Categories Response:', categoriesRes);
      console.log('Expenses Response:', expensesRes);
      console.log('Losses Response:', lossesRes);
      
      const categoriesData = categoriesRes.data?.results || categoriesRes.data || [];
      const expensesData = expensesRes.data?.results || expensesRes.data || [];
      const lossesData = lossesRes.data?.results || lossesRes.data || [];
      
      console.log('Processed Categories:', categoriesData);
      console.log('Processed Expenses:', expensesData);
      console.log('Processed Losses:', lossesData);
      
      setCategories(categoriesData);
      setExpenses(expensesData);
      setInventoryLosses(lossesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filteredExpenses = expenses.filter(expense => {
    if (!expense.created_at) return false;
    const expenseDate = new Date(expense.created_at);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999); // Include full end date
    console.log('Expense date:', expenseDate, 'Range:', fromDate, 'to', toDate, 'Included:', expenseDate >= fromDate && expenseDate <= toDate);
    return expenseDate >= fromDate && expenseDate <= toDate;
  });

  const filteredInventoryLosses = inventoryLosses.filter(loss => {
    if (!loss.created_at) return false;
    const lossDate = new Date(loss.created_at);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999); // Include full end date
    console.log('Loss date:', lossDate, 'Range:', fromDate, 'to', toDate, 'Included:', lossDate >= fromDate && lossDate <= toDate);
    return lossDate >= fromDate && lossDate <= toDate;
  });

  // Calculate monthly data for last 6 months
  const monthlyData = (() => {
    const months = [];
    const now = new Date();
    
    // Get last 6 months including current month
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.created_at!);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      });
      
      const monthLosses = filteredInventoryLosses.filter(loss => {
        const lossDate = new Date(loss.created_at!);
        return lossDate.getMonth() === month && lossDate.getFullYear() === year;
      });
      
      const expenseAmount = monthExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount?.toString() || '0') || 0), 0);
      const lossAmount = monthLosses.reduce((sum, loss) => sum + (parseFloat(loss.total_loss?.toString() || '0') || 0), 0);
      
      months.push({
        month: monthName,
        year,
        amount: expenseAmount + lossAmount,
        transactions: monthExpenses.length + monthLosses.length,
        expenseAmount,
        lossAmount
      });
    }
    
    return months;
  })();

  // Calculate category data
  const categoryData = (() => {
    const categoryMap = new Map();
    
    // Add regular expenses by category
    filteredExpenses.forEach(expense => {
      const categoryName = expense.category_name || 'Other';
      const current = categoryMap.get(categoryName) || { amount: 0, count: 0 };
      categoryMap.set(categoryName, {
        amount: current.amount + (parseFloat(expense.amount?.toString() || '0') || 0),
        count: current.count + 1
      });
    });
    
    // Add inventory losses as a separate category
    const totalLossAmount = filteredInventoryLosses.reduce((sum, loss) => sum + (parseFloat(loss.total_loss?.toString() || '0') || 0), 0);
    if (totalLossAmount > 0) {
      categoryMap.set('Inventory Loss', {
        amount: totalLossAmount,
        count: filteredInventoryLosses.length
      });
    }
    
    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  })();

  // Recent expenses (last 10)
  const recentExpenses = [...filteredExpenses]
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 10);

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  const totalRegularExpenses = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount?.toString() || '0') || 0), 0);
  const totalInventoryLoss = filteredInventoryLosses.reduce((sum, loss) => sum + (parseFloat(loss.total_loss?.toString() || '0') || 0), 0);
  const thisMonthData = monthlyData[monthlyData.length - 1] || { amount: 0, transactions: 0 };
  const lastMonthData = monthlyData[monthlyData.length - 2] || { amount: 0, transactions: 0 };
  const monthlyGrowth = lastMonthData.amount > 0 ? ((thisMonthData.amount - lastMonthData.amount) / lastMonthData.amount) * 100 : 0;
  
  const exportToPDF = () => {
    toast({ title: "Export", description: "PDF export functionality coming soon" });
  };
  
  const exportToCSV = () => {
    const csvData = [
      ['Date', 'Type', 'Category/Item', 'Amount', 'Description'],
      ...filteredExpenses.map(exp => [
        new Date(exp.created_at!).toLocaleDateString(),
        'Expense',
        exp.category_name || 'Other',
        parseFloat(exp.amount?.toString() || '0').toString(),
        exp.description
      ]),
      ...filteredInventoryLosses.map(loss => [
        new Date(loss.created_at!).toLocaleDateString(),
        'Inventory Loss',
        loss.item_name,
        loss.total_loss || '0',
        `${loss.reason} - Qty: ${loss.quantity}`
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Reports</h2>
          <p className="text-muted-foreground">Analyze spending patterns and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <FileSpreadsheet size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Date Range:</span>
              <Input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input 
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Category:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id?.toString()}>{category.name}</option>
                ))}
                <option value="inventory_loss">Inventory Loss</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">NPR {totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign className="text-primary" size={24} />
            </div>
            <p className={`text-xs mt-1 ${monthlyGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  NPR {thisMonthData.amount.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-success" size={24} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{thisMonthData.transactions} transactions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. per Transaction</p>
                <p className="text-2xl font-bold text-foreground">
                  NPR {totalExpenses > 0 && monthlyData.reduce((sum, m) => sum + m.transactions, 0) > 0 ? Math.round(totalExpenses / monthlyData.reduce((sum, m) => sum + m.transactions, 0)).toLocaleString() : '0'}
                </p>
              </div>
              <BarChart3 className="text-warning" size={24} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent data</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Loss</p>
                <p className="text-2xl font-bold text-red-600">NPR {totalInventoryLoss.toLocaleString()}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{filteredInventoryLosses.length} loss records</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <BarChart3 className="mr-2 text-primary" size={20} />
              Monthly Expense Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.length > 0 ? (
                <>
                  {/* Timeline Chart */}
                  <div className="h-40 relative mb-6 bg-gradient-to-b from-blue-50 to-white rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="66.67" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 66.67 0 L 0 0 0 24" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Y-axis labels */}
                      {(() => {
                        const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                        const steps = [0, maxAmount * 0.25, maxAmount * 0.5, maxAmount * 0.75, maxAmount];
                        return steps.map((value, i) => (
                          <text key={i} x="5" y={100 - (i * 20)} fontSize="8" fill="#6b7280" className="text-xs">
                            {Math.round(value).toLocaleString()}
                          </text>
                        ));
                      })()}
                      
                      {/* Line Chart */}
                      {(() => {
                        const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                        const points = monthlyData.map((data, index) => {
                          const x = 40 + (index * 60);
                          const y = 100 - ((data.amount / maxAmount) * 80);
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            {/* Area under curve */}
                            <path
                              d={`M 40,100 L ${points} L ${40 + ((monthlyData.length - 1) * 60)},100 Z`}
                              fill="url(#gradient)"
                              opacity="0.3"
                            />
                            {/* Main line */}
                            <polyline
                              points={points}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Data points */}
                            {monthlyData.map((data, index) => {
                              const x = 40 + (index * 60);
                              const y = 100 - ((data.amount / maxAmount) * 80);
                              return (
                                <g key={index}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-4 transition-all cursor-pointer"
                                  />
                                  <text x={x} y="115" fontSize="10" fill="#6b7280" textAnchor="middle" className="text-xs">
                                    {data.month}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Hover tooltips */}
                    <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                      Hover points for details
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">NPR {monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}</div>
                      <div className="text-xs text-blue-600">Total (6 months)</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">NPR {Math.round(monthlyData.reduce((sum, m) => sum + m.amount, 0) / 6).toLocaleString()}</div>
                      <div className="text-xs text-green-600">Monthly Average</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{monthlyData.reduce((sum, m) => sum + m.transactions, 0)}</div>
                      <div className="text-xs text-purple-600">Total Transactions</div>
                    </div>
                  </div>
                  
                  {/* Monthly Breakdown */}
                  <div className="space-y-2">
                    {monthlyData.map((data, index) => {
                      const prevAmount = index > 0 ? monthlyData[index - 1].amount : data.amount;
                      const growth = prevAmount > 0 ? ((data.amount - prevAmount) / prevAmount) * 100 : 0;
                      return (
                        <div key={`${data.month}-${data.year}-detail`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-12 text-sm font-medium text-foreground">{data.month}</span>
                            <div className="flex gap-2">
                              {data.expenseAmount > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Exp: NPR {data.expenseAmount.toLocaleString()}
                                </span>
                              )}
                              {data.lossAmount > 0 && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Loss: NPR {data.lossAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">NPR {data.amount.toLocaleString()}</p>
                              {index > 0 && (
                                <span className={`text-xs px-1 py-0.5 rounded ${growth >= 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{data.transactions} transactions</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No expense data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <PieChart className="mr-2 text-success" size={20} />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.length > 0 ? categoryData.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3`} 
                         style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                    <span className="text-sm text-foreground">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">NPR {category.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground">
                  <PieChart size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Category/Item</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Branch</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
                  <tr key={`exp-${expense.id}`} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4 text-foreground">
                      {new Date(expense.created_at!).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <DollarSign size={12} className="mr-1" />Expense
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground">{expense.category_name || 'Other'}</td>
                    <td className="py-3 px-4 font-medium text-foreground">NPR {parseFloat(expense.amount?.toString() || '0').toLocaleString()}</td>
                    <td className="py-3 px-4 text-foreground max-w-xs truncate">{expense.description}</td>
                    <td className="py-3 px-4 text-foreground">{expense.pharmacy}</td>
                  </tr>
                )) : null}
                {filteredInventoryLosses.length > 0 ? filteredInventoryLosses.slice(0, 5).map((loss) => (
                  <tr key={`loss-${loss.id}`} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4 text-foreground">
                      {new Date(loss.created_at!).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        <Package size={12} className="mr-1" />Loss
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground">{loss.item_name}</td>
                    <td className="py-3 px-4 font-medium text-red-600">NPR {parseFloat(loss.total_loss || '0').toLocaleString()}</td>
                    <td className="py-3 px-4 text-foreground">{loss.reason} - Qty: {loss.quantity}</td>
                    <td className="py-3 px-4 text-foreground">{loss.pharmacy}</td>
                  </tr>
                )) : null}
                {recentExpenses.length === 0 && filteredInventoryLosses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No expense records found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}