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
import { Input } from "@/components/ui/input";
import {
  Building2, LogOut, Settings, Bell, Search,
  Shield, User as UserIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { 
  type User, 
  getUserById, 
  getOrganizationById, 
  getBranchById,
  mockOrganizations,
  getRoleDisplayName 
} from "@/data/mockData";
import { RoleBasedDashboard } from "./RoleBasedDashboard";

export default function LayoutFixed() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Initialize session timeout (30 minutes with 5 minute warning)
  useSessionTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
  });
  
  // Initialize automatic token refresh (every 15 minutes)
  useTokenRefresh({
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    enabled: true
  });

  // Search functionality
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pos/search/?q=${encodeURIComponent(searchQuery)}`;
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

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
      
      // Fetch user permissions
      fetchUserPermissions(user.id);
    }
    // AuthGuard will handle redirecting to login if no user
  }, []);

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/users/${userId}/module-permissions/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
    }
  };

  const hasPOSSettingsPermission = () => {
    if (!userPermissions) return false;
    const posModule = userPermissions.modules?.find(m => m.id === 'pos');
    if (!posModule || !posModule.has_access) return false;
    const settingsSubModule = posModule.sub_modules?.find(sm => sm.id === 'pos_settings');
    return settingsSubModule?.has_access || false;
  };

  const handleLogout = () => {
    // Clear authentication data but preserve remembered credentials
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("selectedOrganization");
    // Keep rememberedEmail and rememberedPassword for next login
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/login", { replace: true });
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrg(orgId);
    localStorage.setItem("selectedOrganization", orgId);
    
    toast({
      title: "Organization Changed",
      description: `Switched to ${getOrganizationById(orgId)?.name}`,
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-warning text-warning-foreground',
      'owner': 'bg-primary text-primary-foreground',
      'manager': 'bg-secondary text-secondary-foreground',
      'pharmacist': 'bg-accent text-accent-foreground',
      'technician': 'bg-muted text-muted-foreground',
      'cashier': 'bg-muted text-muted-foreground',
      'supplier': 'bg-destructive text-destructive-foreground'
    };
    return colors[role as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-50 to-indigo-100/80 backdrop-blur-sm border-b border-blue-200 z-50 flex items-center px-4">
        <div className="flex items-center gap-3 ml-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center overflow-hidden">
            <img
              src="/drpharmaslogo.png"
              alt="DrPharmas Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold">drpharmas</h1>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Organization Selector */}
          {(currentUser.role === 'super_admin' || 
            (currentUser.role === 'owner' && mockOrganizations.length > 1)) && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <Select value={selectedOrg} onValueChange={handleOrgChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Organization..." />
                </SelectTrigger>
                <SelectContent>
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
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div 
                      key={`${result.type}-${result.id || index}`}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        if (result.url) {
                          navigate(result.url);
                          setSearchQuery('');
                          setSearchResults([]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{result.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{result.description}</div>
                        </div>
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{result.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>



          {/* User Menu */}
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-6 h-6 bg-primary text-primary-foreground p-1 rounded" />
              <div>
                <div className="text-sm font-medium">
                  {currentUser.first_name && currentUser.last_name
                    ? `${currentUser.first_name} ${currentUser.last_name}`
                    : currentUser.name || 'User'}
                </div>
                <Badge className={`text-xs ${getRoleColor(currentUser.role)}`}>
                  {getRoleDisplayName(currentUser.role)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {hasPOSSettingsPermission() && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/pos/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16 min-h-screen">
        <SidebarProvider>
          {/* Sidebar Trigger in header area */}
          <div className="fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-white/80 hover:bg-white border border-slate-200 shadow-sm" />
          </div>

          {/* Fixed Sidebar */}
          <AppSidebar />
          
          {/* Main Content Area */}
          <SidebarInset className="flex-1 min-w-0">
            <main className="p-6 w-full">
              <div 
                key={location.pathname}
                className="animate-in slide-in-from-top-4 fade-in duration-700 ease-out"
              >
                {location.pathname === "/" ? (
                  <RoleBasedDashboard user={currentUser} />
                ) : (
                  <Outlet />
                )}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}