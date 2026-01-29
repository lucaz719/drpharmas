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
  Search, Plus, Edit, Eye, Download, Upload,
  Building, Calendar, CheckCircle, AlertTriangle,
  Star, Users, FileText, Clock, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockInspections = [
  {
    id: "INS-001",
    inspectionType: "Routine Inspection",
    inspectorName: "Dr. Krishna Bahadur",
    inspectorId: "DDA-INS-001",
    inspectionDate: "2024-01-15",
    scheduledDate: "2024-01-15",
    duration: "4 hours",
    status: "completed",
    result: "passed",
    score: 92,
    maxScore: 100,
    department: "Department of Drug Administration",
    license: "DDA/P/2023/001",
    location: "Main Pharmacy",
    checklist: [
      { item: "License Display", status: "compliant", notes: "License properly displayed" },
      { item: "Drug Storage", status: "compliant", notes: "Temperature controlled storage maintained" },
      { item: "Record Keeping", status: "minor_issue", notes: "Some records missing dates" },
      { item: "Staff Qualification", status: "compliant", notes: "All staff properly qualified" },
      { item: "Prescription Handling", status: "compliant", notes: "Proper procedures followed" }
    ],
    violations: [
      { type: "Minor", description: "Some prescription records missing complete dates", penalty: 1000 }
    ],
    recommendations: [
      "Ensure all prescription records include complete date and time",
      "Consider digital record keeping system",
      "Update staff training on documentation"
    ],
    followUpRequired: true,
    followUpDate: "2024-02-15",
    certificate: "INS-CERT-001.pdf",
    inspectorContact: "+977-1-4428763"
  },
  {
    id: "INS-002",
    inspectionType: "Narcotic License Inspection",
    inspectorName: "Dr. Sita Devi Sharma",
    inspectorId: "DDA-INS-002",
    inspectionDate: "2024-01-10",
    scheduledDate: "2024-01-10",
    duration: "6 hours",
    status: "completed",
    result: "conditional_pass",
    score: 78,
    maxScore: 100,
    department: "Department of Drug Administration",
    license: "DDA/NAR/2023/003",
    location: "Narcotic Storage Area",
    checklist: [
      { item: "Narcotic Storage Security", status: "compliant", notes: "Double lock system in place" },
      { item: "Stock Register", status: "major_issue", notes: "Discrepancies in stock balance" },
      { item: "Disposal Records", status: "compliant", notes: "Proper disposal documentation" },
      { item: "Staff Authorization", status: "minor_issue", notes: "One staff member certification expired" },
      { item: "Access Control", status: "compliant", notes: "Restricted access properly maintained" }
    ],
    violations: [
      { type: "Major", description: "Stock register shows discrepancy of 50 tablets", penalty: 15000 },
      { type: "Minor", description: "Staff certification not updated", penalty: 2000 }
    ],
    recommendations: [
      "Conduct immediate stock audit",
      "Implement daily stock verification",
      "Update staff certifications within 30 days",
      "Install CCTV in narcotic storage area"
    ],
    followUpRequired: true,
    followUpDate: "2024-02-10",
    certificate: null,
    inspectorContact: "+977-1-4428763"
  },
  {
    id: "INS-003",
    inspectionType: "Surprise Inspection",
    inspectorName: "Dr. Ram Krishna Poudel",
    inspectorId: "DDA-INS-003",
    inspectionDate: "2024-01-05",
    scheduledDate: null,
    duration: "3 hours",
    status: "completed",
    result: "passed",
    score: 88,
    maxScore: 100,
    department: "Department of Drug Administration",
    license: "DDA/P/2023/001",
    location: "Main Pharmacy",
    checklist: [
      { item: "Emergency Procedures", status: "compliant", notes: "Emergency contacts displayed" },
      { item: "Customer Service", status: "compliant", notes: "Good customer interaction observed" },
      { item: "Inventory Management", status: "minor_issue", notes: "Some expired items found on shelf" },
      { item: "Prescription Verification", status: "compliant", notes: "Proper verification process" },
      { item: "Hygiene Standards", status: "compliant", notes: "Clean and hygienic environment" }
    ],
    violations: [
      { type: "Minor", description: "3 expired OTC medicines found on display", penalty: 3000 }
    ],
    recommendations: [
      "Implement daily expiry check routine",
      "Use inventory management software with expiry alerts",
      "Train staff on regular shelf inspection"
    ],
    followUpRequired: false,
    followUpDate: null,
    certificate: "INS-CERT-003.pdf",
    inspectorContact: "+977-1-4428763"
  },
  {
    id: "INS-004",
    inspectionType: "License Renewal Inspection",
    inspectorName: "Dr. Maya Gurung",
    inspectorId: "DDA-INS-004",
    inspectionDate: "2024-02-01",
    scheduledDate: "2024-02-01",
    duration: "5 hours",
    status: "pending",
    result: "pending",
    score: null,
    maxScore: 100,
    department: "Department of Drug Administration",
    license: "DDA/P/2023/001",
    location: "Main Pharmacy",
    checklist: [],
    violations: [],
    recommendations: [],
    followUpRequired: false,
    followUpDate: null,
    certificate: null,
    inspectorContact: "+977-1-4428763"
  }
];

export default function InspectionRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const { toast } = useToast();

  const inspectionTypes = [...new Set(mockInspections.map(inspection => inspection.inspectionType))];

  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = inspection.inspectionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.license.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter;
    const matchesType = typeFilter === "all" || inspection.inspectionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default", label: "Completed", icon: CheckCircle },
      pending: { variant: "outline", label: "Pending", icon: Clock },
      scheduled: { variant: "secondary", label: "Scheduled", icon: Calendar },
      cancelled: { variant: "destructive", label: "Cancelled", icon: AlertTriangle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getResultBadge = (result: string) => {
    const resultConfig = {
      passed: { variant: "default", label: "Passed", color: "text-green-600" },
      conditional_pass: { variant: "secondary", label: "Conditional Pass", color: "text-orange-600" },
      failed: { variant: "destructive", label: "Failed", color: "text-red-600" },
      pending: { variant: "outline", label: "Pending", color: "text-gray-600" }
    };
    const config = resultConfig[result] || resultConfig.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getComplianceStatus = (status: string) => {
    const colors = {
      compliant: "text-green-600",
      minor_issue: "text-orange-600",
      major_issue: "text-red-600"
    };
    return colors[status] || "text-gray-600";
  };

  const handleScheduleInspection = () => {
    toast({
      title: "Inspection Scheduled",
      description: "Inspection has been scheduled successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleDocumentDownload = (inspectionId: string, document: string) => {
    toast({
      title: "Document Downloaded",
      description: `Downloaded ${document} for inspection ${inspectionId}`,
    });
  };

  // Calculate summary stats
  const totalInspections = mockInspections.length;
  const passedInspections = mockInspections.filter(i => i.result === "passed").length;
  const pendingInspections = mockInspections.filter(i => i.status === "pending").length;
  const avgScore = mockInspections.filter(i => i.score).reduce((sum, i) => sum + i.score, 0) / mockInspections.filter(i => i.score).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inspection Records</h1>
          <p className="text-muted-foreground">Track DDA inspections, compliance status, and follow-up actions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Schedule Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
              <DialogDescription>
                Request or schedule an inspection with DDA
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionType">Inspection Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Inspection</SelectItem>
                      <SelectItem value="renewal">License Renewal Inspection</SelectItem>
                      <SelectItem value="narcotic">Narcotic License Inspection</SelectItem>
                      <SelectItem value="complaint">Complaint Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input type="date" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license">Related License</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DDA/P/2023/001">Pharmacy Operating License</SelectItem>
                      <SelectItem value="DDA/NAR/2023/003">Narcotic License</SelectItem>
                      <SelectItem value="DDA/DS/2023/002">Drug Store License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Inspection Location</Label>
                  <Input placeholder="Main Pharmacy, Branch, etc." />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason / Purpose</Label>
                <Textarea placeholder="Describe the reason for this inspection..." />
              </div>
              
              <div>
                <Label htmlFor="preparation">Preparation Notes</Label>
                <Textarea placeholder="Documents to prepare, areas to focus on, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleInspection}>Schedule Inspection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalInspections}</p>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{passedInspections}</p>
                <p className="text-sm text-muted-foreground">Passed Inspections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingInspections}</p>
                <p className="text-sm text-muted-foreground">Pending Inspections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
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
                placeholder="Search inspections..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {inspectionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Records
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Records ({filteredInspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inspection Details</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Date & Duration</TableHead>
                  <TableHead>Status & Result</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inspection.inspectionType}</p>
                        <p className="text-sm text-muted-foreground">{inspection.license}</p>
                        <p className="text-xs text-muted-foreground">{inspection.location}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inspection.inspectorName}</p>
                        <p className="text-sm text-muted-foreground">{inspection.inspectorId}</p>
                        <p className="text-xs text-muted-foreground">{inspection.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Date: {inspection.inspectionDate}</p>
                        {inspection.scheduledDate && inspection.scheduledDate !== inspection.inspectionDate && (
                          <p className="text-xs text-muted-foreground">Scheduled: {inspection.scheduledDate}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Duration: {inspection.duration}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(inspection.status)}
                        {inspection.result !== "pending" && getResultBadge(inspection.result)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {inspection.score ? (
                        <div>
                          <p className={`font-bold ${inspection.score >= 90 ? 'text-green-600' : 
                                        inspection.score >= 75 ? 'text-orange-600' : 'text-red-600'}`}>
                            {inspection.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">of {inspection.maxScore}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inspection.followUpRequired ? (
                        <div>
                          <p className="text-sm font-medium text-orange-600">Required</p>
                          <p className="text-xs text-muted-foreground">{inspection.followUpDate}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedInspection(inspection)}>
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Inspection Report - {selectedInspection?.inspectionType}</DialogTitle>
                            </DialogHeader>
                            {selectedInspection && (
                              <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Inspection ID</Label>
                                    <p className="font-medium">{selectedInspection.id}</p>
                                  </div>
                                  <div>
                                    <Label>Inspector</Label>
                                    <p>{selectedInspection.inspectorName}</p>
                                  </div>
                                  <div>
                                    <Label>Date</Label>
                                    <p>{selectedInspection.inspectionDate}</p>
                                  </div>
                                  <div>
                                    <Label>Duration</Label>
                                    <p>{selectedInspection.duration}</p>
                                  </div>
                                </div>

                                {/* Checklist */}
                                {selectedInspection.checklist.length > 0 && (
                                  <div>
                                    <Label>Inspection Checklist</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedInspection.checklist.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                          <span className="font-medium">{item.item}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm ${getComplianceStatus(item.status)}`}>
                                              {item.status.replace('_', ' ')}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Violations */}
                                {selectedInspection.violations.length > 0 && (
                                  <div>
                                    <Label>Violations Found</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedInspection.violations.map((violation, index) => (
                                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <Badge variant="destructive" className="mb-2">
                                                {violation.type}
                                              </Badge>
                                              <p className="text-sm">{violation.description}</p>
                                            </div>
                                            <span className="font-medium">NPR {violation.penalty}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {selectedInspection.recommendations.length > 0 && (
                                  <div>
                                    <Label>Recommendations</Label>
                                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                      {selectedInspection.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Contact Information */}
                                <div className="bg-muted p-4 rounded-lg">
                                  <h3 className="font-medium mb-2">Inspector Contact</h3>
                                  <p className="text-sm">{selectedInspection.inspectorContact}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {inspection.certificate && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDocumentDownload(inspection.id, inspection.certificate)}
                          >
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

      {/* Inspector Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 text-blue-600" size={20} />
            DDA Inspector Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Dr. Krishna Bahadur</h3>
              <p className="text-sm text-muted-foreground">
                Senior Inspector - General Pharmacy<br />
                ID: DDA-INS-001<br />
                Phone: +977-1-4428763
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Dr. Sita Devi Sharma</h3>
              <p className="text-sm text-muted-foreground">
                Specialist - Narcotic Control<br />
                ID: DDA-INS-002<br />
                Phone: +977-1-4428763
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Dr. Ram Krishna Poudel</h3>
              <p className="text-sm text-muted-foreground">
                Inspector - Quality Assurance<br />
                ID: DDA-INS-003<br />
                Phone: +977-1-4428763
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}