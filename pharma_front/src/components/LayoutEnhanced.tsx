import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  SidebarInset, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, LogOut, Settings, Bell, Search, 
  Shield, Heart, User as UserIcon, ChevronDown 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  type User, 
  getUserById, 
  getOrganizationById, 
  getBranchById,
  mockOrganizations,
  getRoleDisplayName 
} from "@/data/mockData";
import { RoleBasedDashboard } from "./RoleBasedDashboard";

export default function LayoutEnhanced() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedOrg = localStorage.getItem("selectedOrganization");
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      if (storedOrg) {
        setSelectedOrg(storedOrg);
      } else if (user.organizationId) {
        setSelectedOrg(user.organizationId);
      }
      
      if (user.branchId) {
        setSelectedBranch(user.branchId);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("selectedOrganization");
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/login");
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrg(orgId);
    localStorage.setItem("selectedOrganization", orgId);
    
    // Reset branch selection when changing organization
    setSelectedBranch("");
    
    toast({
      title: "Organization Changed",
      description: `Switched to ${getOrganizationById(orgId)?.name}`,
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'SUPER_ADMIN': 'bg-warning text-warning-foreground',
      'PHARMACY_OWNER': 'bg-primary text-primary-foreground',
      'BRANCH_MANAGER': 'bg-secondary text-secondary-foreground',
      'SENIOR_PHARMACIST': 'bg-accent text-accent-foreground',
      'PHARMACIST': 'bg-accent text-accent-foreground',
      'PHARMACY_TECHNICIAN': 'bg-muted text-muted-foreground',
      'CASHIER': 'bg-muted text-muted-foreground',
      'SUPPLIER_ADMIN': 'bg-destructive text-destructive-foreground',
      'SALES_REPRESENTATIVE': 'bg-success text-success-foreground'
    };
    return colors[role as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const currentOrg = getOrganizationById(selectedOrg);
  const currentBranch = getBranchById(selectedBranch);
  
  // Show dashboard for root path
  if (location.pathname === "/") {
    return (
      <SidebarProvider>
        {/* Global trigger in header - always visible */}
        <header className="h-16 flex items-center border-b bg-card text-card-foreground px-6 z-50">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">MediPro System</h1>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            {/* Organization Selector for Multi-tenant Users */}
            {(currentUser.role === 'super_admin' || 
              (currentUser.role === 'owner' && mockOrganizations.length > 1)) && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <Select value={selectedOrg} onValueChange={handleOrgChange}>
                  <SelectTrigger className="w-48 bg-background text-foreground border border-border">
                    <SelectValue placeholder="Select Organization..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    {mockOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Search */}
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10">
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-3 border-l border-header-foreground/20 pl-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-6 h-6 bg-primary text-primary-foreground p-1 rounded" />
                <div>
                  <div className="text-sm font-medium">{currentUser.name}</div>
                  <Badge className={`text-xs ${getRoleColor(currentUser.role)}`}>
                    {getRoleDisplayName(currentUser.role)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-header-foreground hover:bg-header-foreground/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 min-w-0 overflow-hidden">
            {/* Main Content */}
            <main className="h-full w-full min-w-0 p-4 overflow-y-auto">
              <div className="w-full">
                <RoleBasedDashboard user={currentUser} />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Regular layout for other pages
  return (
    <SidebarProvider>
      {/* Global trigger in header - always visible */}
      <header className="h-16 flex items-center border-b bg-card text-card-foreground px-6 z-50">
        <SidebarTrigger className="mr-4" />
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">MediPro System</h1>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Organization Selector for Multi-tenant Users */}
          {(currentUser.role === 'super_admin' || 
            (currentUser.role === 'owner' && mockOrganizations.length > 1)) && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <Select value={selectedOrg} onValueChange={handleOrgChange}>
                <SelectTrigger className="w-48 bg-background text-foreground border border-border">
                  <SelectValue placeholder="Select Organization..." />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {mockOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 border-l border-header-foreground/20 pl-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-6 h-6 bg-primary text-primary-foreground p-1 rounded" />
              <div>
                <div className="text-sm font-medium">{currentUser.name}</div>
                <Badge className={`text-xs ${getRoleColor(currentUser.role)}`}>
                  {getRoleDisplayName(currentUser.role)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-foreground/10">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-header-foreground hover:bg-header-foreground/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0 overflow-hidden">
          {/* Main Content */}
          <main className="h-full w-full min-w-0 p-4 overflow-y-auto">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}