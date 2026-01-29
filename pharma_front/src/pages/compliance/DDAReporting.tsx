import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Plus, Eye, Download, Upload, Send,
  FileText, Calendar, CheckCircle, Clock,
  AlertTriangle, TrendingUp, BarChart3, Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockReports = [
  {
    id: "RPT-001",
    reportType: "Monthly Drug Sales Report",
    reportPeriod: "January 2024",
    submissionDeadline: "2024-02-10",
    submissionDate: "2024-02-08",
    status: "submitted",
    submittedBy: "Dr. Ram Sharma",
    fileSize: "2.4 MB",
    format: "PDF",
    sections: ["Allopathic medicines", "Ayurvedic medicines", "OTC drugs", "Controlled substances"],
    compliance: "compliant",
    feedback: "Report submitted on time with all required sections"
  },
  {
    id: "RPT-002",
    reportType: "Narcotic Drug Register",
    reportPeriod: "January 2024",
    submissionDeadline: "2024-02-05",
    submissionDate: null,
    status: "overdue",
    submittedBy: null,
    fileSize: null,
    format: "Excel",
    sections: ["Narcotic purchases", "Sales records", "Stock balance", "Disposal records"],
    compliance: "non_compliant",
    feedback: "Submission overdue - immediate action required"
  },
  {
    id: "RPT-003",
    reportType: "Adverse Drug Reaction Report",
    reportPeriod: "December 2023",
    submissionDeadline: "2024-01-15",
    submissionDate: "2024-01-12",
    status: "submitted",
    submittedBy: "Dr. Sita Gurung",
    fileSize: "1.1 MB",
    format: "PDF",
    sections: ["Incident reports", "Patient details", "Drug information", "Outcome"],
    compliance: "compliant",
    feedback: "Well documented report with proper follow-up"
  },
  {
    id: "RPT-004",
    reportType: "Quarterly Financial Report",
    reportPeriod: "Q4 2023",
    submissionDeadline: "2024-01-30",
    submissionDate: "2024-01-28",
    status: "under_review",
    submittedBy: "Finance Manager",
    fileSize: "5.2 MB",
    format: "Excel",
    sections: ["Revenue summary", "Tax details", "Expense breakdown", "Profit analysis"],
    compliance: "pending",
    feedback: "Under review by DDA finance department"
  },
  {
    id: "RPT-005",
    reportType: "Drug Import Declaration",
    reportPeriod: "January 2024",
    submissionDeadline: "2024-02-15",
    submissionDate: null,
    status: "draft",
    submittedBy: null,
    fileSize: null,
    format: "PDF",
    sections: ["Import details", "Supplier information", "Quality certificates", "Custom clearance"],
    compliance: "pending",
    feedback: "Draft in preparation"
  }
];

const reportTemplates = [
  { id: 1, name: "Monthly Drug Sales Report", frequency: "Monthly", nextDue: "2024-03-10" },
  { id: 2, name: "Narcotic Drug Register", frequency: "Monthly", nextDue: "2024-03-05" },
  { id: 3, name: "Adverse Drug Reaction", frequency: "As needed", nextDue: "N/A" },
  { id: 4, name: "Quarterly Financial Report", frequency: "Quarterly", nextDue: "2024-04-30" },
  { id: 5, name: "Annual License Renewal", frequency: "Annually", nextDue: "2024-12-31" }
];

export default function DDAReporting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const { toast } = useToast();

  const reportTypes = [...new Set(mockReports.map(report => report.reportType))];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.reportType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { variant: "default", label: "Submitted", icon: CheckCircle },
      draft: { variant: "outline", label: "Draft", icon: FileText },
      overdue: { variant: "destructive", label: "Overdue", icon: AlertTriangle },
      under_review: { variant: "secondary", label: "Under Review", icon: Clock }
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getComplianceBadge = (compliance: string) => {
    const variants = {
      compliant: "default",
      non_compliant: "destructive",
      pending: "outline"
    };
    return <Badge variant={variants[compliance] as any}>{compliance.replace('_', ' ')}</Badge>;
  };

  const handleReportSubmission = () => {
    toast({
      title: "Report Submitted",
      description: "Report has been submitted to DDA successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleFileUpload = (reportId: string) => {
    toast({
      title: "File Uploaded",
      description: `File uploaded for report ${reportId}`,
    });
  };

  // Calculate summary stats
  const totalReports = mockReports.length;
  const submittedReports = mockReports.filter(r => r.status === "submitted").length;
  const overdueReports = mockReports.filter(r => r.status === "overdue").length;
  const draftReports = mockReports.filter(r => r.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DDA Reporting System</h1>
          <p className="text-muted-foreground">Manage Department of Drug Administration reports and submissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Generate a new report for DDA submission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly_sales">Monthly Drug Sales Report</SelectItem>
                      <SelectItem value="narcotic_register">Narcotic Drug Register</SelectItem>
                      <SelectItem value="adr_report">Adverse Drug Reaction Report</SelectItem>
                      <SelectItem value="financial_report">Quarterly Financial Report</SelectItem>
                      <SelectItem value="import_declaration">Drug Import Declaration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reportPeriod">Reporting Period</Label>
                  <Input placeholder="e.g., January 2024" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label htmlFor="format">Report Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="word">Word Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="sections">Report Sections (comma-separated)</Label>
                <Textarea placeholder="e.g., Sales data, Inventory summary, Compliance status" />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea placeholder="Any special instructions or notes for this report..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Save as Draft
              </Button>
              <Button onClick={handleReportSubmission}>Create Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{submittedReports}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overdueReports}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{draftReports}</p>
                <p className="text-sm text-muted-foreground">In Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 text-blue-600" size={20} />
              Upcoming Report Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.frequency} • Next due: {template.nextDue}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus size={12} className="mr-1" />
                    Create
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              Compliance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-muted-foreground">On-time Submissions</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-muted-foreground">Reports This Year</p>
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-lg font-bold text-orange-600">Next Deadline: 5 days</p>
                <p className="text-sm text-muted-foreground">Narcotic Drug Register</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {reportTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>DDA Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Details</TableHead>
                  <TableHead>Period & Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Submission Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className={report.status === "overdue" ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.reportType}</p>
                        <p className="text-sm text-muted-foreground">{report.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.sections.length} sections
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Period: {report.reportPeriod}</p>
                        <p className="text-sm">Due: {report.submissionDeadline}</p>
                        {report.submissionDate && (
                          <p className="text-xs text-green-600">
                            Submitted: {report.submissionDate}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getComplianceBadge(report.compliance)}</TableCell>
                    <TableCell>
                      <div>
                        {report.submittedBy && (
                          <p className="text-sm">By: {report.submittedBy}</p>
                        )}
                        {report.fileSize && (
                          <p className="text-sm">Size: {report.fileSize}</p>
                        )}
                        {report.format && (
                          <p className="text-xs text-muted-foreground">Format: {report.format}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Report Details - {report.reportType}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Report ID</Label>
                                  <p className="font-medium">{report.id}</p>
                                </div>
                                <div>
                                  <Label>Report Period</Label>
                                  <p>{report.reportPeriod}</p>
                                </div>
                                <div>
                                  <Label>Submission Deadline</Label>
                                  <p>{report.submissionDeadline}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(report.status)}</div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Report Sections</Label>
                                <ul className="list-disc list-inside text-sm mt-1">
                                  {report.sections.map((section, index) => (
                                    <li key={index}>{section}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <Label>Feedback / Notes</Label>
                                <p className="text-sm bg-muted p-3 rounded">{report.feedback}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {report.status === "draft" && (
                          <Button size="sm" onClick={() => handleFileUpload(report.id)}>
                            <Upload size={12} className="mr-1" />
                            Upload
                          </Button>
                        )}
                        
                        {report.status === "submitted" && (
                          <Button size="sm" variant="outline">
                            <Download size={12} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DDA Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 text-blue-600" size={20} />
            DDA Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Drug Administration Department</h3>
              <p className="text-sm text-muted-foreground">
                Babarmahal, Kathmandu<br />
                Phone: +977-1-4428763<br />
                Email: info@dda.gov.np
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Online Submission Portal</h3>
              <p className="text-sm text-muted-foreground">
                Submit reports electronically<br />
                24/7 online access<br />
                Real-time status tracking
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Support Helpline</h3>
              <p className="text-sm text-muted-foreground">
                Technical Support: +977-1-4428764<br />
                Working Hours: 10 AM - 5 PM<br />
                Sunday to Friday
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}