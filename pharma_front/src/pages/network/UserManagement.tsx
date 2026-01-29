import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Users, UserCheck, UserX, Settings, Shield, Eye, EyeOff, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw, Key, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usersAPI, organizationsAPI } from "@/services/api";
import type { User as UserType, Branch } from "@/services/api";

// Module Permission Data Structure (from backend)
interface ModulePermission {
  id: string;
  name: string;
  has_access: boolean;
  sub_modules: SubModulePermission[];
}

interface SubModulePermission {
  id: string;
  name: string;
  has_access: boolean;
}

const userRoles = [
  "branch_manager",
  "senior_pharmacist",
  "pharmacist",
  "pharmacy_technician",
  "cashier",
  "supplier_admin",
  "sales_representative"
];


export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    password_confirm: "",
    role: "",
    phone: "",
    branch_id: ""
  });

  // User action dialogs
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  // Permissions state
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [availableModules, setAvailableModules] = useState<ModulePermission[]>([]);
  const [userModules, setUserModules] = useState<ModulePermission[]>([]);

  const { toast } = useToast();

  // Get current user organization
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userOrganizationId = currentUser?.organization_id;

  // Get current user role
  const currentUserRole = currentUser?.role;

  // Load users and branches on component mount
  useEffect(() => {
    loadUsers();
    loadBranches();
  }, []);

  // Reload users when branch filter changes
  useEffect(() => {
    loadUsers();
  }, [selectedBranchFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Loading users for organization:', userOrganizationId);

      const params: any = {};
      
      // Add branch filter if selected
      if (selectedBranchFilter !== 'all') {
        params.branch_id = selectedBranchFilter;
      }
      
      const response = await usersAPI.getUsers(params);
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

      // Filter users by current user's organization
      const orgUsers = allUsers.filter((user: UserType) =>
        user.organization_id === userOrganizationId
      );
      console.log('DEBUG: Filtered users for organization', userOrganizationId, ':', orgUsers);

      setUsers(orgUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      console.log('DEBUG: Loading branches for organization:', userOrganizationId);

      const response = await organizationsAPI.getBranches();
      console.log('DEBUG: Branches API Response:', response);

      // Handle both wrapped response format and direct array format
      let allBranches: Branch[] = [];
      if (response.success && response.data) {
        allBranches = response.data;
      } else if (Array.isArray(response)) {
        allBranches = response;
      } else {
        console.warn('Unexpected branches API response format:', response);
        allBranches = [];
      }

      // Filter branches by current user's organization
      const orgBranches = allBranches.filter((branch: Branch) =>
        branch.organization === userOrganizationId
      );
      console.log('DEBUG: Filtered branches for organization', userOrganizationId, ':', orgBranches);

      setBranches(orgBranches);
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
    } finally {
      setLoadingBranches(false);
    }
  };

  const createDefaultBranch = async () => {
    try {
      const response = await organizationsAPI.createDefaultBranch();
      const responseData = response as any;
      
      if (responseData && (responseData.branch || responseData.data)) {
        console.log('DEBUG: Default branch created successfully');
        await loadBranches(); // Reload branches
        return responseData.branch || responseData.data;
      } else {
        throw new Error(responseData?.error || "Failed to create default branch");
      }
    } catch (error) {
      console.error('Failed to create default branch:', error);
      throw error;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      branch_manager: "bg-blue-100 text-blue-800",
      senior_pharmacist: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      pharmacy_technician: "bg-yellow-100 text-yellow-800",
      cashier: "bg-orange-100 text-orange-800",
      supplier_admin: "bg-indigo-100 text-indigo-800",
      sales_representative: "bg-pink-100 text-pink-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      "branch_manager": "bg-blue-100 text-blue-800",
      "senior_pharmacist": "bg-green-100 text-green-800",
      "pharmacist": "bg-purple-100 text-purple-800",
      "pharmacy_technician": "bg-yellow-100 text-yellow-800",
      "cashier": "bg-orange-100 text-orange-800",
      "supplier_admin": "bg-indigo-100 text-indigo-800",
      "sales_representative": "bg-pink-100 text-pink-800"
    };

    return (
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
        {role.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    return status === "active" 
      ? <Badge variant="default" className="bg-green-100 text-green-800"><UserCheck size={12} className="mr-1" />Active</Badge>
      : <Badge variant="secondary"><UserX size={12} className="mr-1" />Inactive</Badge>;
  };

  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.username || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation only for new users
    if (!isEditMode && newUser.password !== newUser.password_confirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Check if user is superuser
    const isSuperUser = currentUser?.role === 'super_admin';

    // Branch validation for non-superusers
    if (!isSuperUser) {
      // Check if branches exist
      if (branches.length === 0) {
        // No branches exist, create default main branch
        try {
          toast({
            title: "Info",
            description: "Creating default main branch...",
          });
          const newBranch = await createDefaultBranch();
          // Update the branches state with the new branch
          setBranches([newBranch]);
          // Auto-select the newly created branch
          setNewUser(prev => ({ ...prev, branch_id: newBranch.id.toString() }));
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create default branch. Please create a branch first.",
            variant: "destructive",
          });
          return;
        }
      }

      // After ensuring branches exist, validate branch selection
      if (!newUser.branch_id) {
        // If no branch selected, auto-select the first available branch (main branch)
        const mainBranch = branches.find(b => b.type === 'main') || branches[0];
        if (mainBranch) {
          setNewUser(prev => ({ ...prev, branch_id: mainBranch.id.toString() }));
        } else {
          toast({
            title: "Error",
            description: "Please select a branch for the user",
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      setCreatingUser(true);

      const userData: any = {
        ...newUser,
        organization_id: userOrganizationId,
        status: 'active',
        // Only include branch_id for non-superusers and if branch_id is set
        ...(isSuperUser ? {} : newUser.branch_id ? { branch_id: parseInt(newUser.branch_id) } : {})
      };

      // Remove password fields for updates if empty
      if (isEditMode && !userData.password) {
        delete userData.password;
        delete userData.password_confirm;
      }

      let response;
      if (isEditMode && selectedUser) {
        // Update existing user
        response = await usersAPI.updateUser(selectedUser.id, userData);
      } else {
        // Create new user
        response = await usersAPI.createUser(userData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: isEditMode
            ? `${newUser.first_name} ${newUser.last_name} has been updated successfully`
            : `${newUser.first_name} ${newUser.last_name} has been added successfully`,
        });
        setIsDialogOpen(false);
        resetNewUser();
        setIsEditMode(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to ${isEditMode ? 'update' : 'create'} user`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} user`,
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const resetNewUser = () => {
    setNewUser({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "",
      password_confirm: "",
      role: "",
      phone: "",
      branch_id: ""
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      // Find the user to get their current phone number
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      // Update user status via API with required phone field
      const response = await usersAPI.updateUser(userId, { 
        status: newStatus,
        phone: user.phone || ""
      });

      if (response.success) {
        toast({
          title: "Status Updated",
          description: `User status changed to ${newStatus}`,
        });
        loadUsers(); // Refresh the user list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: UserType) => {
    // Set user for editing
    setSelectedUser(user);
    setNewUser({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: (user as any).username || user.email,
      password: '',
      password_confirm: '',
      role: user.role,
      phone: user.phone || '',
      branch_id: user.branch_id?.toString() || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const openPermissionDialog = (user: UserType) => {
    setSelectedUser(user);
    loadUserPermissions(user);
    setShowPermissionsDialog(true);
  };

  const loadUserPermissions = async (user: UserType) => {
    setLoadingPermissions(true);
    try {
      // First, find the latest pharmacy_owner for this organization
      const allUsersResponse = await usersAPI.getUsers();
      console.log('All users response:', allUsersResponse);
      
      let allUsers: UserType[] = [];
      if (allUsersResponse.success && allUsersResponse.data) {
        allUsers = allUsersResponse.data;
      } else if (Array.isArray(allUsersResponse)) {
        allUsers = allUsersResponse;
      } else {
        throw new Error('Failed to load users');
      }

      // Filter users by organization and find pharmacy_owners
      const orgUsers = allUsers.filter((u: UserType) =>
        u.organization_id === userOrganizationId
      );
      console.log('Organization users:', orgUsers);

      const pharmacyOwners = orgUsers.filter((u: UserType) =>
        u.role === 'pharmacy_owner'
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      console.log('Pharmacy owners found:', pharmacyOwners);

      const latestPharmacyOwner = pharmacyOwners[0];
      console.log('Latest pharmacy owner:', latestPharmacyOwner);

      // Load the current user's specific permissions
      console.log('Loading permissions for user:', user.id, user.first_name, user.last_name);
      const userPermissionsResponse = await usersAPI.getUserModulePermissions(user.id);
      console.log('User permissions API response:', userPermissionsResponse);

      // Handle API response - try multiple possible response formats
      let userModules: ModulePermission[] = [];

      console.log('Raw userPermissionsResponse.data:', userPermissionsResponse.data);
      
      if (userPermissionsResponse.success && userPermissionsResponse.data) {
        // Handle nested response structure: {success: true, data: {success: true, data: {modules: [...]}}}
        let actualData = userPermissionsResponse.data;
        if (actualData.success && actualData.data) {
          actualData = actualData.data;
        }
        
        if (actualData.modules && Array.isArray(actualData.modules)) {
          userModules = actualData.modules;
          console.log('User has existing permissions (nested structure):', userModules);
        } else if (Array.isArray(actualData)) {
          userModules = actualData;
          console.log('User has direct array permissions:', userModules);
        } else {
          console.log('User permissions data format not recognized:', actualData);
          userModules = [];
        }
      } else if ((userPermissionsResponse as any).modules && Array.isArray((userPermissionsResponse as any).modules)) {
        userModules = (userPermissionsResponse as any).modules;
        console.log('User has direct modules permissions:', userModules);
      } else {
        console.log('User has no existing permissions or API error');
        userModules = [];
      }

      console.log('Final extracted userModules:', userModules);
      
      // If no pharmacy owner found, show user's current permissions without filtering
      if (!latestPharmacyOwner) {
        console.log('No pharmacy owner found, showing user modules without filtering');
        setUserModules(userModules);
        
        // Convert to permissions object for checkboxes
        const permissions: Record<string, boolean> = {};
        userModules.forEach((module: ModulePermission) => {
          permissions[module.id] = module.has_access;
          module.sub_modules.forEach((subModule: SubModulePermission) => {
            permissions[subModule.id] = subModule.has_access;
          });
        });
        
        console.log('Setting userPermissions to:', permissions);
        setUserPermissions(permissions);
        setAvailableModules(userModules);
        return;
      }

      // Get the pharmacy owner's permissions to determine which modules are allowed
      const ownerPermissionsResponse = await usersAPI.getUserModulePermissions(latestPharmacyOwner.id);
      console.log('Owner permissions response:', ownerPermissionsResponse);
      console.log('Raw ownerPermissionsResponse.data:', ownerPermissionsResponse.data);
      
      let ownerModules: ModulePermission[] = [];
      if (ownerPermissionsResponse.success && ownerPermissionsResponse.data) {
        // Handle nested response structure: {success: true, data: {success: true, data: {modules: [...]}}}
        let actualOwnerData = ownerPermissionsResponse.data;
        if (actualOwnerData.success && actualOwnerData.data) {
          actualOwnerData = actualOwnerData.data;
        }
        
        if (actualOwnerData.modules && Array.isArray(actualOwnerData.modules)) {
          ownerModules = actualOwnerData.modules;
          console.log('Owner has modules (nested structure):', ownerModules);
        } else if (Array.isArray(actualOwnerData)) {
          ownerModules = actualOwnerData;
          console.log('Owner has direct array:', ownerModules);
        } else {
          console.log('Owner permissions data format not recognized:', actualOwnerData);
          ownerModules = [];
        }
      } else if ((ownerPermissionsResponse as any).modules) {
        ownerModules = (ownerPermissionsResponse as any).modules;
        console.log('Owner has direct modules:', ownerModules);
      }
      
      console.log('Final owner modules:', ownerModules);
      
      // Get only modules that pharmacy owner has access to (has_access: true)
      const allowedModules = ownerModules.filter((module: ModulePermission) => module.has_access);
      console.log('Pharmacy owner allowed modules:', allowedModules);

      // If pharmacy owner has no allowed modules, show empty list
      if (allowedModules.length === 0) {
        console.log('Pharmacy owner has no allowed modules, showing empty list');
        setUserModules([]);
        setUserPermissions({});
        setAvailableModules([]);
        return;
      }

      // Create modules structure based on pharmacy owner's allowed modules
      const userModulesWithPermissions = allowedModules.map((allowedModule: ModulePermission) => {
        // Find user's existing permissions for this module
        const userModule = userModules.find((um: ModulePermission) => um.id === allowedModule.id);

        if (userModule) {
          // Filter submodules to only show those allowed by pharmacy owner
          const filteredSubModules = userModule.sub_modules.filter((userSubModule: SubModulePermission) =>
            allowedModule.sub_modules.some((ownerSubModule: SubModulePermission) => 
              ownerSubModule.id === userSubModule.id && ownerSubModule.has_access
            )
          );

          return {
            ...userModule,
            sub_modules: filteredSubModules
          };
        } else {
          // Create default structure with only allowed submodules
          const allowedSubModules = allowedModule.sub_modules.filter((subModule: SubModulePermission) => subModule.has_access);
          
          return {
            ...allowedModule,
            has_access: false,
            sub_modules: allowedSubModules.map((subModule: SubModulePermission) => ({
              ...subModule,
              has_access: false
            }))
          };
        }
      });

      console.log('Final user modules with permissions:', userModulesWithPermissions);
      console.log('Setting userModules state to:', userModulesWithPermissions);

      setUserModules(userModulesWithPermissions);

      // Convert to permissions object for checkboxes
      const permissions: Record<string, boolean> = {};
      userModulesWithPermissions.forEach((module: ModulePermission) => {
        permissions[module.id] = module.has_access;
        module.sub_modules.forEach((subModule: SubModulePermission) => {
          permissions[subModule.id] = subModule.has_access;
        });
      });

      setUserPermissions(permissions);
      setAvailableModules(allowedModules);

    } catch (error) {
      console.error('Failed to load user permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const updatedPermissions = { ...userPermissions };
    updatedPermissions[permissionId] = checked;

    // Handle hierarchical permissions
    const module = userModules.find(m => m.id === permissionId);
    if (module) {
      // Main module checkbox changed
      if (checked) {
        // If main module is checked, check all available sub-modules
        module.sub_modules.forEach(subModule => {
          updatedPermissions[subModule.id] = true;
        });
      } else {
        // If main module is unchecked, uncheck all sub-modules
        module.sub_modules.forEach(subModule => {
          updatedPermissions[subModule.id] = false;
        });
      }
    } else {
      // Sub-module checkbox changed - update parent module state
      const parentModule = userModules.find(m =>
        m.sub_modules.some(sm => sm.id === permissionId)
      );

      if (parentModule) {
        // Check if any sub-modules are still enabled for the parent module
        const hasAnySubModuleEnabled = parentModule.sub_modules.some(sm =>
          updatedPermissions[sm.id] || (sm.id === permissionId && checked)
        );
        updatedPermissions[parentModule.id] = hasAnySubModuleEnabled;
      }
    }

    setUserPermissions(updatedPermissions);
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoadingPermissions(true);

      // Save permissions to backend
      const response = await usersAPI.updateUserModulePermissions(selectedUser.id, userPermissions);
      console.log('Save permissions response:', response);

      if (response.success) {
        const isOwner = selectedUser?.role === 'pharmacy_owner';
        toast({
          title: 'Success',
          description: isOwner
            ? 'Permissions updated successfully. Changes may affect other users in the organization.'
            : 'Permissions updated successfully',
        });

        // Update the userModules state to reflect the saved permissions
        const updatedUserModules = userModules.map(module => ({
          ...module,
          has_access: userPermissions[module.id] || false,
          sub_modules: module.sub_modules.map(subModule => ({
            ...subModule,
            has_access: userPermissions[subModule.id] || false
          }))
        }));
        
        setUserModules(updatedUserModules);

        // Keep the dialog open to show the updated state
        // User can close it manually to see the changes are persisted
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update permissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const getFilteredModules = () => {
    console.log('getFilteredModules called, userModules length:', userModules?.length);
    console.log('getFilteredModules userModules:', userModules);
    return userModules || [];
  };

  const openPasswordChangeDialog = (user: UserType) => {
    setSelectedUser(user);
    setShowPasswordChangeDialog(true);
  };

  const handlePasswordChange = async () => {
    if (!selectedUser) return;

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingUser(true);
      const response = await usersAPI.changeUserPassword(selectedUser.id, {
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      console.log('Password change response:', response);

      if (response.success || (response as any).user) {
        toast({
          title: 'Success',
          description: 'Password updated successfully',
        });
        setShowPasswordChangeDialog(false);
        setPasswordForm({ new_password: '', confirm_password: '' });
        setSelectedUser(null);
        // Refresh user list to show updated plain text password
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === "active").length;
  const inactiveUsers = users.filter(user => user.status === "inactive").length;
  const uniqueRoles = [...new Set(users.map(user => user.role))].length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users for your organization</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="outline" className="gap-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update user information and permissions' : 'Create a new user account with role-based permissions'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="userEmail">Email Address *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={newUser.password_confirm}
                      onChange={(e) => setNewUser({...newUser, password_confirm: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userRole">Role *</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map(role => (
                        <SelectItem key={role} value={role}>{role.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Branch selection - only show for non-superusers */}
                {currentUser?.role !== 'super_admin' && (
                  <div>
                    <Label htmlFor="userBranch">Branch *</Label>
                    <Select 
                      value={newUser.branch_id} 
                      onValueChange={(value) => setNewUser({...newUser, branch_id: value})}
                      disabled={loadingBranches}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select branch"} />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.length === 0 ? (
                          <SelectItem value="" disabled>
                            {loadingBranches ? "Loading..." : "No branches available"}
                          </SelectItem>
                        ) : (
                          branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                              {branch.name} ({branch.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {branches.length === 0 && !loadingBranches && (
                      <p className="text-xs text-muted-foreground mt-1">
                        No branches found. A default "Main Branch" will be created automatically.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetNewUser();
                setIsEditMode(false);
                setSelectedUser(null);
              }}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={creatingUser || loadingBranches}>
                {creatingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditMode ? 'Update User' : 'Add User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordChangeDialog} onOpenChange={(open) => {
          setShowPasswordChangeDialog(open);
          if (!open) {
            setSelectedUser(null);
            setPasswordForm({ new_password: '', confirm_password: '' });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Change password for {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Display current user info */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Username:</span>
                  <span className="text-gray-600">{selectedUser?.email}</span>
                </div>
                {selectedUser?.plain_text_password && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Current Password:</span>
                    <span className="text-gray-600 font-mono">{selectedUser.plain_text_password}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password *</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_new_password">Confirm New Password *</Label>
                <Input
                  id="confirm_new_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPasswordChangeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange} disabled={creatingUser}>
                {creatingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Module Permissions</DialogTitle>
              <DialogDescription>
                  Manage module permissions for {selectedUser?.first_name} {selectedUser?.last_name}
                  <span className="block text-sm text-amber-600 mt-1">
                    Only modules permitted to the latest pharmacy owner are shown
                  </span>
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {loadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <>
                  {(() => {
                    const modules = getFilteredModules();
                    console.log('Rendering modules, count:', modules?.length);
                    console.log('Modules to render:', modules);
                    return modules?.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No modules available for this user.</p>
                      </div>
                    ) : (
                      modules?.map((module) => (
                        <div key={module.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <input
                              type="checkbox"
                              id={module.id}
                              checked={userPermissions[module.id] || false}
                              onChange={(e) => handlePermissionChange(module.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={module.id} className="text-lg font-medium text-gray-900">
                              {module.name}
                            </label>
                          </div>

                          <div className="ml-7">
                            <div className="flex flex-wrap gap-4">
                              {module.sub_modules.map((subModule) => (
                                <div key={subModule.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={subModule.id}
                                    checked={userPermissions[subModule.id] || false}
                                    onChange={(e) => handlePermissionChange(subModule.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={subModule.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    {subModule.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    );
                  })()}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowPermissionsDialog(false);
                setSelectedUser(null);
                setUserPermissions({});
                setUserModules([]);
              }}>
                Close
              </Button>
              <Button onClick={saveUserPermissions} disabled={loadingPermissions}>
                {loadingPermissions && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Permissions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{inactiveUsers}</p>
                <p className="text-sm text-muted-foreground">Inactive Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{uniqueRoles}</p>
                <p className="text-sm text-muted-foreground">User Roles</p>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name} ({branch.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {userRoles.map(role => (
                  <SelectItem key={role} value={role}>{role.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List - Same as Admin Page */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Users List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first user."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                        {user.branch_name && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {user.branch_name}
                          </span>
                        )}
                      </div>
                      {user.phone && <div className="text-sm text-muted-foreground">{user.phone}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {currentUserRole === 'pharmacy_owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPermissionDialog(user)}
                          title="Module Permissions"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPasswordChangeDialog(user)}
                        title="Change Password"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        disabled={creatingUser}
                      >
                        <Power className={`w-4 h-4 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}