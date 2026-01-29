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
  Award, AlertTriangle, Calendar, CheckCircle,
  FileText, Clock, Building, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockLicenses = [
  {
    id: "LIC-001",
    licenseNumber: "DDA/P/2023/001",
    licenseName: "Pharmacy Operating License",
    licenseType: "Pharmacy Operation",
    issuer: "Department of Drug Administration",
    issueDate: "2023-01-15",
    expiryDate: "2024-12-31",
    status: "active",
    renewalRequired: false,
    daysUntilExpiry: 340,
    renewalFee: 15000,
    documentsRequired: ["Pharmacy certificate", "Pharmacist registration", "Business registration"],
    contactPerson: "Dr. Ram Sharma",
    phoneNumber: "+977-1-4428763",
    address: "Babarmahal, Kathmandu",
    notes: "Primary pharmacy operating license for main location"
  },
  {
    id: "LIC-002",
    licenseNumber: "DDA/DS/2023/002",
    licenseName: "Drug Store License",
    licenseType: "Drug Store",
    issuer: "Department of Drug Administration",
    issueDate: "2023-06-01",
    expiryDate: "2024-06-30",
    status: "active",
    renewalRequired: true,
    daysUntilExpiry: 155,
    renewalFee: 8000,
    documentsRequired: ["Drug store certificate", "Business registration", "Tax clearance"],
    contactPerson: "Dr. Sita Gurung",
    phoneNumber: "+977-1-4428764",
    address: "Babarmahal, Kathmandu",
    notes: "License for over-the-counter drug sales"
  },
  {
    id: "LIC-003",
    licenseNumber: "DDA/NAR/2023/003",
    licenseName: "Narcotic and Psychotropic License",
    licenseType: "Narcotic Control",
    issuer: "Department of Drug Administration",
    issueDate: "2023-12-01",
    expiryDate: "2024-02-28",
    status: "expiring",
    renewalRequired: true,
    daysUntilExpiry: 15,
    renewalFee: 25000,
    documentsRequired: ["Security clearance", "Narcotic storage certificate", "Pharmacist license"],
    contactPerson: "Dr. Hari Thapa",
    phoneNumber: "+977-1-4428765",
    address: "Babarmahal, Kathmandu",
    notes: "Critical license for controlled substances - urgent renewal required"
  },
  {
    id: "LIC-004",
    licenseNumber: "DAV/AY/2023/004",
    licenseName: "Ayurvedic Medicine License",
    licenseType: "Ayurvedic Practice",
    issuer: "Department of Ayurveda and Alternative Medicine",
    issueDate: "2023-03-15",
    expiryDate: "2024-09-15",
    status: "active",
    renewalRequired: false,
    daysUntilExpiry: 233,
    renewalFee: 10000,
    documentsRequired: ["Ayurvedic practitioner certificate", "Business registration"],
    contactPerson: "Vaidya Maya Shrestha",
    phoneNumber: "+977-1-4428766",
    address: "Babarmahal, Kathmandu",
    notes: "License for traditional Ayurvedic medicine sales"
  },
  {
    id: "LIC-005",
    licenseNumber: "MUN/TRADE/2023/005",
    licenseName: "Municipal Trade License",
    licenseType: "Business Operation",
    issuer: "Kathmandu Metropolitan City",
    issueDate: "2023-04-01",
    expiryDate: "2024-04-01",
    status: "active",
    renewalRequired: true,
    daysUntilExpiry: 67,
    renewalFee: 5000,
    documentsRequired: ["Business registration", "Tax clearance", "Property documents"],
    contactPerson: "Municipal Office",
    phoneNumber: "+977-1-4200000",
    address: "City Hall, Kathmandu",
    notes: "Required for business operation within municipal area"
  }
];

export default function LicenseManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const { toast } = useToast();

  const licenseTypes = [...new Set(mockLicenses.map(license => license.licenseType))];

  const filteredLicenses = mockLicenses.filter(license => {
    const matchesSearch = license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || license.status === statusFilter;
    const matchesType = typeFilter === "all" || license.licenseType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    if (status === "expired") {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    }
    if (status === "active") {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getPriorityLevel = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) return "critical";
    if (daysUntilExpiry <= 30) return "high";
    if (daysUntilExpiry <= 90) return "medium";
    return "low";
  };

  const handleRenewalSubmission = () => {
    toast({
      title: "Renewal Application Submitted",
      description: "License renewal application has been submitted successfully.",
    });
    setIsRenewalDialogOpen(false);
  };

  const handleDocumentUpload = (licenseId: string) => {
    toast({
      title: "Document Uploaded",
      description: `Document uploaded for license ${licenseId}`,
    });
  };

  // Calculate summary stats
  const totalLicenses = mockLicenses.length;
  const activeLicenses = mockLicenses.filter(l => l.status === "active").length;
  const expiringLicenses = mockLicenses.filter(l => l.daysUntilExpiry <= 30).length;
  const overdueRenewals = mockLicenses.filter(l => l.renewalRequired && l.daysUntilExpiry <= 7).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">License Management</h1>
          <p className="text-muted-foreground">Manage all pharmacy licenses and regulatory permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add New License
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New License</DialogTitle>
              <DialogDescription>
                Register a new license or permit for tracking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseName">License Name</Label>
                  <Input placeholder="Enter license name" />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input placeholder="DDA/P/YYYY/XXX" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacy">Pharmacy Operation</SelectItem>
                      <SelectItem value="drug_store">Drug Store</SelectItem>
                      <SelectItem value="narcotic">Narcotic Control</SelectItem>
                      <SelectItem value="ayurvedic">Ayurvedic Practice</SelectItem>
                      <SelectItem value="business">Business Operation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issuer">Issuing Authority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issuer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dda">Department of Drug Administration</SelectItem>
                      <SelectItem value="davam">Dept. of Ayurveda & Alternative Medicine</SelectItem>
                      <SelectItem value="municipal">Municipal Office</SelectItem>
                      <SelectItem value="ocr">Office of Company Registrar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input type="date" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea placeholder="Additional notes about this license..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Add License</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalLicenses}</p>
                <p className="text-sm text-muted-foreground">Total Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeLicenses}</p>
                <p className="text-sm text-muted-foreground">Active Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{expiringLicenses}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overdueRenewals}</p>
                <p className="text-sm text-muted-foreground">Overdue Renewals</p>
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
                placeholder="Search licenses..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {licenseTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* License Table */}
      <Card>
        <CardHeader>
          <CardTitle>License Registry ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Details</TableHead>
                  <TableHead>Type & Issuer</TableHead>
                  <TableHead>Validity Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewal Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id} className={license.daysUntilExpiry <= 7 ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{license.licenseName}</p>
                        <p className="text-sm text-muted-foreground">{license.licenseNumber}</p>
                        <p className="text-xs text-muted-foreground">{license.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{license.licenseType}</p>
                        <p className="text-sm text-muted-foreground">{license.issuer}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Issued: {license.issueDate}</p>
                        <p className="text-sm">Expires: {license.expiryDate}</p>
                        <p className={`text-xs font-medium ${
                          license.daysUntilExpiry <= 7 ? "text-red-600" :
                          license.daysUntilExpiry <= 30 ? "text-orange-600" : "text-green-600"
                        }`}>
                          {license.daysUntilExpiry} days remaining
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(license.status, license.daysUntilExpiry)}
                    </TableCell>
                    <TableCell>
                      <div>
                        {license.renewalRequired && (
                          <p className="text-sm font-medium text-orange-600">Renewal Required</p>
                        )}
                        <p className="text-sm">Fee: NPR {license.renewalFee.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {license.documentsRequired.length} docs required
                        </p>
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
                              <DialogTitle>License Details - {license.licenseName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>License Number</Label>
                                  <p className="font-medium">{license.licenseNumber}</p>
                                </div>
                                <div>
                                  <Label>License Type</Label>
                                  <p>{license.licenseType}</p>
                                </div>
                                <div>
                                  <Label>Issuing Authority</Label>
                                  <p>{license.issuer}</p>
                                </div>
                                <div>
                                  <Label>Contact Person</Label>
                                  <p>{license.contactPerson}</p>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <p>{license.phoneNumber}</p>
                                </div>
                                <div>
                                  <Label>Address</Label>
                                  <p>{license.address}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Required Documents</Label>
                                <ul className="list-disc list-inside text-sm mt-1">
                                  {license.documentsRequired.map((doc, index) => (
                                    <li key={index}>{doc}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <Label>Notes</Label>
                                <p className="text-sm bg-muted p-3 rounded">{license.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {license.renewalRequired && (
                          <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedLicense(license)}>
                                Renew
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>License Renewal Application</DialogTitle>
                                <DialogDescription>
                                  Submit renewal application for {selectedLicense?.licenseName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                  <h3 className="font-medium mb-2">Renewal Requirements</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label>Renewal Fee</Label>
                                      <p className="font-medium">NPR {selectedLicense?.renewalFee.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label>Processing Time</Label>
                                      <p>7-14 working days</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Required Documents</Label>
                                  <div className="space-y-2 mt-2">
                                    {selectedLicense?.documentsRequired.map((doc, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                                        <span className="text-sm">{doc}</span>
                                        <Button size="sm" variant="outline" onClick={() => handleDocumentUpload(selectedLicense.id)}>
                                          <Upload size={12} className="mr-1" />
                                          Upload
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Additional Notes</Label>
                                  <Textarea placeholder="Any additional information for the renewal application..." />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRenewalDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleRenewalSubmission}>Submit Renewal</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Edit size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="mr-2 text-blue-600" size={20} />
            Official License Portals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Building size={16} />
                <span className="font-medium">DDA License Portal</span>
              </div>
              <p className="text-sm text-muted-foreground">Apply and renew DDA licenses online</p>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} />
                <span className="font-medium">Municipal License</span>
              </div>
              <p className="text-sm text-muted-foreground">Municipal trade license services</p>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} />
                <span className="font-medium">License Verification</span>
              </div>
              <p className="text-sm text-muted-foreground">Verify license authenticity online</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}