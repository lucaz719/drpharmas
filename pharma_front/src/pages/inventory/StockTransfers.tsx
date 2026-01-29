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
  Search, Plus, Eye, Truck, Package, 
  ArrowRight, Clock, CheckCircle, AlertCircle,
  MapPin, Calendar, User, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockTransfers = [
  {
    id: "TR-001",
    product: "Paracetamol 500mg",
    fromLocation: "Main Pharmacy",
    toLocation: "Branch - Thamel",
    quantity: 100,
    transferDate: "2024-01-15",
    requestedBy: "Ram Sharma",
    status: "pending",
    priority: "high",
    reason: "Stock shortage at branch",
    estimatedArrival: "2024-01-16",
    notes: "Urgent transfer required"
  },
  {
    id: "TR-002", 
    product: "Insulin Pen",
    fromLocation: "Central Warehouse",
    toLocation: "Main Pharmacy",
    quantity: 25,
    transferDate: "2024-01-14",
    requestedBy: "Sita Gurung",
    status: "in_transit",
    priority: "medium",
    reason: "Routine restocking",
    estimatedArrival: "2024-01-15",
    notes: "Handle with care - refrigerated item"
  },
  {
    id: "TR-003",
    product: "Cetirizine 10mg",
    fromLocation: "Branch - Thamel",
    toLocation: "Branch - Patan",
    quantity: 50,
    transferDate: "2024-01-13",
    requestedBy: "Hari Thapa",
    status: "completed",
    priority: "low",
    reason: "Excess stock redistribution",
    estimatedArrival: "2024-01-14",
    notes: "Completed successfully"
  },
  {
    id: "TR-004",
    product: "Blood Pressure Monitor",
    fromLocation: "Main Pharmacy",
    toLocation: "Branch - Bhaktapur",
    quantity: 5,
    transferDate: "2024-01-12",
    requestedBy: "Maya Shrestha",
    status: "cancelled",
    priority: "medium",
    reason: "Customer demand",
    estimatedArrival: "2024-01-13",
    notes: "Cancelled due to supplier direct delivery"
  }
];

const locations = [
  { id: "main", name: "Main Pharmacy", type: "pharmacy" },
  { id: "warehouse", name: "Central Warehouse", type: "warehouse" },
  { id: "thamel", name: "Branch - Thamel", type: "branch" },
  { id: "patan", name: "Branch - Patan", type: "branch" },
  { id: "bhaktapur", name: "Branch - Bhaktapur", type: "branch" }
];

export default function StockTransfers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredTransfers = mockTransfers.filter(transfer => {
    const matchesSearch = transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      in_transit: { variant: "default", icon: Truck, label: "In Transit" },
      completed: { variant: "default", icon: CheckCircle, label: "Completed" },
      cancelled: { variant: "destructive", icon: AlertCircle, label: "Cancelled" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: "destructive", label: "High" },
      medium: { variant: "secondary", label: "Medium" },
      low: { variant: "outline", label: "Low" }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const handleCreateTransfer = () => {
    toast({
      title: "Transfer Request Created",
      description: "Stock transfer request has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleStatusUpdate = (transferId: string, newStatus: string) => {
    toast({
      title: "Transfer Status Updated",
      description: `Transfer ${transferId} status changed to ${newStatus}.`,
    });
  };

  const totalTransfers = mockTransfers.length;
  const pendingTransfers = mockTransfers.filter(t => t.status === "pending").length;
  const inTransitTransfers = mockTransfers.filter(t => t.status === "in_transit").length;
  const completedTransfers = mockTransfers.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">Manage inventory transfers between locations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Transfer Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
              <DialogDescription>
                Request transfer of inventory between locations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Input placeholder="Search product..." />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromLocation">From Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toLocation">To Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedDate">Estimated Arrival</Label>
                  <Input type="date" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Transfer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock_shortage">Stock Shortage</SelectItem>
                    <SelectItem value="excess_stock">Excess Stock Redistribution</SelectItem>
                    <SelectItem value="routine_restock">Routine Restocking</SelectItem>
                    <SelectItem value="customer_demand">Customer Demand</SelectItem>
                    <SelectItem value="expiry_management">Expiry Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea placeholder="Additional notes for this transfer..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTransfer}>Create Transfer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalTransfers}</p>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingTransfers}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{inTransitTransfers}</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedTransfers}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transfers by ID, product, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Transfers ({filteredTransfers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.product}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested by: {transfer.requestedBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{transfer.fromLocation}</span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                        <span className="text-sm">{transfer.toLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transfer.quantity}</TableCell>
                    <TableCell>{getPriorityBadge(transfer.priority)}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>{transfer.transferDate}</TableCell>
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
                              <DialogTitle>Transfer Details - {transfer.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Product</Label>
                                  <p className="font-medium">{transfer.product}</p>
                                </div>
                                <div>
                                  <Label>Quantity</Label>
                                  <p className="font-medium">{transfer.quantity}</p>
                                </div>
                                <div>
                                  <Label>From Location</Label>
                                  <p className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {transfer.fromLocation}
                                  </p>
                                </div>
                                <div>
                                  <Label>To Location</Label>
                                  <p className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {transfer.toLocation}
                                  </p>
                                </div>
                                <div>
                                  <Label>Requested By</Label>
                                  <p className="flex items-center gap-1">
                                    <User size={14} />
                                    {transfer.requestedBy}
                                  </p>
                                </div>
                                <div>
                                  <Label>Transfer Date</Label>
                                  <p className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {transfer.transferDate}
                                  </p>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <div className="mt-1">{getPriorityBadge(transfer.priority)}</div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(transfer.status)}</div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Reason for Transfer</Label>
                                <p>{transfer.reason}</p>
                              </div>
                              
                              <div>
                                <Label>Estimated Arrival</Label>
                                <p>{transfer.estimatedArrival}</p>
                              </div>
                              
                              <div>
                                <Label>Notes</Label>
                                <p className="text-sm">{transfer.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {transfer.status === "pending" && (
                          <Select onValueChange={(value) => handleStatusUpdate(transfer.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_transit">Start Transfer</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        {transfer.status === "in_transit" && (
                          <Button size="sm" onClick={() => handleStatusUpdate(transfer.id, "completed")}>
                            Mark Complete
                          </Button>
                        )}
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