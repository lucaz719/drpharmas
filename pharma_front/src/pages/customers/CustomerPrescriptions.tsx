import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Search, Calendar, User, Clock, AlertTriangle, CheckCircle, Eye, Edit, Trash2, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockPrescriptions = [
  {
    id: "P001",
    prescriptionNumber: "RX-2024-001",
    customerId: "C001",
    customerName: "Ram Sharma",
    customerAge: 38,
    customerGender: "Male",
    doctorName: "Dr. Sita Rai",
    doctorLicense: "DL-12345",
    clinic: "Kathmandu Medical Center",
    issueDate: "2024-01-15",
    expiryDate: "2024-02-15",
    status: "active",
    urgency: "normal",
    medications: [
      {
        name: "Metformin HCl",
        strength: "500mg",
        form: "Tablet",
        quantity: 60,
        dosage: "1 tablet twice daily",
        duration: "30 days",
        instructions: "Take with meals"
      },
      {
        name: "Lisinopril",
        strength: "10mg", 
        form: "Tablet",
        quantity: 30,
        dosage: "1 tablet once daily",
        duration: "30 days",
        instructions: "Take in the morning"
      }
    ],
    diagnosis: "Type 2 Diabetes, Hypertension",
    notes: "Patient education provided on diabetes management",
    dispensedBy: "Pharmacist A",
    dispensedDate: "2024-01-15",
    branch: "Central Pharmacy",
    totalAmount: 1250,
    insuranceCovered: 750,
    patientPaid: 500
  },
  {
    id: "P002",
    prescriptionNumber: "RX-2024-002",
    customerId: "C002",
    customerName: "Sita Gurung",
    customerAge: 33,
    customerGender: "Female",
    doctorName: "Dr. Ram Poudel",
    doctorLicense: "DL-54321",
    clinic: "Pokhara General Hospital",
    issueDate: "2024-01-12",
    expiryDate: "2024-02-12",
    status: "completed",
    urgency: "urgent",
    medications: [
      {
        name: "Salbutamol",
        strength: "100mcg",
        form: "Inhaler",
        quantity: 2,
        dosage: "2 puffs as needed",
        duration: "As required",
        instructions: "Use during asthma attacks"
      },
      {
        name: "Prednisolone",
        strength: "5mg",
        form: "Tablet", 
        quantity: 20,
        dosage: "1 tablet daily",
        duration: "10 days",
        instructions: "Take with food, taper dose"
      }
    ],
    diagnosis: "Acute Asthma Exacerbation",
    notes: "Emergency prescription for asthma management",
    dispensedBy: "Pharmacist B", 
    dispensedDate: "2024-01-12",
    branch: "Branch Pharmacy A",
    totalAmount: 980,
    insuranceCovered: 0,
    patientPaid: 980
  },
  {
    id: "P003",
    prescriptionNumber: "RX-2024-003",
    customerId: "C003",
    customerName: "Hari Thapa",
    customerAge: 45,
    customerGender: "Male",
    doctorName: "Dr. Maya Singh",
    doctorLicense: "DL-67890",
    clinic: "Chitwan Medical College",
    issueDate: "2024-01-10",
    expiryDate: "2024-02-10",
    status: "partially_filled",
    urgency: "normal",
    medications: [
      {
        name: "Atorvastatin",
        strength: "20mg",
        form: "Tablet",
        quantity: 30,
        dosage: "1 tablet at bedtime",
        duration: "30 days", 
        instructions: "Take with water"
      },
      {
        name: "Ibuprofen",
        strength: "400mg",
        form: "Tablet",
        quantity: 20,
        dosage: "1 tablet twice daily",
        duration: "10 days",
        instructions: "Take with food"
      }
    ],
    diagnosis: "Hypercholesterolemia, Arthritis",
    notes: "Monitor liver function tests",
    dispensedBy: "Pharmacist C",
    dispensedDate: "2024-01-10",
    branch: "Express Pharmacy",
    totalAmount: 1850,
    insuranceCovered: 1110,
    patientPaid: 740
  }
];

const prescriptionStatuses = ["all", "active", "completed", "partially_filled", "expired", "cancelled"];
const urgencyLevels = ["all", "normal", "urgent", "emergency"];
const medicationForms = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Inhaler", "Drops"];

export default function CustomerPrescriptions() {
  const [prescriptions] = useState(mockPrescriptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    customerId: "",
    customerName: "",
    doctorName: "",
    doctorLicense: "",
    clinic: "",
    diagnosis: "",
    notes: "",
    urgency: "normal",
    medications: []
  });
  const { toast } = useToast();

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || prescription.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      partially_filled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      expired: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return <Badge className={styles[status] || styles.active}>{status.replace('_', ' ')}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      normal: "bg-gray-100 text-gray-800 border-gray-200",
      urgent: "bg-orange-100 text-orange-800 border-orange-200",
      emergency: "bg-red-100 text-red-800 border-red-200"
    };
    return <Badge className={styles[urgency] || styles.normal}>{urgency}</Badge>;
  };

  const handleAddPrescription = () => {
    if (!newPrescription.customerName || !newPrescription.doctorName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Prescription added successfully"
    });
    
    setShowAddDialog(false);
    setNewPrescription({
      customerId: "",
      customerName: "",
      doctorName: "",
      doctorLicense: "",
      clinic: "",
      diagnosis: "",
      notes: "",
      urgency: "normal",
      medications: []
    });
  };

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const totalPrescriptions = prescriptions.length;
  const activePrescriptions = prescriptions.filter(p => p.status === "active").length;
  const urgentPrescriptions = prescriptions.filter(p => p.urgency === "urgent" || p.urgency === "emergency").length;
  const expiringPrescriptions = prescriptions.filter(p => calculateDaysUntilExpiry(p.expiryDate) <= 7 && p.status === "active").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Prescriptions</h1>
          <p className="text-muted-foreground">Manage customer prescriptions and medication history</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="animate-fade-in">
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Prescription</DialogTitle>
              <DialogDescription>Enter prescription details and medications</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name *</Label>
                  <Input
                    id="customer"
                    value={newPrescription.customerName}
                    onChange={(e) => setNewPrescription({...newPrescription, customerName: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={newPrescription.customerId}
                    onChange={(e) => setNewPrescription({...newPrescription, customerId: e.target.value})}
                    placeholder="Customer ID"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor Name *</Label>
                  <Input
                    id="doctor"
                    value={newPrescription.doctorName}
                    onChange={(e) => setNewPrescription({...newPrescription, doctorName: e.target.value})}
                    placeholder="Dr. Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Doctor License</Label>
                  <Input
                    id="license"
                    value={newPrescription.doctorLicense}
                    onChange={(e) => setNewPrescription({...newPrescription, doctorLicense: e.target.value})}
                    placeholder="DL-XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clinic/Hospital</Label>
                  <Input
                    id="clinic"
                    value={newPrescription.clinic}
                    onChange={(e) => setNewPrescription({...newPrescription, clinic: e.target.value})}
                    placeholder="Clinic name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                    placeholder="Patient diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={newPrescription.urgency} onValueChange={(value) => setNewPrescription({...newPrescription, urgency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                  placeholder="Any special instructions or notes"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddPrescription}>Add Prescription</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrescriptions}</div>
            <p className="text-xs text-muted-foreground">All time prescriptions</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePrescriptions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Prescriptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{urgentPrescriptions}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringPrescriptions}</div>
            <p className="text-xs text-muted-foreground">Expiring within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Management</CardTitle>
          <CardDescription>Search and manage customer prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Status</SelectItem>
                {prescriptionStatuses.filter(s => s !== "all").map(status => (
                  <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Urgency</SelectItem>
                {urgencyLevels.filter(u => u !== "all").map(urgency => (
                  <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} className="animate-fade-in">
                    <TableCell>
                      <div>
                        <div className="font-medium">{prescription.prescriptionNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {prescription.issueDate}
                        </div>
                        <div className="text-sm text-muted-foreground">{prescription.branch}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{prescription.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{prescription.customerName}</div>
                          <div className="text-sm text-muted-foreground">{prescription.customerAge}y, {prescription.customerGender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{prescription.doctorName}</div>
                        <div className="text-sm text-muted-foreground">{prescription.doctorLicense}</div>
                        <div className="text-sm text-muted-foreground">{prescription.clinic}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{prescription.medications.length} medications</div>
                        <div className="text-sm text-muted-foreground">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={index}>{med.name} {med.strength}</div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <div className="text-xs">+{prescription.medications.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                    <TableCell>{getUrgencyBadge(prescription.urgency)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{prescription.expiryDate}</div>
                        <div className={`text-xs ${
                          calculateDaysUntilExpiry(prescription.expiryDate) <= 7 ? 'text-red-600' :
                          calculateDaysUntilExpiry(prescription.expiryDate) <= 14 ? 'text-yellow-600' :
                          'text-muted-foreground'
                        }`}>
                          {calculateDaysUntilExpiry(prescription.expiryDate)} days left
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
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

      {/* Prescription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>Complete prescription information and medication list</DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Prescription Details</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="billing">Billing & Insurance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{selectedPrescription.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedPrescription.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedPrescription.customerAge} years, {selectedPrescription.customerGender}
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label>Patient ID</Label>
                        <div className="font-medium">{selectedPrescription.customerId}</div>
                      </div>
                      <div>
                        <Label>Diagnosis</Label>
                        <div className="font-medium">{selectedPrescription.diagnosis}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prescription Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Prescription Number</Label>
                        <div className="font-medium">{selectedPrescription.prescriptionNumber}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Issue Date</Label>
                          <div className="font-medium">{selectedPrescription.issueDate}</div>
                        </div>
                        <div>
                          <Label>Expiry Date</Label>
                          <div className="font-medium">{selectedPrescription.expiryDate}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
                          <div>{getStatusBadge(selectedPrescription.status)}</div>
                        </div>
                        <div>
                          <Label>Urgency</Label>
                          <div>{getUrgencyBadge(selectedPrescription.urgency)}</div>
                        </div>
                      </div>
                      <div>
                        <Label>Branch</Label>
                        <div className="font-medium">{selectedPrescription.branch}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prescriber Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Doctor Name</Label>
                        <div className="font-medium">{selectedPrescription.doctorName}</div>
                      </div>
                      <div>
                        <Label>License Number</Label>
                        <div className="font-medium">{selectedPrescription.doctorLicense}</div>
                      </div>
                      <div>
                        <Label>Clinic/Hospital</Label>
                        <div className="font-medium">{selectedPrescription.clinic}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedPrescription.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium">{selectedPrescription.notes}</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="medications" className="space-y-4">
                <div className="space-y-4">
                  {selectedPrescription.medications.map((medication, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <Pill className="mr-2 h-5 w-5" />
                            {medication.name} {medication.strength}
                          </CardTitle>
                          <Badge variant="outline">{medication.form}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Quantity</Label>
                            <div className="font-medium">{medication.quantity}</div>
                          </div>
                          <div>
                            <Label>Dosage</Label>
                            <div className="font-medium">{medication.dosage}</div>
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <div className="font-medium">{medication.duration}</div>
                          </div>
                          <div>
                            <Label>Form</Label>
                            <div className="font-medium">{medication.form}</div>
                          </div>
                        </div>
                        {medication.instructions && (
                          <div className="mt-3">
                            <Label>Special Instructions</Label>
                            <div className="font-medium text-blue-600">{medication.instructions}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Billing Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">Rs. {selectedPrescription.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance Covered:</span>
                        <span className="font-medium text-green-600">Rs. {selectedPrescription.insuranceCovered}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Patient Paid:</span>
                        <span>Rs. {selectedPrescription.patientPaid}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dispensing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Dispensed By</Label>
                        <div className="font-medium">{selectedPrescription.dispensedBy}</div>
                      </div>
                      <div>
                        <Label>Dispensed Date</Label>
                        <div className="font-medium">{selectedPrescription.dispensedDate}</div>
                      </div>
                      <div>
                        <Label>Dispensing Branch</Label>
                        <div className="font-medium">{selectedPrescription.branch}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}