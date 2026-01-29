import { useState } from "react";
import { Search, Plus, Pill, Calendar, User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }[];
  status: 'pending' | 'partial' | 'completed' | 'expired';
  notes?: string;
  validUntil: string;
}

const mockPrescriptions: Prescription[] = [
  {
    id: "RX001",
    patientId: "PAT001",
    patientName: "Ram Bahadur Thapa",
    doctorName: "Dr. Rajesh Sharma",
    prescriptionDate: "2024-01-15",
    validUntil: "2024-02-15",
    status: "pending",
    medications: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "30 days",
        quantity: 30
      },
      {
        name: "Losartan",
        dosage: "50mg", 
        frequency: "Once daily",
        duration: "30 days",
        quantity: 30
      }
    ],
    notes: "Take with food. Monitor blood pressure regularly."
  },
  {
    id: "RX002",
    patientId: "PAT002",
    patientName: "Sita Devi Sharma",
    doctorName: "Dr. Priya Patel",
    prescriptionDate: "2024-01-10",
    validUntil: "2024-02-10",
    status: "completed",
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "30 days",
        quantity: 60
      }
    ],
    notes: "Take after meals. Check blood sugar levels."
  }
];

export default function PatientPrescriptions() {
  const [prescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && prescription.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Patient Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medication orders</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Prescriptions</CardTitle>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Prescription {prescription.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patientName} ({prescription.patientId})
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          Dr. {prescription.doctorName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {prescription.prescriptionDate}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3" />
                          Valid until: {prescription.validUntil}
                          {isExpiringSoon(prescription.validUntil) && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Medications:</h4>
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{med.name} {med.dosage}</span>
                                <p className="text-sm text-muted-foreground">
                                  {med.frequency} for {med.duration} (Qty: {med.quantity})
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {prescription.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-1">Notes:</h4>
                          <p className="text-sm text-muted-foreground bg-yellow-50 p-2 rounded">
                            {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <FileText className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {prescription.status === 'pending' && (
                          <Button size="sm">
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPrescriptions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No prescriptions found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}