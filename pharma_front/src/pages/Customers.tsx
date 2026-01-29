import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, User, Phone, Mail, Calendar, 
  DollarSign, ShoppingBag, Edit, Eye, Heart
} from "lucide-react";

const customersData = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "1985-06-15",
    memberSince: "2023-01-15",
    totalPurchases: 15,
    totalSpent: 485.75,
    lastVisit: "2024-01-12",
    status: "Active",
    loyaltyPoints: 145,
    prescriptions: [
      { medication: "Metformin 500mg", prescriber: "Dr. Smith", refills: 2, expiry: "2024-06-15" },
      { medication: "Lisinopril 10mg", prescriber: "Dr. Johnson", refills: 5, expiry: "2024-03-20" }
    ],
    allergies: ["Penicillin", "Sulfa drugs"],
    insurance: "Blue Cross Blue Shield",
    preferredContact: "Email"
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane.smith@email.com", 
    phone: "(555) 234-5678",
    address: "456 Oak Ave, City, State 12345",
    dateOfBirth: "1978-09-22",
    memberSince: "2022-08-10",
    totalPurchases: 28,
    totalSpent: 892.40,
    lastVisit: "2024-01-13",
    status: "VIP",
    loyaltyPoints: 289,
    prescriptions: [
      { medication: "Amlodipine 5mg", prescriber: "Dr. Brown", refills: 3, expiry: "2024-05-10" },
      { medication: "Atorvastatin 20mg", prescriber: "Dr. Brown", refills: 4, expiry: "2024-07-15" }
    ],
    allergies: ["None known"],
    insurance: "Aetna",
    preferredContact: "Phone"
  },
  {
    id: "CUST-003",
    name: "Bob Wilson",
    email: "bob.wilson@email.com",
    phone: "(555) 345-6789", 
    address: "789 Pine St, City, State 12345",
    dateOfBirth: "1965-12-03",
    memberSince: "2023-05-22",
    totalPurchases: 8,
    totalSpent: 234.50,
    lastVisit: "2024-01-10",
    status: "Active",
    loyaltyPoints: 67,
    prescriptions: [
      { medication: "Omeprazole 20mg", prescriber: "Dr. Davis", refills: 1, expiry: "2024-04-30" }
    ],
    allergies: ["Aspirin"],
    insurance: "Medicare",
    preferredContact: "Phone"
  },
  {
    id: "CUST-004",
    name: "Alice Brown",
    email: "alice.brown@email.com",
    phone: "(555) 456-7890",
    address: "321 Elm Dr, City, State 12345", 
    dateOfBirth: "1992-03-18",
    memberSince: "2023-11-05",
    totalPurchases: 5,
    totalSpent: 156.20,
    lastVisit: "2024-01-11",
    status: "New",
    loyaltyPoints: 45,
    prescriptions: [
      { medication: "Birth Control Pills", prescriber: "Dr. Wilson", refills: 6, expiry: "2024-12-01" }
    ],
    allergies: ["None known"],
    insurance: "United Healthcare",
    preferredContact: "Email"
  }
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || customer.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const variants = {
      "Active": "default",
      "VIP": "secondary",
      "New": "outline",
      "Inactive": "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const calculateAge = (dateOfBirth) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">Manage customer profiles, prescriptions, and purchase history</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus size={16} className="mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">{customersData.length}</p>
              </div>
              <User className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold text-secondary">
                  {customersData.filter(c => c.status === "VIP").length}
                </p>
              </div>
              <Heart className="text-secondary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">
                  ${customersData.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Purchase</p>
                <p className="text-2xl font-bold text-warning">
                  ${(customersData.reduce((sum, c) => sum + c.totalSpent, 0) / customersData.length).toFixed(0)}
                </p>
              </div>
              <ShoppingBag className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-card-foreground">Customer Directory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="vip">VIP</option>
                    <option value="new">New</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id} 
                    className="p-4 border border-border rounded-lg hover:bg-panel cursor-pointer transition-colors"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground">{customer.name}</h4>
                          {getStatusBadge(customer.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            <span>Last visit: {customer.lastVisit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${customer.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{customer.totalPurchases} purchases</p>
                        <p className="text-sm text-secondary">{customer.loyaltyPoints} points</p>
                        <div className="flex space-x-1 mt-2">
                          <Button size="sm" variant="outline">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                {selectedCustomer ? "Customer Details" : "Select Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">{selectedCustomer.name}</h3>
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User size={14} className="mr-2 text-muted-foreground" />
                        <span className="text-foreground">Age: {calculateAge(selectedCustomer.dateOfBirth)}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-2 text-muted-foreground" />
                        <span className="text-foreground">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2 text-muted-foreground" />
                        <span className="text-foreground">{selectedCustomer.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Summary */}
                  <div className="p-3 bg-panel rounded space-y-2">
                    <h4 className="font-medium text-panel-foreground">Purchase Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-medium text-panel-foreground">${selectedCustomer.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Orders</p>
                        <p className="font-medium text-panel-foreground">{selectedCustomer.totalPurchases}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Loyalty Points</p>
                        <p className="font-medium text-secondary">{selectedCustomer.loyaltyPoints}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="font-medium text-panel-foreground">{selectedCustomer.memberSince}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Prescriptions */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Current Prescriptions</h4>
                    <div className="space-y-2">
                      {selectedCustomer.prescriptions.map((prescription, index) => (
                        <div key={index} className="p-2 border border-border rounded text-sm">
                          <p className="font-medium text-foreground">{prescription.medication}</p>
                          <p className="text-muted-foreground">Dr. {prescription.prescriber}</p>
                          <p className="text-muted-foreground">Refills: {prescription.refills} | Expires: {prescription.expiry}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Allergies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="p-3 bg-panel rounded">
                    <h4 className="font-medium text-panel-foreground mb-1">Insurance Information</h4>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.insurance}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <ShoppingBag size={14} className="mr-2" />
                      View Purchase History
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Heart size={14} className="mr-2" />
                      Add Prescription
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Select a customer to view their details and manage their profile.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}