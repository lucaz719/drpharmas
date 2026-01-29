import { useState } from "react";
import { Search, Plus, Eye, Edit, Check, X, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockPrescriptions = [
  {
    id: "RX001",
    patientName: "John Smith",
    patientId: "P1001",
    medication: "Lisinopril 10mg",
    dosage: "Once daily",
    quantity: 30,
    refills: 5,
    prescriber: "Dr. Johnson",
    dateIssued: "2024-01-15",
    dateExpires: "2025-01-15",
    status: "active",
    instructions: "Take with food",
    allergies: ["Penicillin"],
    insurance: "BlueCross BlueShield"
  },
  {
    id: "RX002", 
    patientName: "Sarah Davis",
    patientId: "P1002",
    medication: "Metformin 500mg",
    dosage: "Twice daily",
    quantity: 60,
    refills: 3,
    prescriber: "Dr. Wilson",
    dateIssued: "2024-01-10",
    dateExpires: "2025-01-10",
    status: "pending_review",
    instructions: "Take with meals",
    allergies: ["Sulfa"],
    insurance: "Aetna"
  },
  {
    id: "RX003",
    patientName: "Mike Johnson",
    patientId: "P1003", 
    medication: "Atorvastatin 20mg",
    dosage: "Once daily at bedtime",
    quantity: 30,
    refills: 6,
    prescriber: "Dr. Brown",
    dateIssued: "2024-01-12",
    dateExpires: "2025-01-12",
    status: "ready_for_pickup",
    instructions: "Avoid grapefruit",
    allergies: ["None known"],
    insurance: "Medicare"
  }
];

const pendingReviews = [
  {
    id: "PR001",
    patientName: "Emma Wilson",
    medication: "Warfarin 5mg",
    prescriber: "Dr. Adams",
    concern: "Drug interaction check needed",
    priority: "high",
    submittedAt: "2024-01-15 09:30"
  },
  {
    id: "PR002", 
    patientName: "Robert Chen",
    medication: "Oxycodone 10mg",
    prescriber: "Dr. Miller",
    concern: "Controlled substance verification",
    priority: "high",
    submittedAt: "2024-01-15 10:15"
  }
];

const consultationQueue = [
  {
    id: "C001",
    patientName: "Lisa Anderson",
    type: "Medication Review",
    appointmentTime: "14:30",
    medications: ["Metoprolol", "Hydrochlorothiazide"],
    notes: "Blood pressure management consultation"
  },
  {
    id: "C002",
    patientName: "David Park", 
    type: "Drug Interaction Check",
    appointmentTime: "15:00",
    medications: ["Simvastatin", "Clarithromycin"],
    notes: "Patient reporting muscle pain"
  }
];

export default function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "secondary",
      pending_review: "destructive", 
      ready_for_pickup: "default",
      completed: "outline"
    };
    
    const labels = {
      active: "Active",
      pending_review: "Pending Review",
      ready_for_pickup: "Ready for Pickup", 
      completed: "Completed"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge variant={priority === "high" ? "destructive" : "secondary"}>
        {priority === "high" ? "High Priority" : "Normal"}
      </Badge>
    );
  };

  const filteredPrescriptions = mockPrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
          <p className="text-muted-foreground">Clinical oversight and prescription processing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Require pharmacist review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Check className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="reviews">Pending Reviews</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{prescription.patientName}</CardTitle>
                      <CardDescription>ID: {prescription.id} • Patient: {prescription.patientId}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(prescription.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div><strong>Medication:</strong> {prescription.medication}</div>
                      <div><strong>Dosage:</strong> {prescription.dosage}</div>
                      <div><strong>Quantity:</strong> {prescription.quantity} ({prescription.refills} refills remaining)</div>
                      <div><strong>Prescriber:</strong> {prescription.prescriber}</div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Instructions:</strong> {prescription.instructions}</div>
                      <div><strong>Allergies:</strong> {prescription.allergies.join(", ")}</div>
                      <div><strong>Insurance:</strong> {prescription.insurance}</div>
                      <div><strong>Expires:</strong> {prescription.dateExpires}</div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {prescription.status === "pending_review" && (
                      <>
                        <Button size="sm" variant="default">
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4">
            {pendingReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{review.patientName}</CardTitle>
                      <CardDescription>{review.medication} • Dr. {review.prescriber}</CardDescription>
                    </div>
                    {getPriorityBadge(review.priority)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>Concern:</strong> {review.concern}</div>
                    <div><strong>Submitted:</strong> {review.submittedAt}</div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm">
                      <Check className="w-4 h-4 mr-2" />
                      Review & Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Flag for Investigation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <div className="grid gap-4">
            {consultationQueue.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{consultation.patientName}</CardTitle>
                      <CardDescription>{consultation.type} • {consultation.appointmentTime}</CardDescription>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>Medications:</strong> {consultation.medications.join(", ")}</div>
                    <div><strong>Notes:</strong> {consultation.notes}</div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm">
                      <Check className="w-4 h-4 mr-2" />
                      Start Consultation
                    </Button>
                    <Button size="sm" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}