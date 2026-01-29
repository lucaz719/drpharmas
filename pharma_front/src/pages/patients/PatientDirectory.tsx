import { useState, useEffect } from "react";
import { Search, Save, Edit, Eye, Phone, Mail, Calendar, MapPin, User, Printer } from "lucide-react";

// Add print styles
const printStyles = `
  @media print {
    body * { visibility: hidden; }
    .print\\:block, .print\\:block * { visibility: visible; }
    .print\\:hidden { display: none !important; }
    .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
    @page { margin: 0.5in; size: A4; }
  }
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { patientsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  patient_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  patient_type?: string;
  patientType?: string;
  lastVisit?: string;
  totalVisits?: number;
  status?: 'active' | 'inactive';
  created_at?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string;
  chronic_conditions?: string;
  // Billing information
  last_visit_date?: string;
  total_visits?: number;
  total_billing?: number;
  total_credit?: number;
  has_credit?: boolean;
  latest_bill_id?: string;
  latest_bill_amount?: number;
}

const mockPatients: Patient[] = [
  {
    id: "PAT001",
    name: "Ram Bahadur Thapa",
    age: 45,
    gender: "Male",
    phone: "9801234567",
    email: "ram.thapa@email.com",
    address: "Kathmandu, Nepal",
    patientType: "Outpatient",
    lastVisit: "2024-01-15",
    totalVisits: 15,
    status: "active"
  },
  {
    id: "PAT002", 
    name: "Sita Devi Sharma",
    age: 32,
    gender: "Female",
    phone: "9807654321",
    email: "sita.sharma@email.com",
    address: "Lalitpur, Nepal",
    patientType: "Outpatient",
    lastVisit: "2024-01-10",
    totalVisits: 8,
    status: "active"
  },
  {
    id: "PAT003",
    name: "Krishna Prasad Oli",
    age: 28,
    gender: "Male", 
    phone: "9812345678",
    email: "krishna.oli@email.com",
    address: "Bhaktapur, Nepal",
    patientType: "Inpatient",
    lastVisit: "2024-01-12",
    totalVisits: 3,
    status: "active"
  }
];

export default function PatientDirectory() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [creditFilter, setCreditFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [visitDateFrom, setVisitDateFrom] = useState("");
  const [visitDateTo, setVisitDateTo] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const { toast } = useToast();
  
  // Get current user's organization and branch
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userOrgId = currentUser?.organization_id;
  const userBranchId = currentUser?.branch_id;
  const branchName = currentUser?.branch_name || 'BR';
  
  // Auto-generated patient numbers
  const [nextPatientNumber, setNextPatientNumber] = useState({
    org: "ORG001",
    branch: `${branchName.substring(0, 2).toUpperCase()}-001`
  });
  
  // Form state
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    patient_type: "outpatient",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_group: "",
    allergies: "",
    chronic_conditions: ""
  });

  // Load patients and next patient numbers on component mount
  useEffect(() => {
    loadPatients(1);
    loadNextPatientNumbers();
  }, []);
  
  // Handle table search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPatients(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tableSearchTerm]);

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...(tableSearchTerm && { search: tableSearchTerm })
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}/patients/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / pageSize));
        setCurrentPage(page);
      } else {
        throw new Error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNextPatientNumbers = async () => {
    try {
      // Generate next patient number based on existing patients count
      const nextOrgNumber = `ORG${String(patients.length + 1).padStart(3, '0')}`;
      const nextBranchNumber = `${branchName.substring(0, 2).toUpperCase()}-${String(patients.length + 1).padStart(3, '0')}`;
      
      setNextPatientNumber({
        org: nextOrgNumber,
        branch: nextBranchNumber
      });
    } catch (error) {
      console.error('Error generating patient numbers:', error);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      try {
        // Search in existing patients first for better performance
        const localResults = patients.filter(patient => {
          const searchLower = value.toLowerCase();
          const patientId = patient.patient_id?.toLowerCase() || '';
          const fullName = patient.full_name?.toLowerCase() || '';
          const firstName = patient.first_name?.toLowerCase() || '';
          const lastName = patient.last_name?.toLowerCase() || '';
          const phone = patient.phone?.toLowerCase() || '';
          
          return patientId.includes(searchLower) || 
                 fullName.includes(searchLower) ||
                 firstName.includes(searchLower) ||
                 lastName.includes(searchLower) ||
                 phone.includes(searchLower) ||
                 // Handle partial ID search (e.g., "P001" matches "ORG005-BR03-P001")
                 patientId.split('-').some(part => part.includes(searchLower));
        });
        
        if (localResults.length > 0) {
          setSearchResults(localResults);
          setShowSearchResults(true);
        } else {
          // Fallback to API search if no local results
          const response = await patientsAPI.searchPatients(value);
          if (response.success) {
            setSearchResults((response.data || []) as Patient[]);
            setShowSearchResults(true);
          }
        }
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handlePatientSelect = (patient: any) => {
    const birthDate = new Date(patient.date_of_birth);
    setFormData({
      id: patient.id,
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || '',
      patient_type: patient.patient_type || 'outpatient',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      blood_group: patient.blood_group || '',
      allergies: patient.allergies || '',
      chronic_conditions: patient.chronic_conditions || ''
    });
    setIsEditing(true);
    setShowSearchResults(false);
    setSearchTerm("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields: First Name and Last Name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const patientData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        organization_id: userOrgId,
        branch_id: userBranchId,
        phone: formData.phone || "9800000000",
        city: formData.city || "N/A",
        address: formData.address || "N/A",
        email: formData.email || "",
        allergies: formData.allergies || "",
        chronic_conditions: formData.chronic_conditions || ""
      };
      
      // Add patient_id for new patients, keep existing for updates
      if (!isEditing) {
        (patientData as any).patient_id = nextPatientNumber.branch;
      } else {
        // Find the current patient to get their existing patient_id
        const currentPatient = patients.find(p => p.id === formData.id);
        if (currentPatient?.patient_id) {
          (patientData as any).patient_id = currentPatient.patient_id;
        }
      }

      let response;
      if (isEditing && formData.id) {
        response = await patientsAPI.updatePatient(formData.id, patientData);
      } else {
        response = await patientsAPI.createPatient(patientData);
      }

      if (response.success) {
        // Visit history will be handled by backend or separate system
        
        toast({
          title: "Success",
          description: `Patient ${isEditing ? 'updated' : 'created'} successfully`
        });
        loadPatients(currentPage);
        loadNextPatientNumbers();
        handleNewPatient();
      } else {
        // Handle API validation errors
        let errorMessage = 'Failed to save patient';
        if (response.error) {
          if (typeof response.error === 'object') {
            // Format validation errors from API
            const errors = Object.entries(response.error)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            errorMessage = errors;
          } else {
            errorMessage = response.error;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      let displayMessage = 'Failed to save patient';
      
      if (error.message) {
        displayMessage = error.message;
      } else if (error.response?.data) {
        // Handle axios error response
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          displayMessage = errors;
        } else {
          displayMessage = errorData;
        }
      }
      
      toast({
        title: "Error",
        description: displayMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatient = () => {
    setFormData({
      id: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      patient_type: "outpatient",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      blood_group: "",
      allergies: "",
      chronic_conditions: ""
    });
    setIsEditing(false);
  };

  // Remove client-side filtering since we're using server-side pagination
  const filteredPatients = patients;

  return (
    <div className="min-h-screen flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Patient Directory</h1>
          <p className="text-sm text-muted-foreground">Manage patient information</p>
        </div>
        <Button onClick={handleNewPatient} size="sm">
          New Patient
        </Button>
      </div>

      {/* Patient Form */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar and Patient Numbers */}
          <div className="grid grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={14} />
              <Input
                placeholder="Search by Patient ID or Name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="font-medium text-xs">{patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim()}</div>
                      <div className="text-xs text-gray-500">{patient.patient_id} • {patient.phone || 'No phone'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs bg-gray-50 p-2 rounded border flex gap-4">
                <div>
                  <span className="text-gray-500">Org:</span> <span className="font-mono font-medium">{nextPatientNumber.org}</span>
                </div>
                <div>
                  <span className="text-gray-500">Branch:</span> <span className="font-mono font-medium">{nextPatientNumber.branch}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Form */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <div className="space-y-1">
              <Label htmlFor="first_name" className="text-xs">First Name *</Label>
              <Input
                id="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_name" className="text-xs">Last Name *</Label>
              <Input
                id="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date_of_birth" className="text-xs">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-xs">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2 */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="patient_type" className="text-xs">Patient Type</Label>
              <Select value={formData.patient_type} onValueChange={(value) => handleInputChange('patient_type', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outpatient">Outpatient</SelectItem>
                  <SelectItem value="inpatient">Inpatient</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="blood_group" className="text-xs">Blood Group</Label>
              <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3 */}
            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Input
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city" className="text-xs">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emergency_contact_name" className="text-xs">Emergency Contact</Label>
              <Input
                id="emergency_contact_name"
                placeholder="Contact name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emergency_contact_phone" className="text-xs">Emergency Phone</Label>
              <Input
                id="emergency_contact_phone"
                placeholder="Emergency phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Row 4 */}
            <div className="space-y-1 col-span-2">
              <Label htmlFor="allergies" className="text-xs">Allergies</Label>
              <Input
                id="allergies"
                placeholder="Known allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="chronic_conditions" className="text-xs">Medical History</Label>
              <Input
                id="chronic_conditions"
                placeholder="Chronic conditions"
                value={formData.chronic_conditions}
                onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="sm" className="h-8" disabled={loading}>
              <Save className="w-3 h-3 mr-1" />
              {loading ? 'Saving...' : (isEditing ? 'Update Patient' : 'Save Patient')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-base">All Patients</CardTitle>
          </div>
          
          {/* Enhanced Search and Filter Controls */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            <div className="relative col-span-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <Input
                placeholder="Search patients, bills, dates..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
            
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="name">Name Only</SelectItem>
                <SelectItem value="phone">Phone Only</SelectItem>
                <SelectItem value="bill_id">Bill ID</SelectItem>
                <SelectItem value="date">Visit Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={creditFilter} onValueChange={setCreditFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Credit Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="true">Has Credit</SelectItem>
                <SelectItem value="false">No Credit</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="patient_id">Sort by ID</SelectItem>
                <SelectItem value="phone">Sort by Phone</SelectItem>
                <SelectItem value="visit_date">Sort by Visit Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                setTableSearchTerm("");
                setSearchType("all");
                setSortBy("name");
                setSortOrder("asc");
                setVisitDateFrom("");
                setVisitDateTo("");
                setCreditFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
          
          {/* Date Range Filter */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Visit Date From</Label>
              <Input
                type="date"
                value={visitDateFrom}
                onChange={(e) => setVisitDateFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Visit Date To</Label>
              <Input
                type="date"
                value={visitDateTo}
                onChange={(e) => setVisitDateTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2">
              {/* Empty space */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-sm text-gray-500">Loading patients...</div>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">ID</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Age/Gender</th>
                    <th className="text-left p-2 font-medium">Contact</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Last Visit</th>
                    <th className="text-left p-2 font-medium">Visits</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id || Math.random()} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium text-blue-600">{patient.patient_id || '-'}</td>
                        <td className="p-2">{patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || '-'}</td>
                        <td className="p-2">{patient.age || '-'}Y / {patient.gender || '-'}</td>
                        <td className="p-2">
                          <div className="text-xs">{patient.phone || '-'}</div>
                          {patient.email && <div className="text-xs text-gray-500">{patient.email}</div>}
                        </td>
                        <td className="p-2">
                          <Badge variant={(patient.patient_type || patient.patientType) === "inpatient" ? "default" : "secondary"} className="text-xs">
                            {patient.patient_type || patient.patientType || 'outpatient'}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2">
                          <Badge variant={patient.status === "active" ? "default" : "secondary"} className="text-xs">
                            {patient.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => window.location.href = `/patients/detail/${patient.id}`}
                          >
                            <Eye size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} patients
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => loadPatients(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => loadPatients(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Patient View Dialog */}
      {showViewDialog && viewPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Patient Details</h2>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    handlePatientSelect(viewPatient);
                    setShowViewDialog(false);
                  }} className="print:hidden">
                    Edit Patient
                  </Button>
                  <Button size="sm" onClick={() => {
                    // Generate registration receipt when printing
                    const receiptData = {
                      patientId: viewPatient.patient_id,
                      name: viewPatient.full_name || `${viewPatient.first_name || ''} ${viewPatient.last_name || ''}`,
                      registrationDate: new Date().toLocaleDateString(),
                      branchNumber: nextPatientNumber.branch,
                      orgNumber: nextPatientNumber.org
                    };
                    console.log('Registration Receipt:', receiptData);
                    window.print();
                  }} className="print:hidden">
                    Print Prescription
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowViewDialog(false)} className="print:hidden">
                    Close
                  </Button>
                </div>
              </div>
              
              {/* Printable Content */}
              <div className="print:block">
                {/* Header - Same as POS Receipt */}
                <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                  <h1 className="text-2xl font-bold">
                    {currentUser?.organization?.name || currentUser?.organization_name || 'Medical Center'}
                    {currentUser?.branch?.name && currentUser?.branch?.name !== (currentUser?.organization?.name || currentUser?.organization_name) && (
                      <span> ({currentUser?.branch?.name})</span>
                    )}
                  </h1>
                  {(currentUser?.organization?.address || currentUser?.address) && (
                    <p className="text-sm">{currentUser?.organization?.address || currentUser?.address}</p>
                  )}
                  {(currentUser?.organization?.phone || currentUser?.phone) && (
                    <p className="text-sm">Phone: {currentUser?.organization?.phone || currentUser?.phone}</p>
                  )}
                  {(currentUser?.organization?.email || currentUser?.email) && (
                    <p className="text-sm">Email: {currentUser?.organization?.email || currentUser?.email}</p>
                  )}
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-1">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Patient ID:</strong> {viewPatient.patient_id}</div>
                      <div><strong>Name:</strong> {viewPatient.full_name || `${viewPatient.first_name || ''} ${viewPatient.last_name || ''}`}</div>
                      <div><strong>Age/Gender:</strong> {viewPatient.age}Y / {viewPatient.gender}</div>
                      <div><strong>Phone:</strong> {viewPatient.phone || 'N/A'}</div>
                      <div><strong>Email:</strong> {viewPatient.email || 'N/A'}</div>
                      <div><strong>Blood Group:</strong> {viewPatient.blood_group || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-1">Contact & Address</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {viewPatient.address || 'N/A'}</div>
                      <div><strong>City:</strong> {viewPatient.city || 'N/A'}</div>
                      <div><strong>Emergency Contact:</strong> {viewPatient.emergency_contact_name || 'N/A'}</div>
                      <div><strong>Emergency Phone:</strong> {viewPatient.emergency_contact_phone || 'N/A'}</div>
                      <div><strong>Patient Type:</strong> {viewPatient.patient_type}</div>
                      <div><strong>Registration Date:</strong> {viewPatient.created_at ? new Date(viewPatient.created_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-1">Medical Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Allergies:</strong> {viewPatient.allergies || 'None reported'}</div>
                    <div><strong>Medical History:</strong> {viewPatient.chronic_conditions || 'None reported'}</div>
                  </div>
                </div>

                {/* Prescription Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-1">Prescription</h3>
                  <div className="min-h-[200px] border border-gray-300 p-4">
                    <p className="text-sm text-gray-500 italic">Prescription details to be filled by doctor...</p>
                    <div className="mt-4 space-y-2">
                      <div className="border-b border-dotted border-gray-300 h-6"></div>
                      <div className="border-b border-dotted border-gray-300 h-6"></div>
                      <div className="border-b border-dotted border-gray-300 h-6"></div>
                      <div className="border-b border-dotted border-gray-300 h-6"></div>
                      <div className="border-b border-dotted border-gray-300 h-6"></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-4 mt-6">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-8">Doctor's Signature</p>
                      <div className="border-t border-gray-400 w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}