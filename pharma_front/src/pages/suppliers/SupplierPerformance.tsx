import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, TrendingDown, Star, Clock, 
  Package, DollarSign, Truck, AlertTriangle,
  CheckCircle, Calendar, BarChart3, Target
} from "lucide-react";

const mockPerformanceData = [
  {
    id: "SUP-001",
    name: "MediCorp Nepal",
    totalOrders: 145,
    totalValue: 2500000,
    averageOrderValue: 17241,
    onTimeDeliveryRate: 92,
    qualityRating: 4.8,
    responseTime: 2.3,
    defectRate: 0.5,
    returnRate: 1.2,
    paymentTermsCompliance: 95,
    relationshipScore: 88,
    lastEvaluation: "2024-01-10",
    trend: "up",
    category: "Pharmaceutical",
    risk: "low"
  },
  {
    id: "SUP-002",
    name: "PharmaCo Ltd",
    totalOrders: 132,
    totalValue: 2200000,
    averageOrderValue: 16667,
    onTimeDeliveryRate: 87,
    qualityRating: 4.6,
    responseTime: 3.1,
    defectRate: 0.8,
    returnRate: 2.1,
    paymentTermsCompliance: 90,
    relationshipScore: 85,
    lastEvaluation: "2024-01-08",
    trend: "stable",
    category: "Pharmaceutical",
    risk: "low"
  },
  {
    id: "SUP-003",
    name: "HealthPlus Supply",
    totalOrders: 98,
    totalValue: 1800000,
    averageOrderValue: 18367,
    onTimeDeliveryRate: 78,
    qualityRating: 4.4,
    responseTime: 4.2,
    defectRate: 1.5,
    returnRate: 3.2,
    paymentTermsCompliance: 88,
    relationshipScore: 79,
    lastEvaluation: "2024-01-05",
    trend: "down",
    category: "Medical Devices",
    risk: "medium"
  },
  {
    id: "SUP-004",
    name: "NutriMed Pharma",
    totalOrders: 76,
    totalValue: 1200000,
    averageOrderValue: 15789,
    onTimeDeliveryRate: 85,
    qualityRating: 4.2,
    responseTime: 3.8,
    defectRate: 1.1,
    returnRate: 2.5,
    paymentTermsCompliance: 92,
    relationshipScore: 82,
    lastEvaluation: "2024-01-03",
    trend: "up",
    category: "Nutritional Supplements",
    risk: "low"
  },
  {
    id: "SUP-005",
    name: "BioPharma Industries",
    totalOrders: 12,
    totalValue: 350000,
    averageOrderValue: 29167,
    onTimeDeliveryRate: 67,
    qualityRating: 4.0,
    responseTime: 5.5,
    defectRate: 2.1,
    returnRate: 4.2,
    paymentTermsCompliance: 75,
    relationshipScore: 65,
    lastEvaluation: "2023-12-28",
    trend: "down",
    category: "Pharmaceutical",
    risk: "high"
  }
];

const performanceMetrics = [
  { label: "On-Time Delivery", weight: 25, target: 90 },
  { label: "Quality Rating", weight: 30, target: 4.5 },
  { label: "Response Time", weight: 15, target: 3.0 },
  { label: "Defect Rate", weight: 20, target: 1.0 },
  { label: "Payment Compliance", weight: 10, target: 95 }
];

export default function SupplierPerformance() {
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [timeRange, setTimeRange] = useState("6_months");
  const [metricFilter, setMetricFilter] = useState("overall");

  const filteredData = selectedSupplier === "all" 
    ? mockPerformanceData 
    : mockPerformanceData.filter(supplier => supplier.id === selectedSupplier);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />; // stable
    }
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "default",
      medium: "secondary",
      high: "destructive"
    };
    return <Badge variant={variants[risk] as any}>{risk} risk</Badge>;
  };

  const getPerformanceColor = (value: number, target: number, isLower: boolean = false) => {
    const threshold = isLower ? value <= target : value >= target;
    return threshold ? "text-green-600" : value >= target * 0.8 ? "text-orange-600" : "text-red-600";
  };

  const calculateOverallScore = (supplier: any) => {
    const scores = [
      (supplier.onTimeDeliveryRate / 100) * 25,
      (supplier.qualityRating / 5) * 30,
      (Math.max(0, 5 - supplier.responseTime) / 5) * 15,
      (Math.max(0, 3 - supplier.defectRate) / 3) * 20,
      (supplier.paymentTermsCompliance / 100) * 10
    ];
    return scores.reduce((sum, score) => sum + score, 0);
  };

  // Calculate aggregate metrics
  const totalOrders = mockPerformanceData.reduce((sum, s) => sum + s.totalOrders, 0);
  const totalValue = mockPerformanceData.reduce((sum, s) => sum + s.totalValue, 0);
  const avgOnTimeDelivery = mockPerformanceData.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / mockPerformanceData.length;
  const avgQualityRating = mockPerformanceData.reduce((sum, s) => sum + s.qualityRating, 0) / mockPerformanceData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplier Performance Analytics</h1>
          <p className="text-muted-foreground">Comprehensive supplier performance metrics and KPI tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">Last Month</SelectItem>
              <SelectItem value="3_months">Last 3 Months</SelectItem>
              <SelectItem value="6_months">Last 6 Months</SelectItem>
              <SelectItem value="1_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +12% vs last period
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">NPR {totalValue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +8% vs last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg On-Time Delivery</p>
                <p className="text-2xl font-bold">{avgOnTimeDelivery.toFixed(1)}%</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingDown size={12} className="mr-1" />
                  -2% vs last period
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Quality Rating</p>
                <p className="text-2xl font-bold">{avgQualityRating.toFixed(1)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +0.2 vs last period
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {mockPerformanceData.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={metricFilter} onValueChange={setMetricFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Performance</SelectItem>
                <SelectItem value="delivery">Delivery Performance</SelectItem>
                <SelectItem value="quality">Quality Metrics</SelectItem>
                <SelectItem value="financial">Financial Metrics</SelectItem>
                <SelectItem value="relationship">Relationship Metrics</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="w-full">
              <BarChart3 size={16} className="mr-2" />
              Generate Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance KPI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 text-blue-600" size={20} />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => {
                const avgValue = mockPerformanceData.reduce((sum, supplier) => {
                  switch (metric.label) {
                    case "On-Time Delivery":
                      return sum + supplier.onTimeDeliveryRate;
                    case "Quality Rating":
                      return sum + supplier.qualityRating;
                    case "Response Time":
                      return sum + supplier.responseTime;
                    case "Defect Rate":
                      return sum + supplier.defectRate;
                    case "Payment Compliance":
                      return sum + supplier.paymentTermsCompliance;
                    default:
                      return sum;
                  }
                }, 0) / mockPerformanceData.length;

                const isTarget = metric.label === "Response Time" || metric.label === "Defect Rate" 
                  ? avgValue <= metric.target 
                  : avgValue >= metric.target;

                return (
                  <div key={metric.label} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{metric.label}</span>
                        <span className={`font-bold ${isTarget ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.label === "Quality Rating" ? avgValue.toFixed(1) : 
                           metric.label === "Response Time" ? `${avgValue.toFixed(1)} hrs` :
                           metric.label === "Defect Rate" ? `${avgValue.toFixed(1)}%` :
                           `${avgValue.toFixed(1)}%`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Weight: {metric.weight}%</span>
                        <span>Target: {metric.label === "Quality Rating" ? metric.target : 
                                      metric.label === "Response Time" ? `${metric.target} hrs` :
                                      `${metric.target}%`}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${isTarget ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{width: `${Math.min(100, (avgValue / metric.target) * 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-orange-600" size={20} />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Critical Alert</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  BioPharma Industries has 67% on-time delivery rate (Target: 90%)
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Warning</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  HealthPlus Supply response time increased to 4.2 hours (Target: 3.0 hours)
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Quality Concern</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  NutriMed Pharma quality rating dropped to 4.2 (Target: 4.5)
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Excellent</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  MediCorp Nepal exceeds all performance targets consistently
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Supplier Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Delivery Rate</TableHead>
                  <TableHead>Quality Rating</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Defect Rate</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((supplier) => {
                  const overallScore = calculateOverallScore(supplier);
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${overallScore >= 80 ? 'text-green-600' : 
                                           overallScore >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                            {overallScore.toFixed(1)}
                          </span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${overallScore >= 80 ? 'bg-green-600' : 
                                         overallScore >= 60 ? 'bg-orange-600' : 'bg-red-600'}`}
                              style={{width: `${overallScore}%`}}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getPerformanceColor(supplier.onTimeDeliveryRate, 90)}>
                          {supplier.onTimeDeliveryRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          <span className={getPerformanceColor(supplier.qualityRating, 4.5)}>
                            {supplier.qualityRating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getPerformanceColor(supplier.responseTime, 3.0, true)}>
                          {supplier.responseTime}h
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getPerformanceColor(supplier.defectRate, 1.0, true)}>
                          {supplier.defectRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">NPR {supplier.totalValue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{supplier.totalOrders} orders</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(supplier.risk)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(supplier.trend)}
                          <span className="text-sm">{supplier.trend}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}