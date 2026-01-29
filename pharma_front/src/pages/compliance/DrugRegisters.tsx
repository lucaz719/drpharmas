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
  Book, Calendar, CheckCircle, AlertTriangle,
  Package, Users, FileText, Clock, Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockDrugRegisters = [
  {
    id: "REG-001",
    registerName: "Narcotic and Psychotropic Drugs Register",
    registerType: "Narcotic Control",
    startDate: "2024-01-01",
    currentPage: 45,
    totalPages: 200,
    lastEntry: "2024-01-15",
    responsible: "Dr. Ram Sharma",
    location: "Main Pharmacy - Secure Storage",
    status: "active",
    regulatoryRef: "DDA Regulation 2023, Section 15",
    nextAudit: "2024-02-01",
    totalEntries: 1247,
    pendingEntries: 3,
    entries: [
      { date: "2024-01-15", time: "14:30", drug: "Morphine 10mg", batch: "MOR001", type: "Sale", quantity: 10, balance: 45, prescriptionNo: "RX-2024-001", customerName: "Patient ABC" },
      { date: "2024-01-14", time: "10:15", drug: "Codeine 30mg", batch: "COD002", type: "Purchase", quantity: 100, balance: 200, prescriptionNo: "PO-2024-001", customerName: "Supplier XYZ" },
      { date: "2024-01-13", time: "16:45", drug: "Tramadol 50mg", batch: "TRA003", type: "Sale", quantity: 20, balance: 180, prescriptionNo: "RX-2024-002", customerName: "Patient DEF" }
    ]
  },
  {
    id: "REG-002",
    registerName: "Prescription Drug Register",
    registerType: "Prescription Tracking",
    startDate: "2024-01-01",
    currentPage: 120,
    totalPages: 500,
    lastEntry: "2024-01-15",
    responsible: "Dr. Sita Gurung",
    location: "Main Pharmacy - Reception",
    status: "active",
    regulatoryRef: "DDA Regulation 2023, Section 12",
    nextAudit: "2024-03-01",
    totalEntries: 3456,
    pendingEntries: 0,
    entries: [
      { date: "2024-01-15", time: "15:20", drug: "Amoxicillin 500mg", batch: "AMX001", type: "Sale", quantity: 21, balance: 150, prescriptionNo: "RX-2024-003", customerName: "Patient GHI" },
      { date: "2024-01-15", time: "11:30", drug: "Insulin Pen", batch: "INS002", type: "Sale", quantity: 2, balance: 25, prescriptionNo: "RX-2024-004", customerName: "Patient JKL" },
      { date: "2024-01-14", time: "09:45", drug: "Lisinopril 10mg", batch: "LIS003", type: "Sale", quantity: 30, balance: 120, prescriptionNo: "RX-2024-005", customerName: "Patient MNO" }
    ]
  },
  {
    id: "REG-003",
    registerName: "Purchase and Procurement Register",
    registerType: "Inventory Control",
    startDate: "2024-01-01",
    currentPage: 25,
    totalPages: 100,
    lastEntry: "2024-01-12",
    responsible: "Purchase Manager",
    location: "Administrative Office",
    status: "active",
    regulatoryRef: "DDA Regulation 2023, Section 8",
    nextAudit: "2024-04-01",
    totalEntries: 245,
    pendingEntries: 1,
    entries: [
      { date: "2024-01-12", time: "10:00", drug: "Paracetamol 500mg", batch: "PAR001", type: "Purchase", quantity: 1000, balance: 1500, prescriptionNo: "PO-2024-002", customerName: "MediCorp Nepal" },
      { date: "2024-01-10", time: "14:30", drug: "Cetirizine 10mg", batch: "CET002", type: "Purchase", quantity: 500, balance: 750, prescriptionNo: "PO-2024-003", customerName: "PharmaCo Ltd" },
      { date: "2024-01-08", time: "11:15", drug: "Vitamin D3 1000IU", batch: "VIT003", type: "Purchase", quantity: 200, balance: 300, prescriptionNo: "PO-2024-004", customerName: "HealthPlus Supply" }
    ]
  },
  {
    id: "REG-004",
    registerName: "Disposal and Destruction Register",
    registerType: "Waste Management",
    startDate: "2024-01-01",
    currentPage: 8,
    totalPages: 50,
    lastEntry: "2024-01-10",
    responsible: "Quality Manager",
    location: "Quality Control Department",
    status: "active",
    regulatoryRef: "DDA Regulation 2023, Section 20",
    nextAudit: "2024-06-01",
    totalEntries: 67,
    pendingEntries: 2,
    entries: [
      { date: "2024-01-10", time: "13:00", drug: "Expired Aspirin 325mg", batch: "ASP001", type: "Disposal", quantity: 50, balance: 0, prescriptionNo: "DISP-2024-001", customerName: "Authorized Disposal Co." },
      { date: "2024-01-05", time: "15:30", drug: "Damaged Cough Syrup", batch: "COU002", type: "Disposal", quantity: 12, balance: 0, prescriptionNo: "DISP-2024-002", customerName: "Authorized Disposal Co." }
    ]
  },
  {
    id: "REG-005",
    registerName: "Adverse Drug Reaction Register",
    registerType: "Safety Monitoring",
    startDate: "2024-01-01",
    currentPage: 5,
    totalPages: 25,
    lastEntry: "2024-01-08",
    responsible: "Pharmacovigilance Officer",
    location: "Clinical Department",
    status: "active",
    regulatoryRef: "DDA Regulation 2023, Section 25",
    nextAudit: "2024-05-01",
    totalEntries: 23,
    pendingEntries: 1,
    entries: [
      { date: "2024-01-08", time: "16:20", drug: "Ibuprofen 400mg", batch: "IBU001", type: "ADR Report", quantity: 1, balance: 0, prescriptionNo: "ADR-2024-001", customerName: "Patient ABC - Skin Rash" },
      { date: "2024-01-03", time: "11:45", drug: "Amoxicillin 250mg", batch: "AMX002", type: "ADR Report", quantity: 1, balance: 0, prescriptionNo: "ADR-2024-002", customerName: "Patient DEF - Nausea" }
    ]
  }
];

export default function DrugRegisters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const { toast } = useToast();

  const registerTypes = [...new Set(mockDrugRegisters.map(register => register.registerType))];

  const filteredRegisters = mockDrugRegisters.filter(register => {
    const matchesSearch = register.registerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         register.registerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         register.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || register.registerType === typeFilter;
    const matchesStatus = statusFilter === "all" || register.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default", label: "Active", icon: CheckCircle },
      closed: { variant: "secondary", label: "Closed", icon: FileText },
      archived: { variant: "outline", label: "Archived", icon: Book },
      pending: { variant: "destructive", label: "Pending Review", icon: AlertTriangle }
    };
    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getUsagePercentage = (currentPage: number, totalPages: number) => {
    return Math.round((currentPage / totalPages) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-orange-600";
    return "text-red-600";
  };

  const handleCreateRegister = () => {
    toast({
      title: "Register Created",
      description: "New drug register has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleAddEntry = () => {
    toast({
      title: "Entry Added",
      description: "New entry has been added to the register.",
    });
    setIsEntryDialogOpen(false);
  };

  const handleExportRegister = (registerId: string) => {
    toast({
      title: "Export Started",
      description: `Exporting register ${registerId} to PDF format.`,
    });
  };

  // Calculate summary stats
  const totalRegisters = mockDrugRegisters.length;
  const activeRegisters = mockDrugRegisters.filter(r => r.status === "active").length;
  const totalEntries = mockDrugRegisters.reduce((sum, r) => sum + r.totalEntries, 0);
  const pendingEntries = mockDrugRegisters.reduce((sum, r) => sum + r.pendingEntries, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drug Registers</h1>
          <p className="text-muted-foreground">Maintain mandatory drug registers as per DDA regulations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create New Register
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Drug Register</DialogTitle>
              <DialogDescription>
                Set up a new drug register for regulatory compliance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registerName">Register Name</Label>
                  <Input placeholder="Enter register name" />
                </div>
                <div>
                  <Label htmlFor="registerType">Register Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narcotic">Narcotic Control</SelectItem>
                      <SelectItem value="prescription">Prescription Tracking</SelectItem>
                      <SelectItem value="inventory">Inventory Control</SelectItem>
                      <SelectItem value="disposal">Waste Management</SelectItem>
                      <SelectItem value="safety">Safety Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsible">Responsible Person</Label>
                  <Input placeholder="Name of responsible pharmacist" />
                </div>
                <div>
                  <Label htmlFor="location">Physical Location</Label>
                  <Input placeholder="Storage location of register" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label htmlFor="totalPages">Total Pages</Label>
                  <Input type="number" placeholder="Number of pages in register" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="regulatoryRef">Regulatory Reference</Label>
                <Input placeholder="DDA Regulation reference" />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea placeholder="Any additional notes or requirements..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRegister}>Create Register</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalRegisters}</p>
                <p className="text-sm text-muted-foreground">Total Registers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeRegisters}</p>
                <p className="text-sm text-muted-foreground">Active Registers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalEntries.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingEntries}</p>
                <p className="text-sm text-muted-foreground">Pending Entries</p>
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
                placeholder="Search registers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {registerTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drug Registers ({filteredRegisters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register Details</TableHead>
                  <TableHead>Responsible Person</TableHead>
                  <TableHead>Usage Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegisters.map((register) => {
                  const usagePercentage = getUsagePercentage(register.currentPage, register.totalPages);
                  return (
                    <TableRow key={register.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{register.registerName}</p>
                          <p className="text-sm text-muted-foreground">{register.registerType}</p>
                          <p className="text-xs text-muted-foreground">{register.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{register.responsible}</p>
                          <p className="text-sm text-muted-foreground">{register.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">Page {register.currentPage} of {register.totalPages}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${usagePercentage >= 80 ? 'bg-red-600' : 
                                         usagePercentage >= 50 ? 'bg-orange-600' : 'bg-green-600'}`}
                              style={{width: `${usagePercentage}%`}}
                            ></div>
                          </div>
                          <p className={`text-xs font-medium ${getUsageColor(usagePercentage)}`}>
                            {usagePercentage}% used
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">Last Entry: {register.lastEntry}</p>
                          <p className="text-sm">Entries: {register.totalEntries}</p>
                          {register.pendingEntries > 0 && (
                            <p className="text-xs text-orange-600">
                              {register.pendingEntries} pending
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getStatusBadge(register.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            Next audit: {register.nextAudit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedRegister(register)}>
                                <Eye size={12} className="mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedRegister?.registerName}</DialogTitle>
                              </DialogHeader>
                              {selectedRegister && (
                                <div className="space-y-6">
                                  {/* Register Information */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Register ID</Label>
                                      <p className="font-medium">{selectedRegister.id}</p>
                                    </div>
                                    <div>
                                      <Label>Type</Label>
                                      <p>{selectedRegister.registerType}</p>
                                    </div>
                                    <div>
                                      <Label>Responsible Person</Label>
                                      <p>{selectedRegister.responsible}</p>
                                    </div>
                                    <div>
                                      <Label>Location</Label>
                                      <p>{selectedRegister.location}</p>
                                    </div>
                                    <div>
                                      <Label>Start Date</Label>
                                      <p>{selectedRegister.startDate}</p>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <div className="mt-1">{getStatusBadge(selectedRegister.status)}</div>
                                    </div>
                                  </div>

                                  {/* Recent Entries */}
                                  <div>
                                    <Label>Recent Entries</Label>
                                    <div className="mt-2">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date/Time</TableHead>
                                            <TableHead>Drug</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead>Reference</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedRegister.entries.map((entry, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                <div>
                                                  <p className="text-sm">{entry.date}</p>
                                                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                <div>
                                                  <p className="text-sm font-medium">{entry.drug}</p>
                                                  <p className="text-xs text-muted-foreground">{entry.batch}</p>
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant={entry.type === "Sale" ? "default" : "secondary"}>
                                                  {entry.type}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{entry.quantity}</TableCell>
                                              <TableCell>{entry.balance}</TableCell>
                                              <TableCell>
                                                <div>
                                                  <p className="text-xs">{entry.prescriptionNo}</p>
                                                  <p className="text-xs text-muted-foreground">{entry.customerName}</p>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  {/* Regulatory Information */}
                                  <div className="bg-muted p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">Regulatory Compliance</h3>
                                    <p className="text-sm">{selectedRegister.regulatoryRef}</p>
                                    <p className="text-sm mt-1">Next audit scheduled: {selectedRegister.nextAudit}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedRegister(register)}>
                                <Plus size={12} className="mr-1" />
                                Add Entry
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Add New Entry</DialogTitle>
                                <DialogDescription>
                                  Add a new entry to {selectedRegister?.registerName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="entryDate">Date</Label>
                                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                  </div>
                                  <div>
                                    <Label htmlFor="entryTime">Time</Label>
                                    <Input type="time" defaultValue={new Date().toTimeString().split(' ')[0].substring(0, 5)} />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="drugName">Drug Name</Label>
                                    <Input placeholder="Enter drug name" />
                                  </div>
                                  <div>
                                    <Label htmlFor="batchNumber">Batch Number</Label>
                                    <Input placeholder="Enter batch number" />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="transactionType">Type</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="purchase">Purchase</SelectItem>
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="disposal">Disposal</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                        <SelectItem value="return">Return</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input type="number" placeholder="Enter quantity" />
                                  </div>
                                  <div>
                                    <Label htmlFor="balance">Current Balance</Label>
                                    <Input type="number" placeholder="Current stock balance" />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="referenceNo">Reference Number</Label>
                                    <Input placeholder="Prescription/Invoice/PO number" />
                                  </div>
                                  <div>
                                    <Label htmlFor="customerName">Customer/Supplier</Label>
                                    <Input placeholder="Name of customer or supplier" />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="remarks">Remarks</Label>
                                  <Textarea placeholder="Additional notes or remarks..." />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddEntry}>Add Entry</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExportRegister(register.id)}
                          >
                            <Download size={12} />
                          </Button>
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

      {/* Regulatory Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 text-blue-600" size={20} />
            DDA Register Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Mandatory Registers</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Narcotic and Psychotropic Drugs Register
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Prescription Drug Register
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Purchase and Procurement Register
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Disposal and Destruction Register
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Adverse Drug Reaction Register
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Compliance Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All entries must be made in chronological order</li>
                <li>• No blank pages or lines should be left</li>
                <li>• Corrections should be made with single line strike-through</li>
                <li>• Pages must be numbered and bound</li>
                <li>• Registers must be available for inspection at all times</li>
                <li>• Digital backups should be maintained where applicable</li>
                <li>• Responsible pharmacist must sign each page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}