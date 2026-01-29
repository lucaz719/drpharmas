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
  Search, Plus, Edit, Eye, MessageCircle, 
  Phone, Mail, Calendar, FileText, Send,
  Clock, CheckCircle, AlertCircle, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCommunications = [
  {
    id: "COMM-001",
    supplierId: "SUP-001",
    supplierName: "MediCorp Nepal",
    contactPerson: "Dr. Ram Sharma",
    type: "email",
    subject: "New Product Launch Discussion",
    content: "We would like to discuss the launch of our new antibiotic line and potential partnership opportunities for exclusive distribution.",
    date: "2024-01-15",
    time: "14:30",
    direction: "incoming",
    status: "replied",
    priority: "high",
    assignedTo: "Pharmacy Manager",
    followUpDate: "2024-01-20",
    attachments: ["product_catalog.pdf", "pricing_sheet.xlsx"],
    tags: ["product_launch", "partnership", "antibiotics"]
  },
  {
    id: "COMM-002",
    supplierId: "SUP-002",
    supplierName: "PharmaCo Ltd",
    contactPerson: "Sita Gurung",
    type: "phone",
    subject: "Delivery Schedule Confirmation",
    content: "Called to confirm delivery schedule for insulin pen order PO-002. Confirmed delivery on January 22nd at 10:00 AM.",
    date: "2024-01-14",
    time: "11:15",
    direction: "outgoing",
    status: "completed",
    priority: "medium",
    assignedTo: "Purchase Manager",
    followUpDate: null,
    attachments: [],
    tags: ["delivery", "insulin", "confirmation"]
  },
  {
    id: "COMM-003",
    supplierId: "SUP-003",
    supplierName: "HealthPlus Supply",
    contactPerson: "Hari Thapa",
    type: "meeting",
    subject: "Quarterly Business Review",
    content: "Quarterly business review meeting to discuss performance metrics, upcoming requirements, and contract renewal terms.",
    date: "2024-01-12",
    time: "15:00",
    direction: "meeting",
    status: "completed",
    priority: "high",
    assignedTo: "Business Development",
    followUpDate: "2024-04-12",
    attachments: ["qbr_presentation.pptx", "performance_report.pdf"],
    tags: ["quarterly_review", "performance", "contract"]
  },
  {
    id: "COMM-004",
    supplierId: "SUP-001",
    supplierName: "MediCorp Nepal",
    contactPerson: "Dr. Ram Sharma",
    type: "email",
    subject: "Payment Terms Negotiation",
    content: "Following up on our discussion about extending payment terms from 30 to 45 days. Please confirm if this is acceptable.",
    date: "2024-01-10",
    time: "09:45",
    direction: "outgoing",
    status: "pending",
    priority: "medium",
    assignedTo: "Finance Manager",
    followUpDate: "2024-01-17",
    attachments: ["payment_terms_proposal.pdf"],
    tags: ["payment_terms", "negotiation", "finance"]
  },
  {
    id: "COMM-005",
    supplierId: "SUP-004",
    supplierName: "NutriMed Pharma",
    contactPerson: "Maya Shrestha",
    type: "email",
    subject: "Quality Concern Report",
    content: "We've noticed some inconsistencies in the latest batch of Vitamin D3 supplements. Please investigate and provide a response.",
    date: "2024-01-08",
    time: "16:20",
    direction: "outgoing",
    status: "pending",
    priority: "high",
    assignedTo: "Quality Manager",
    followUpDate: "2024-01-15",
    attachments: ["quality_report.pdf", "batch_analysis.xlsx"],
    tags: ["quality_concern", "vitamins", "investigation"]
  }
];

const suppliers = [
  { id: "SUP-001", name: "MediCorp Nepal" },
  { id: "SUP-002", name: "PharmaCo Ltd" },
  { id: "SUP-003", name: "HealthPlus Supply" },
  { id: "SUP-004", name: "NutriMed Pharma" },
  { id: "SUP-005", name: "BioPharma Industries" }
];

export default function SupplierCommunications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCommunications = mockCommunications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || comm.type === typeFilter;
    const matchesStatus = statusFilter === "all" || comm.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || comm.supplierId === supplierFilter;
    return matchesSearch && matchesType && matchesStatus && matchesSupplier;
  });

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      email: { variant: "default", label: "Email", icon: Mail },
      phone: { variant: "secondary", label: "Phone", icon: Phone },
      meeting: { variant: "outline", label: "Meeting", icon: Calendar },
      chat: { variant: "default", label: "Chat", icon: MessageCircle }
    };
    const config = typeConfig[type] || typeConfig.email;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending", icon: Clock },
      replied: { variant: "default", label: "Replied", icon: CheckCircle },
      completed: { variant: "default", label: "Completed", icon: CheckCircle },
      overdue: { variant: "destructive", label: "Overdue", icon: AlertCircle }
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
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    };
    return <Badge variant={variants[priority] as any}>{priority}</Badge>;
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "incoming":
        return <div className="w-2 h-2 rounded-full bg-blue-500" title="Incoming" />;
      case "outgoing":
        return <div className="w-2 h-2 rounded-full bg-green-500" title="Outgoing" />;
      case "meeting":
        return <div className="w-2 h-2 rounded-full bg-purple-500" title="Meeting" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500" />;
    }
  };

  const handleCreateCommunication = () => {
    toast({
      title: "Communication Logged",
      description: "New communication record has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateStatus = (commId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Communication ${commId} status changed to ${newStatus}.`,
    });
  };

  const totalCommunications = mockCommunications.length;
  const pendingCommunications = mockCommunications.filter(c => c.status === "pending").length;
  const overdueItems = mockCommunications.filter(c => 
    c.followUpDate && new Date(c.followUpDate) < new Date()
  ).length;
  const responseRate = ((mockCommunications.filter(c => c.status === "replied" || c.status === "completed").length / totalCommunications) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplier Communications</h1>
          <p className="text-muted-foreground">Track and manage all supplier interactions and correspondence</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Log Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Communication</DialogTitle>
              <DialogDescription>
                Record a new communication with a supplier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Communication Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="chat">Chat/Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="direction">Direction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="outgoing">Outgoing</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input placeholder="Communication subject/title" />
              </div>
              
              <div>
                <Label htmlFor="content">Content/Notes</Label>
                <Textarea placeholder="Detailed notes about the communication..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input placeholder="Responsible person" />
                </div>
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input type="date" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input placeholder="quality, pricing, delivery, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCommunication}>Log Communication</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalCommunications}</p>
                <p className="text-sm text-muted-foreground">Total Communications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingCommunications}</p>
                <p className="text-sm text-muted-foreground">Pending Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overdueItems}</p>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{responseRate}%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value="supplierFilter" onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              Export Communications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Communication History ({filteredCommunications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Communication</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {getDirectionIcon(comm.direction)}
                        <div>
                          <p className="font-medium">{comm.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {comm.content}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {comm.tags.map(tag => (
                              <span key={tag} className="text-xs bg-muted px-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comm.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{comm.contactPerson}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(comm.type)}</TableCell>
                    <TableCell>{getPriorityBadge(comm.priority)}</TableCell>
                    <TableCell>{getStatusBadge(comm.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{comm.date}</p>
                        <p className="text-xs text-muted-foreground">{comm.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {comm.followUpDate ? (
                        <div>
                          <p className="text-sm">{comm.followUpDate}</p>
                          <p className="text-xs text-muted-foreground">{comm.assignedTo}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
                              <DialogTitle>Communication Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Supplier</Label>
                                  <p className="font-medium">{comm.supplierName}</p>
                                </div>
                                <div>
                                  <Label>Contact Person</Label>
                                  <p>{comm.contactPerson}</p>
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <div className="mt-1">{getTypeBadge(comm.type)}</div>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <div className="mt-1">{getPriorityBadge(comm.priority)}</div>
                                </div>
                                <div>
                                  <Label>Date & Time</Label>
                                  <p>{comm.date} at {comm.time}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(comm.status)}</div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Subject</Label>
                                <p className="font-medium">{comm.subject}</p>
                              </div>
                              
                              <div>
                                <Label>Content</Label>
                                <p className="bg-muted p-3 rounded text-sm">{comm.content}</p>
                              </div>
                              
                              {comm.attachments.length > 0 && (
                                <div>
                                  <Label>Attachments</Label>
                                  <div className="flex gap-2 mt-1">
                                    {comm.attachments.map(attachment => (
                                      <Badge key={attachment} variant="outline" className="flex items-center gap-1">
                                        <FileText size={12} />
                                        {attachment}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-4">
                                {comm.assignedTo && (
                                  <div>
                                    <Label>Assigned To</Label>
                                    <p>{comm.assignedTo}</p>
                                  </div>
                                )}
                                {comm.followUpDate && (
                                  <div>
                                    <Label>Follow-up Date</Label>
                                    <p>{comm.followUpDate}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {comm.status === "pending" && (
                          <Select onValueChange={(value) => handleUpdateStatus(comm.id, value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="replied">Mark Replied</SelectItem>
                              <SelectItem value="completed">Mark Completed</SelectItem>
                            </SelectContent>
                          </Select>
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