import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { userSchema, type UserFormData } from "@/lib/validations";
import { useSearch } from "@/hooks/useSearch";
import { Search, Plus, Edit, Trash2, Shield, User, Mail, Phone } from "lucide-react";

const mockUsers = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@pharmacy.com",
    phone: "(555) 123-4567",
    role: "manager" as const,
    status: "active" as const,
    branchId: "main",
    permissions: ["manage_inventory", "manage_users", "view_reports"],
    lastLogin: "2024-01-13",
  },
  {
    id: "2", 
    name: "Mike Wilson",
    email: "mike.wilson@pharmacy.com",
    phone: "(555) 234-5678",
    role: "pharmacist" as const,
    status: "active" as const,
    branchId: "main",
    permissions: ["dispense_medication", "manage_prescriptions"],
    lastLogin: "2024-01-12",
  },
  {
    id: "3",
    name: "Lisa Brown",
    email: "lisa.brown@pharmacy.com", 
    phone: "(555) 345-6789",
    role: "technician" as const,
    status: "active" as const,
    branchId: "branch1",
    permissions: ["manage_inventory", "process_orders"],
    lastLogin: "2024-01-11",
  },
];

const rolePermissions = {
  super_admin: ["all"],
  owner: ["manage_pharmacy", "manage_users", "view_reports", "manage_inventory"],
  manager: ["manage_users", "manage_inventory", "view_reports", "process_orders"],
  pharmacist: ["dispense_medication", "manage_prescriptions", "view_reports"],
  technician: ["manage_inventory", "process_orders"],
  cashier: ["process_sales", "handle_returns"],
  supplier: ["view_orders", "update_order_status"],
};

interface UserManagementFormProps {
  onUserSave?: (user: UserFormData) => void;
  editingUser?: UserFormData & { id: string } | null;
  onEditingChange?: (user: any) => void;
}

export function UserManagementForm({ 
  onUserSave, 
  editingUser, 
  onEditingChange 
}: UserManagementFormProps) {
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: editingUser || {
      name: "",
      email: "",
      phone: "",
      role: "cashier",
      status: "active",
      permissions: [],
    },
  });

  const { 
    searchTerm, 
    setSearchTerm, 
    filteredData: filteredUsers,
    updateFilter 
  } = useSearch({
    data: mockUsers,
    searchFields: ["name", "email", "role"],
    filterFn: (user, filters) => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.status && user.status !== filters.status) return false;
      return true;
    },
  });

  const onSubmit = (data: UserFormData) => {
    onUserSave?.(data);
    form.reset();
    setShowForm(false);
    onEditingChange?.(null);
  };

  const handleEdit = (user: any) => {
    form.reset(user);
    setShowForm(true);
    onEditingChange?.(user);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: "destructive",
      owner: "default", 
      manager: "secondary",
      pharmacist: "default",
      technician: "outline",
      cashier: "outline",
      supplier: "outline",
    } as const;
    
    return (
      <Badge variant={roleConfig[role as keyof typeof roleConfig] || "outline"}>
        {role.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "destructive", 
      pending: "secondary",
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-foreground">User Management</h3>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={(value) => updateFilter("role", value === "all" ? "" : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">{editingUser ? "Update User" : "Create User"}</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      onEditingChange?.(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 border border-border rounded-lg hover:bg-panel transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{user.name}</h4>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-2" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <User size={14} className="mr-2" />
                        <span>Last login: {user.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}