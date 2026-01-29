import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Search, MapPin, Loader2, UserPlus, User, Users, Edit, Trash2, MoreHorizontal, RefreshCw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { organizationsAPI, usersAPI } from "@/services/api";
import type { Branch, User as UserType } from "@/services/api";

const branchTypes = ["main", "branch", "warehouse", "distribution"];
const branchStatuses = ["active", "inactive", "maintenance", "closed"];

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignManagerDialog, setShowAssignManagerDialog] = useState(false);
  const [selectedBranchForManager, setSelectedBranchForManager] = useState<Branch | null>(null);
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState<Branch | null>(null);
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [updatingBranch, setUpdatingBranch] = useState(false);
  const [assigningManager, setAssigningManager] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    type: "branch",
    address: "",
    city: "Kathmandu",
    state: "Bagmati",
    postal_code: "44600",
    country: "Nepal",
    phone: "",
    email: "",
    license_number: "",
    license_expiry: ""
  });

  const { toast } = useToast();

  // Get current user organization
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userOrganizationId = currentUser?.organization_id;

  // Load branches and users on component mount
  useEffect(() => {
    loadBranches();
    loadOrganizationUsers();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Loading branches for user:', currentUser?.email, 'Organization ID:', userOrganizationId);

      const response = await organizationsAPI.getBranches();
      console.log('DEBUG: API Response:', response);

      // Handle both wrapped response format and direct array format
      let allBranches: Branch[] = [];
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        allBranches = response.data;
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        allBranches = response;
      } else {
        console.warn('Unexpected branch API response format:', response);
        allBranches = [];
      }

      console.log('DEBUG: All branches from API:', allBranches);

      // Filter branches by current user's organization
      const userBranches = allBranches.filter((branch: Branch) =>
        branch.organization === userOrganizationId
      );
      console.log('DEBUG: Filtered branches for organization', userOrganizationId, ':', userBranches);

      setBranches(userBranches);
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationUsers = async () => {
    try {
      console.log('DEBUG: Loading organization users for organization:', userOrganizationId);

      const response = await usersAPI.getUsers();
      console.log('DEBUG: Users API Response:', response);

      // Handle both wrapped response format and direct array format
      let allUsers: UserType[] = [];
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        allUsers = response.data;
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        allUsers = response;
      } else {
        console.warn('Unexpected users API response format:', response);
        allUsers = [];
      }

      console.log('DEBUG: All users from API:', allUsers);

      // Filter users by current user's organization and manager roles
      const orgUsers = allUsers.filter((user: UserType) =>
        user.organization_id === userOrganizationId &&
        (user.role === 'branch_manager' || user.role === 'senior_pharmacist' || user.role === 'pharmacist')
      );
      console.log('DEBUG: Filtered manager users for organization', userOrganizationId, ':', orgUsers);

      setOrganizationUsers(orgUsers);
    } catch (error) {
      console.error('Failed to load organization users:', error);
    }
  };

  const handleAssignManager = async (managerId: string) => {
    if (!selectedBranchForManager) return;

    try {
      setAssigningManager(true);

      // Send complete branch data with updated manager
      const branchData = {
        name: selectedBranchForManager.name,
        code: selectedBranchForManager.code,
        type: selectedBranchForManager.type,
        address: selectedBranchForManager.address,
        city: selectedBranchForManager.city,
        state: selectedBranchForManager.state,
        postal_code: selectedBranchForManager.postal_code,
        country: selectedBranchForManager.country,
        phone: selectedBranchForManager.phone || '',
        email: selectedBranchForManager.email || '',
        organization: selectedBranchForManager.organization,
        status: selectedBranchForManager.status,
        manager: managerId,
        license_number: selectedBranchForManager.license_number || '',
        license_expiry: selectedBranchForManager.license_expiry || null
      };

      const response = await organizationsAPI.updateBranch(selectedBranchForManager.id, branchData);

      // Handle both ApiResponse format and direct backend response
      const responseData = response as any;
      if (responseData && (responseData.branch || responseData.data || responseData.success)) {
        toast({
          title: "Success",
          description: "Manager assigned successfully"
        });
        setShowAssignManagerDialog(false);
        setSelectedBranchForManager(null);
        loadBranches(); // Refresh branches to show updated manager
      } else {
        toast({
          title: "Error",
          description: responseData?.error || "Failed to assign manager",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign manager",
        variant: "destructive"
      });
    } finally {
      setAssigningManager(false);
    }
  };

  const openAssignManagerDialog = (branch: Branch) => {
    setSelectedBranchForManager(branch);
    setShowAssignManagerDialog(true);
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranchForEdit(branch);
    setNewBranch({
      name: branch.name,
      code: branch.code,
      type: branch.type,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      postal_code: branch.postal_code,
      country: branch.country,
      phone: branch.phone || "",
      email: branch.email || "",
      license_number: branch.license_number || "",
      license_expiry: branch.license_expiry || ""
    });
    setShowEditDialog(true);
  };

  const handleUpdateBranch = async () => {
    if (!selectedBranchForEdit || !newBranch.name || !newBranch.code || !newBranch.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdatingBranch(true);

      const branchData: any = {
        name: newBranch.name,
        code: newBranch.code,
        type: newBranch.type,
        address: newBranch.address,
        city: newBranch.city,
        state: newBranch.state,
        postal_code: newBranch.postal_code,
        country: newBranch.country,
        phone: newBranch.phone,
        email: newBranch.email,
        organization: selectedBranchForEdit.organization,
        status: selectedBranchForEdit.status,
        manager: selectedBranchForEdit.manager
      };

      if (newBranch.license_number.trim()) {
        branchData.license_number = newBranch.license_number.trim();
      }
      if (newBranch.license_expiry.trim()) {
        branchData.license_expiry = newBranch.license_expiry.trim();
      }

      const response = await organizationsAPI.updateBranch(selectedBranchForEdit.id, branchData);

      const responseData = response as any;
      if (responseData && (responseData.branch || responseData.data || responseData.success !== false)) {
        toast({
          title: "Success",
          description: "Branch updated successfully"
        });
        setShowEditDialog(false);
        setSelectedBranchForEdit(null);
        resetForm();
        loadBranches();
      } else {
        toast({
          title: "Error",
          description: responseData?.error || "Failed to update branch",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update branch",
        variant: "destructive"
      });
    } finally {
      setUpdatingBranch(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranch.name || !newBranch.code || !newBranch.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if trying to create a main branch when one already exists
    if (newBranch.type === "main") {
      const existingMainBranch = branches.find(b => b.type === "main");
      if (existingMainBranch) {
        toast({
          title: "Error",
          description: "Only one main branch is allowed per organization",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setCreatingBranch(true);

      // Prepare branch data, excluding empty license_expiry
      const branchData: any = {
        name: newBranch.name,
        code: newBranch.code,
        type: newBranch.type,
        address: newBranch.address,
        city: newBranch.city,
        state: newBranch.state,
        postal_code: newBranch.postal_code,
        country: newBranch.country,
        phone: newBranch.phone,
        email: newBranch.email,
        organization: userOrganizationId,
        status: "active"
      };

      // Only include license fields if they have values
      if (newBranch.license_number.trim()) {
        branchData.license_number = newBranch.license_number.trim();
      }
      if (newBranch.license_expiry.trim()) {
        branchData.license_expiry = newBranch.license_expiry.trim();
      }

      const response = await organizationsAPI.createBranch(branchData);

      // Check if response has branch data (successful creation)
      // Handle both ApiResponse format and direct backend response
      const responseData = response as any;
      if (responseData && (responseData.branch || responseData.data)) {
        toast({
          title: "Success",
          description: responseData.message || "Branch created successfully"
        });
        setShowAddDialog(false);
        resetForm();
        loadBranches();
      } else {
        toast({
          title: "Error",
          description: responseData?.error || "Failed to create branch",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create branch",
        variant: "destructive"
      });
    } finally {
      setCreatingBranch(false);
    }
  };

  const resetForm = () => {
    setNewBranch({
      name: "",
      code: "",
      type: "branch",
      address: "",
      city: "Kathmandu",
      state: "Bagmati",
      postal_code: "44600",
      country: "Nepal",
      phone: "",
      email: "",
      license_number: "",
      license_expiry: ""
    });
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || branch.status === statusFilter;
    const matchesType = typeFilter === "all" || branch.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-red-100 text-red-800 border-red-200"
    };
    return <Badge className={styles[status] || styles.inactive}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      main: "bg-blue-100 text-blue-800 border-blue-200",
      branch: "bg-purple-100 text-purple-800 border-purple-200",
      warehouse: "bg-orange-100 text-orange-800 border-orange-200",
      distribution: "bg-cyan-100 text-cyan-800 border-cyan-200"
    };
    return <Badge className={styles[type] || styles.branch}>{type}</Badge>;
  };

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === "active").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground">Manage pharmacy branches for your organization</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Create a new branch for your organization</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Branch Code *</Label>
                  <Input
                    id="code"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({...newBranch, code: e.target.value})}
                    placeholder="Enter unique branch code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                  placeholder="Enter complete address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                    placeholder="Kathmandu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({...newBranch, state: e.target.value})}
                    placeholder="Bagmati"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                    placeholder="+977-XX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({...newBranch, email: e.target.value})}
                    placeholder="branch@pharmacy.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Branch Type *</Label>
                  <Select value={newBranch.type} onValueChange={(value) => setNewBranch({...newBranch, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {branchTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={newBranch.license_number}
                    onChange={(e) => setNewBranch({...newBranch, license_number: e.target.value})}
                    placeholder="DDA License Number"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateBranch} disabled={creatingBranch}>
                {creatingBranch && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
              <DialogDescription>Update branch information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Branch Name *</Label>
                  <Input
                    id="edit-name"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Branch Code *</Label>
                  <Input
                    id="edit-code"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({...newBranch, code: e.target.value})}
                    placeholder="Enter unique branch code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address *</Label>
                <Textarea
                  id="edit-address"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                  placeholder="Enter complete address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                    placeholder="Kathmandu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({...newBranch, state: e.target.value})}
                    placeholder="Bagmati"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                    placeholder="+977-XX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({...newBranch, email: e.target.value})}
                    placeholder="branch@pharmacy.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Branch Type *</Label>
                  <Select value={newBranch.type} onValueChange={(value) => setNewBranch({...newBranch, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {branchTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-license_number">License Number</Label>
                  <Input
                    id="edit-license_number"
                    value={newBranch.license_number}
                    onChange={(e) => setNewBranch({...newBranch, license_number: e.target.value})}
                    placeholder="DDA License Number"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false);
                setSelectedBranchForEdit(null);
                resetForm();
              }}>Cancel</Button>
              <Button onClick={handleUpdateBranch} disabled={updatingBranch}>
                {updatingBranch && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Manager Dialog */}
        <Dialog open={showAssignManagerDialog} onOpenChange={setShowAssignManagerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Manager</DialogTitle>
              <DialogDescription>
                Assign a manager to {selectedBranchForManager?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Manager</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {organizationUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No eligible managers found
                    </div>
                  ) : (
                    organizationUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAssignManager(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.role.replace('_', ' ')} • {user.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={assigningManager}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignManager(user.id);
                          }}
                        >
                          {assigningManager && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          Assign
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAssignManagerDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBranches}</div>
            <p className="text-xs text-muted-foreground">In your organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBranches}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch List */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Directory</CardTitle>
          <CardDescription>View and manage branches for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {branchStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {branchTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-muted-foreground">{branch.code}</div>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {branch.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(branch.type)}</TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {branch.manager_name ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {branch.manager_name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {branch.phone && <div>{branch.phone}</div>}
                          {branch.email && <div className="text-muted-foreground">{branch.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(branch)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssignManagerDialog(branch)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Manager
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBranches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No branches found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}