import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Download, Play, Save, Share,
  Plus, Filter, Calendar, FileText,
  BarChart3, PieChart, LineChart, TableIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const reportTemplates = [
  {
    id: 1,
    name: "Monthly Sales Summary",
    description: "Comprehensive sales performance analysis",
    category: "Sales",
    fields: ["Revenue", "Orders", "Products", "Customers"],
    chartType: "Bar Chart",
    lastUsed: "2024-06-10"
  },
  {
    id: 2,
    name: "Inventory Turnover Analysis",
    description: "Stock movement and turnover rates",
    category: "Inventory",
    fields: ["Stock Value", "Turnover Rate", "Fast Movers", "Slow Movers"],
    chartType: "Line Chart",
    lastUsed: "2024-06-08"
  },
  {
    id: 3,
    name: "Expense Breakdown Report",
    description: "Detailed expense categorization and trends",
    category: "Financial",
    fields: ["Total Expenses", "Categories", "Trends", "Budgets"],
    chartType: "Pie Chart",
    lastUsed: "2024-06-05"
  }
];

const availableFields = {
  Sales: ["Revenue", "Orders", "Order Value", "Customers", "Products Sold", "Profit Margin", "Sales Rep"],
  Inventory: ["Stock Value", "Quantity", "Turnover Rate", "Reorder Point", "Supplier", "Category", "Location"],
  Financial: ["Revenue", "Expenses", "Profit", "Cash Flow", "Budget", "Variance", "ROI"],
  Compliance: ["Audit Score", "Violations", "License Status", "Training Records", "Inspection Date"],
  Customer: ["Customer Name", "Purchase History", "Loyalty Points", "Contact Info", "Preferences"]
};

const chartTypes = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "table", label: "Table", icon: TableIcon }
];

export default function CustomReports() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Sales");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [chartType, setChartType] = useState("bar");

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

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
            <h2 className="text-3xl font-bold text-foreground">Custom Report Builder</h2>
            <p className="text-muted-foreground">Create and manage custom reports with advanced analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save size={16} className="mr-2" />
            Save Template
          </Button>
          <Button variant="outline">
            <Share size={16} className="mr-2" />
            Share
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Play size={16} className="mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="templates">Saved Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Report Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input 
                      id="reportName" 
                      placeholder="Enter report name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDescription">Description</Label>
                    <Textarea 
                      id="reportDescription" 
                      placeholder="Describe your report"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Data Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(availableFields).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chartType">Chart Type</Label>
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <type.icon size={16} className="mr-2" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Fields Selection */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Data Fields</CardTitle>
                  <p className="text-sm text-muted-foreground">Select the fields to include in your report</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableFields[selectedCategory as keyof typeof availableFields]?.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => handleFieldToggle(field)}
                        />
                        <Label htmlFor={field} className="text-sm font-medium">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Filters & Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Date From</Label>
                      <Input type="date" id="dateFrom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Date To</Label>
                      <Input type="date" id="dateTo" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalFilters">Additional Filters</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Add filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Product Category</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              {/* Report Preview */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-panel rounded-lg">
                      <h4 className="font-medium text-panel-foreground mb-2">
                        {reportName || "Untitled Report"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {reportDescription || "No description"}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="text-panel-foreground">{selectedCategory}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chart Type:</span>
                          <span className="text-panel-foreground">
                            {chartTypes.find(t => t.value === chartType)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fields:</span>
                          <span className="text-panel-foreground">{selectedFields.length}</span>
                        </div>
                      </div>
                    </div>

                    {selectedFields.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Selected Fields:</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedFields.map((field) => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Calendar size={16} className="mr-2" />
                    Schedule Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download size={16} className="mr-2" />
                    Export Template
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Filter size={16} className="mr-2" />
                    Advanced Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">Saved Report Templates</h3>
            <Button variant="outline">
              <Plus size={16} className="mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="bg-card border border-border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-card-foreground text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chart:</span>
                      <span className="text-foreground">{template.chartType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last used:</span>
                      <span className="text-foreground">{template.lastUsed}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">Scheduled Reports</h3>
            <Button variant="outline">
              <Plus size={16} className="mr-2" />
              Schedule New Report
            </Button>
          </div>

          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Report Name</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Frequency</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Next Run</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Recipients</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Weekly Sales Summary", frequency: "Weekly", nextRun: "2024-06-17", recipients: 3, status: "Active" },
                      { name: "Monthly Inventory Report", frequency: "Monthly", nextRun: "2024-07-01", recipients: 2, status: "Active" },
                      { name: "Quarterly Financial Analysis", frequency: "Quarterly", nextRun: "2024-09-01", recipients: 5, status: "Paused" }
                    ].map((report, index) => (
                      <tr key={index} className="border-b border-border hover:bg-panel transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{report.name}</td>
                        <td className="py-3 px-4 text-foreground">{report.frequency}</td>
                        <td className="py-3 px-4 text-foreground">{report.nextRun}</td>
                        <td className="py-3 px-4 text-foreground">{report.recipients} people</td>
                        <td className="py-3 px-4">
                          <Badge variant={report.status === 'Active' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              {report.status === 'Active' ? 'Pause' : 'Resume'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}