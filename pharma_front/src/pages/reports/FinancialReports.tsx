import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { 
  ArrowLeft, Download, Filter, Calendar,
  DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  CreditCard, Wallet, Calculator, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const financialData = [
  { month: "Jan", revenue: 124500, expenses: 87200, profit: 37300, cashFlow: 25600 },
  { month: "Feb", revenue: 132000, expenses: 89800, profit: 42200, cashFlow: 31400 },
  { month: "Mar", revenue: 118000, expenses: 92100, profit: 25900, cashFlow: 18200 },
  { month: "Apr", revenue: 145000, expenses: 94500, profit: 50500, cashFlow: 42800 },
  { month: "May", revenue: 152000, expenses: 97200, profit: 54800, cashFlow: 48600 },
  { month: "Jun", revenue: 139000, expenses: 89300, profit: 49700, cashFlow: 38900 }
];

const expenseBreakdown = [
  { category: "Inventory Purchase", value: 45, amount: 43740, color: "#1f77b4" },
  { category: "Staff Salaries", value: 25, amount: 24325, color: "#ff7f0e" },
  { category: "Rent & Utilities", value: 15, amount: 14595, color: "#2ca02c" },
  { category: "Equipment & Maintenance", value: 8, amount: 7786, color: "#d62728" },
  { category: "Marketing & Admin", value: 7, amount: 6811, color: "#9467bd" }
];

const cashFlowData = [
  { week: "Week 1", inflow: 35600, outflow: 28900, net: 6700 },
  { week: "Week 2", inflow: 42300, outflow: 31200, net: 11100 },
  { week: "Week 3", inflow: 38900, outflow: 29800, net: 9100 },
  { week: "Week 4", inflow: 44200, outflow: 33100, net: 11100 }
];

const profitMargins = [
  { category: "Prescription Drugs", margin: 32.5, revenue: 68400 },
  { category: "OTC Medicines", margin: 28.8, revenue: 34200 },
  { category: "Health Products", margin: 42.1, revenue: 18900 },
  { category: "Personal Care", margin: 35.6, revenue: 12800 },
  { category: "Equipment", margin: 18.2, revenue: 8700 }
];

const financialMetrics = [
  { label: "Total Revenue", value: "$152,000", change: "+9.2%", trend: "up", icon: DollarSign },
  { label: "Net Profit", value: "$54,800", change: "+8.4%", trend: "up", icon: TrendingUp },
  { label: "Profit Margin", value: "36.1%", change: "+1.2%", trend: "up", icon: Target },
  { label: "Cash Flow", value: "$48,600", change: "+25%", trend: "up", icon: Wallet }
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--success))",
  },
  cashFlow: {
    label: "Cash Flow",
    color: "hsl(var(--warning))",
  },
};

export default function FinancialReports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Financial Reports</h2>
            <p className="text-muted-foreground">Revenue, expenses, and financial health analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Date Range
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {financialMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp size={10} className="mr-1" />
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                      <Bar dataKey="expenses" fill="var(--color-expenses)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-success/10 border border-success/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="mx-auto text-success mb-2" size={32} />
                  <p className="text-2xl font-bold text-success">36.1%</p>
                  <p className="text-sm text-success">Profit Margin</p>
                  <p className="text-xs text-muted-foreground mt-1">Above industry average</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="mx-auto text-primary mb-2" size={32} />
                  <p className="text-2xl font-bold text-primary">$312,000</p>
                  <p className="text-sm text-primary">YTD Revenue</p>
                  <p className="text-xs text-muted-foreground mt-1">+12% vs last year</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning/10 border border-warning/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calculator className="mx-auto text-warning mb-2" size={32} />
                  <p className="text-2xl font-bold text-warning">2.8x</p>
                  <p className="text-sm text-warning">ROI</p>
                  <p className="text-xs text-muted-foreground mt-1">Return on Investment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Margins by Category */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profit Margins by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitMargins.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">{item.category}</span>
                        <div className="text-right">
                          <span className="font-bold text-foreground">{item.margin}%</span>
                          <p className="text-xs text-muted-foreground">${item.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.margin}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profitability Trends */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Monthly Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="var(--color-profit)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-profit)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Profitability Analysis */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Key Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-sm font-medium text-success">Strong Performance</p>
                      <p className="text-xs text-muted-foreground">Health Products showing highest margins at 42.1%</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium text-primary">Growth Opportunity</p>
                      <p className="text-xs text-muted-foreground">Equipment category has room for margin improvement</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm font-medium text-warning">Monitor Closely</p>
                      <p className="text-xs text-muted-foreground">Keep expenses under control to maintain margins</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-panel rounded-lg">
                      <p className="text-sm font-medium text-panel-foreground">Focus on Health Products</p>
                      <p className="text-xs text-muted-foreground">Expand high-margin health product lines</p>
                    </div>
                    <div className="p-3 bg-panel rounded-lg">
                      <p className="text-sm font-medium text-panel-foreground">Optimize Equipment Sales</p>
                      <p className="text-xs text-muted-foreground">Review pricing strategy for equipment category</p>
                    </div>
                    <div className="p-3 bg-panel rounded-lg">
                      <p className="text-sm font-medium text-panel-foreground">Cost Management</p>
                      <p className="text-xs text-muted-foreground">Regular review of operational expenses</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Details */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Expense Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((expense) => (
                    <div key={expense.category} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        <span className="font-medium text-panel-foreground">{expense.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-panel-foreground">${expense.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{expense.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Trends */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Cash Flow Analysis */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Weekly Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="inflow" fill="var(--color-profit)" />
                      <Bar dataKey="outflow" fill="var(--color-expenses)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="mx-auto text-success mb-2" size={24} />
                    <p className="text-xl font-bold text-foreground">$161,000</p>
                    <p className="text-sm text-muted-foreground">Total Inflow</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingDown className="mx-auto text-destructive mb-2" size={24} />
                    <p className="text-xl font-bold text-foreground">$123,000</p>
                    <p className="text-sm text-muted-foreground">Total Outflow</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wallet className="mx-auto text-primary mb-2" size={24} />
                    <p className="text-xl font-bold text-foreground">$38,000</p>
                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CreditCard className="mx-auto text-warning mb-2" size={24} />
                    <p className="text-xl font-bold text-foreground">$85,000</p>
                    <p className="text-sm text-muted-foreground">Cash Balance</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}