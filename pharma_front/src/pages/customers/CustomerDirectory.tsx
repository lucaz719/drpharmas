import { useState, useEffect } from "react";
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
import { Users, Plus, Search, MapPin, Phone, Mail, Calendar, Star, CreditCard, Heart, Eye, Edit, Trash2, DollarSign, TrendingUp, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

interface Customer {
  id: string;
  name: string;
  organization_name: string;
  branch_name: string;
  totalOrders: number;
  totalSpent: number;
  totalPaid: number;
  totalCredit: number;
  lastOrderDate: string;
  status: string;
  firstOrderDate: string;
}

const loyaltyTiers = ["Bronze", "Silver", "Gold", "Platinum"];
const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const branches = ["Central Pharmacy", "Branch Pharmacy A", "Express Pharmacy"];

export default function CustomerDirectory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "O+",
    emergencyContact: "",
    allergies: "",
    chronicConditions: "",
    preferredBranch: "Central Pharmacy"
  });
  const { toast } = useToast();

  // Fetch customers (pharmacy organizations that have made orders)
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/customers/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const customerList = await response.json();
        
        // Transform the data to match the expected format
        const transformedCustomers = customerList.map((customer: any) => ({
          id: customer.id,
          name: customer.organization_name,
          organization_name: customer.organization_name,
          branch_name: customer.branch_name,
          totalOrders: customer.order_count,
          totalSpent: customer.total_orders, // This is actually total amount
          totalPaid: customer.total_paid,
          totalCredit: customer.total_credit,
          lastOrderDate: customer.last_order_date,
          firstOrderDate: customer.first_order_date,
          status: 'active'
        }));
        
        setCustomers(transformedCustomers);
      } else {
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.branch_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "all" || customer.branch_name === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const branches = [...new Set(customers.map(c => c.branch_name))].filter(Boolean);

  const getTierBadge = (tier: string) => {
    const styles = {
      Platinum: "bg-purple-100 text-purple-800 border-purple-200",
      Gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Silver: "bg-gray-100 text-gray-800 border-gray-200",
      Bronze: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return <Badge className={styles[tier] || styles.Bronze}>{tier}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return <Badge className={styles[status] || styles.inactive}>{status}</Badge>;
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Customer added successfully"
    });
    
    setShowAddDialog(false);
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "Male",
      bloodGroup: "O+",
      emergencyContact: "",
      allergies: "",
      chronicConditions: "",
      preferredBranch: "Central Pharmacy"
    });
  };

  const fetchCustomerDetails = async (customer: Customer) => {
    try {
      setLoadingDetails(true);
      setSelectedCustomer(customer);
      setShowDetailsDialog(true);
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/customers/${customer.id}/details/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerDetails(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load customer details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const totalCustomers = customers.length;
  const totalSalesAmount = customers.reduce((sum, c) => sum + (parseFloat(c.totalSpent) || 0), 0);
  const totalPaid = customers.reduce((sum, c) => sum + (parseFloat(c.totalPaid) || 0), 0);
  const totalCreditToReceive = customers.reduce((sum, c) => sum + (parseFloat(c.totalCredit) || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Directory</h1>
          <p className="text-muted-foreground">Pharmacy organizations that have placed orders with you</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="animate-fade-in">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter customer details to create a new profile</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="+977-9XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={newCustomer.emergencyContact}
                    onChange={(e) => setNewCustomer({...newCustomer, emergencyContact: e.target.value})}
                    placeholder="+977-9XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  placeholder="Enter complete address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newCustomer.dateOfBirth}
                    onChange={(e) => setNewCustomer({...newCustomer, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newCustomer.gender} onValueChange={(value) => setNewCustomer({...newCustomer, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {genders.map(gender => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood">Blood Group</Label>
                  <Select value={newCustomer.bloodGroup} onValueChange={(value) => setNewCustomer({...newCustomer, bloodGroup: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {bloodGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Preferred Branch</Label>
                <Select value={newCustomer.preferredBranch} onValueChange={(value) => setNewCustomer({...newCustomer, preferredBranch: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={newCustomer.allergies}
                    onChange={(e) => setNewCustomer({...newCustomer, allergies: e.target.value})}
                    placeholder="List any known allergies (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditions">Chronic Conditions</Label>
                  <Textarea
                    id="conditions"
                    value={newCustomer.chronicConditions}
                    onChange={(e) => setNewCustomer({...newCustomer, chronicConditions: e.target.value})}
                    placeholder="List chronic conditions (comma separated)"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalSalesAmount.toFixed(2).replace(/\.00$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
            <p className="text-xs text-muted-foreground">Total sales revenue</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. {totalPaid.toFixed(2).replace(/\.00$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
            <p className="text-xs text-muted-foreground">Amount received</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit to Receive</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Rs. {totalCreditToReceive.toFixed(2).replace(/\.00$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Pharmacy organizations that have placed orders with you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Credit Amount</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="animate-fade-in">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{customer.organization_name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <NavLink 
                              to={`/customers/detail/${customer.id}`} 
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {customer.organization_name}
                            </NavLink>
                            <div className="text-sm text-muted-foreground">Customer since: {new Date(customer.firstOrderDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.branch_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.totalOrders}</div>
                        <div className="text-sm text-muted-foreground">orders placed</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">Rs. {customer.totalSpent.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">Rs. {customer.totalPaid.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-orange-600">Rs. {customer.totalCredit.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => fetchCustomerDetails(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => {
        setShowDetailsDialog(open);
        if (!open) {
          setCustomerDetails(null);
          setSelectedCustomer(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Complete customer information and order history</DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <div>Loading customer details...</div>
              </div>
            </div>
          ) : customerDetails && selectedCustomer ? (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="items">Recent Items</TabsTrigger>
                <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl">
                      {customerDetails.customer.organization_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Organization Name</Label>
                        <div className="text-lg font-semibold">{customerDetails.customer.organization_name}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                        <div className="text-lg font-semibold">{customerDetails.customer.branch_name}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Customer Since</Label>
                        <div className="text-lg font-semibold">{new Date(customerDetails.customer.customer_since).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(customerDetails.customer.status)}
                          {customerDetails.summary.status === 'released' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Released</Badge>
                          ) : customerDetails.summary.status === 'pending' ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerDetails.summary.total_orders}</div>
                      <div className="text-sm text-muted-foreground">Orders placed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Rs. {customerDetails.summary.total_amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total value</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Paid Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Rs. {customerDetails.summary.paid_amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Amount received</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Credit Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">Rs. {customerDetails.summary.credit_amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Released</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerDetails.order_history.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                             order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                             order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                             'bg-gray-100 text-gray-800'}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.items_count}</TableCell>
                          <TableCell>Rs. {order.total_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-600">Rs. {order.paid_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-orange-600">Rs. {order.remaining_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {order.is_released ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Order Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerDetails.recent_items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rs. {item.unit_price.toLocaleString()}</TableCell>
                          <TableCell>{new Date(item.order_date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.order_number}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="loyalty" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Loyalty Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerDetails.loyalty_metrics.tier}</div>
                      {getTierBadge(customerDetails.loyalty_metrics.tier)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Loyalty Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerDetails.loyalty_metrics.points.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Available points</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avg Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Rs. {Math.round(customerDetails.loyalty_metrics.avg_order_value).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Per order</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Order Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerDetails.loyalty_metrics.order_frequency}</div>
                      <div className="text-sm text-muted-foreground">Customer type</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No customer details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}