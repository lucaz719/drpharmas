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
  Search, Plus, Edit, Eye, Trash2, Star, 
  Phone, Mail, MapPin, Building, Globe,
  Users, Package, TrendingUp, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockSuppliers = [
  {
    id: "SUP-001",
    name: "MediCorp Nepal Pvt. Ltd.",
    contactPerson: "Dr. Ram Sharma",
    email: "ram.sharma@medicorp.com.np",
    phone: "+977-1-4567890",
    mobile: "+977-9841234567",
    address: "Baneshwor, Kathmandu",
    city: "Kathmandu",
    country: "Nepal",
    postalCode: "44600",
    website: "www.medicorp.com.np",
    licenseNumber: "DDA-2023-001",
    taxNumber: "302345678",
    category: "Pharmaceutical",
    supplierType: "manufacturer",
    status: "active",
    rating: 4.8,
    joinDate: "2020-01-15",
    paymentTerms: "30 days",
    creditLimit: 500000,
    totalOrders: 145,
    totalValue: 2500000,
    lastOrderDate: "2024-01-15",
    notes: "Primary supplier for antibiotics and pain relief medications"
  },
  {
    id: "SUP-002",
    name: "PharmaCo Distribution Ltd.",
    contactPerson: "Sita Gurung",
    email: "sita@pharmaco.com.np",
    phone: "+977-1-4567891",
    mobile: "+977-9851234567",
    address: "Teku, Kathmandu",
    city: "Kathmandu",
    country: "Nepal",
    postalCode: "44601",
    website: "www.pharmaco.com.np",
    licenseNumber: "DDA-2023-002",
    taxNumber: "302345679",
    category: "Pharmaceutical",
    supplierType: "distributor",
    status: "active",
    rating: 4.6,
    joinDate: "2020-03-22",
    paymentTerms: "45 days",
    creditLimit: 750000,
    totalOrders: 132,
    totalValue: 2200000,
    lastOrderDate: "2024-01-12",
    notes: "Reliable distributor for insulin and diabetes care products"
  },
  {
    id: "SUP-003",
    name: "HealthPlus Medical Supply",
    contactPerson: "Hari Thapa",
    email: "hari@healthplus.com.np",
    phone: "+977-1-4567892",
    mobile: "+977-9861234567",
    address: "Patan Dhoka, Lalitpur",
    city: "Lalitpur",
    country: "Nepal",
    postalCode: "44700",
    website: "www.healthplus.com.np",
    licenseNumber: "DDA-2023-003",
    taxNumber: "302345680",
    category: "Medical Devices",
    supplierType: "wholesaler",
    status: "active",
    rating: 4.4,
    joinDate: "2021-06-10",
    paymentTerms: "15 days",
    creditLimit: 300000,
    totalOrders: 98,
    totalValue: 1800000,
    lastOrderDate: "2024-01-10",
    notes: "Specializes in medical devices and diagnostic equipment"
  },
  {
    id: "SUP-004",
    name: "NutriMed Wellness Pvt. Ltd.",
    contactPerson: "Maya Shrestha",
    email: "maya@nutrimed.com.np",
    phone: "+977-1-4567893",
    mobile: "+977-9871234567",
    address: "Kupondole, Lalitpur",
    city: "Lalitpur",
    country: "Nepal",
    postalCode: "44701",
    website: "www.nutrimed.com.np",
    licenseNumber: "DDA-2023-004",
    taxNumber: "302345681",
    category: "Nutritional Supplements",
    supplierType: "manufacturer",
    status: "active",
    rating: 4.2,
    joinDate: "2021-09-15",
    paymentTerms: "60 days",
    creditLimit: 400000,
    totalOrders: 76,
    totalValue: 1200000,
    lastOrderDate: "2024-01-08",
    notes: "Premium vitamins and nutritional supplements supplier"
  },
  {
    id: "SUP-005",
    name: "BioPharma Industries",
    contactPerson: "Kiran Adhikari",
    email: "kiran@biopharma.com.np",
    phone: "+977-1-4567894",
    mobile: "+977-9881234567",
    address: "Bhaktapur Industrial Area",
    city: "Bhaktapur",
    country: "Nepal",
    postalCode: "44800",
    website: "www.biopharma.com.np",
    licenseNumber: "DDA-2023-005",
    taxNumber: "302345682",
    category: "Pharmaceutical",
    supplierType: "manufacturer",
    status: "pending",
    rating: 4.0,
    joinDate: "2023-11-20",
    paymentTerms: "30 days",
    creditLimit: 200000,
    totalOrders: 12,
    totalValue: 350000,
    lastOrderDate: "2024-01-05",
    notes: "New supplier, currently under evaluation"
  }
];

export default function SuppliersDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { toast } = useToast();

  const categories = [...new Set(mockSuppliers.map(supplier => supplier.category))];

  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline",
      suspended: "destructive"
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getSupplierTypeBadge = (type: string) => {
    const variants = {
      manufacturer: "default",
      distributor: "secondary",
      wholesaler: "outline"
    };
    return <Badge variant={variants[type] as any}>{type}</Badge>;
  };

  const handleCreateSupplier = () => {
    toast({
      title: "Supplier Created",
      description: "New supplier has been added successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditSupplier = () => {
    toast({
      title: "Supplier Updated",
      description: "Supplier information has been updated successfully.",
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    toast({
      title: "Supplier Deleted",
      description: `Supplier ${supplierId} has been removed.`,
    });
  };

  const totalSuppliers = mockSuppliers.length;
  const activeSuppliers = mockSuppliers.filter(s => s.status === "active").length;
  const totalValue = mockSuppliers.reduce((sum, s) => sum + s.totalValue, 0);
  const avgRating = mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suppliers Directory</h1>
          <p className="text-muted-foreground">Comprehensive supplier database and management</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter comprehensive supplier information for registration
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Basic Information</h3>
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input placeholder="Full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input type="email" placeholder="contact@company.com" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input placeholder="+977-1-xxxxxxx" />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input placeholder="+977-98xxxxxxxx" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input placeholder="www.company.com" />
                </div>
              </div>

              {/* Address & Legal */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Address & Legal Information</h3>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input placeholder="City" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input placeholder="Postal code" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input placeholder="DDA-YYYY-XXX" />
                </div>
                <div>
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input placeholder="VAT/PAN Number" />
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Business Details</h3>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                      <SelectItem value="medical_devices">Medical Devices</SelectItem>
                      <SelectItem value="nutritional_supplements">Nutritional Supplements</SelectItem>
                      <SelectItem value="laboratory_supplies">Laboratory Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplierType">Supplier Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15_days">15 Days</SelectItem>
                      <SelectItem value="30_days">30 Days</SelectItem>
                      <SelectItem value="45_days">45 Days</SelectItem>
                      <SelectItem value="60_days">60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit (NPR)</Label>
                  <Input type="number" placeholder="Credit limit amount" />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Additional Information</h3>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea placeholder="Additional notes about the supplier..." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSupplier}>Create Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalSuppliers}</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeSuppliers}</p>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">NPR {totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
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
                placeholder="Search suppliers..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              Export Suppliers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers Directory ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                        <p className="text-xs text-muted-foreground">{supplier.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-1">
                          <Phone size={12} />
                          {supplier.phone}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                          <Mail size={12} />
                          {supplier.email}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin size={12} />
                          {supplier.city}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{supplier.category}</p>
                        {getSupplierTypeBadge(supplier.supplierType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          <span className="font-medium">{supplier.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          NPR {supplier.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.totalOrders}</p>
                        <p className="text-sm text-muted-foreground">
                          Last: {supplier.lastOrderDate}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Supplier Profile - {supplier.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-medium mb-2">Basic Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Contact Person:</strong> {supplier.contactPerson}</p>
                                    <p><strong>Email:</strong> {supplier.email}</p>
                                    <p><strong>Phone:</strong> {supplier.phone}</p>
                                    <p><strong>Mobile:</strong> {supplier.mobile}</p>
                                    <p><strong>Website:</strong> {supplier.website}</p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-medium mb-2">Address</h3>
                                  <div className="space-y-2 text-sm">
                                    <p>{supplier.address}</p>
                                    <p>{supplier.city}, {supplier.postalCode}</p>
                                    <p>{supplier.country}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-medium mb-2">Business Details</h3>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>License:</strong> {supplier.licenseNumber}</p>
                                    <p><strong>Tax Number:</strong> {supplier.taxNumber}</p>
                                    <p><strong>Category:</strong> {supplier.category}</p>
                                    <p><strong>Type:</strong> {supplier.supplierType}</p>
                                    <p><strong>Payment Terms:</strong> {supplier.paymentTerms}</p>
                                    <p><strong>Credit Limit:</strong> NPR {supplier.creditLimit.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-medium mb-2">Performance</h3>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Rating:</strong> {supplier.rating}/5</p>
                                    <p><strong>Total Orders:</strong> {supplier.totalOrders}</p>
                                    <p><strong>Total Value:</strong> NPR {supplier.totalValue.toLocaleString()}</p>
                                    <p><strong>Join Date:</strong> {supplier.joinDate}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {supplier.notes && (
                              <div>
                                <h3 className="font-medium mb-2">Notes</h3>
                                <p className="text-sm bg-muted p-3 rounded">{supplier.notes}</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit size={12} />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 size={12} />
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
    </div>
  );
}