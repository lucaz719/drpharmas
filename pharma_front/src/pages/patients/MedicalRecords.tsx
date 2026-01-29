import { useState } from "react";
import { Search, Plus, FileText, Calendar, User, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'consultation' | 'prescription' | 'test' | 'diagnosis';
  title: string;
  description: string;
  doctor: string;
  medications?: string[];
  status: 'active' | 'completed' | 'cancelled';
}

const mockRecords: MedicalRecord[] = [
  {
    id: "MR001",
    patientId: "PAT001",
    patientName: "Ram Bahadur Thapa",
    date: "2024-01-15",
    type: "prescription",
    title: "Hypertension Management",
    description: "Regular medication for blood pressure control",
    doctor: "Dr. Rajesh Sharma",
    medications: ["Amlodipine 5mg", "Losartan 50mg"],
    status: "active"
  },
  {
    id: "MR002",
    patientId: "PAT002",
    patientName: "Sita Devi Sharma",
    date: "2024-01-10",
    type: "consultation",
    title: "Diabetes Follow-up",
    description: "Regular check-up for diabetes management",
    doctor: "Dr. Priya Patel",
    medications: ["Metformin 500mg", "Glimepiride 2mg"],
    status: "completed"
  }
];

export default function MedicalRecords() {
  const [records] = useState<MedicalRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && record.type === activeTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'consultation': return <User className="w-4 h-4" />;
      case 'test': return <FileText className="w-4 h-4" />;
      case 'diagnosis': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-green-100 text-green-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      case 'diagnosis': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Manage patient medical records and history</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Patient Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
              <TabsTrigger value="consultation">Consultations</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${getTypeColor(record.type)}`}>
                              {getTypeIcon(record.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{record.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {record.patientName} ({record.patientId})
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{record.description}</p>
                          
                          {record.medications && record.medications.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Medications:</p>
                              <div className="flex flex-wrap gap-1">
                                {record.medications.map((med, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {med}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {record.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {record.doctor}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={record.status === "active" ? "default" : record.status === "completed" ? "secondary" : "destructive"}>
                            {record.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No medical records found matching your search.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}