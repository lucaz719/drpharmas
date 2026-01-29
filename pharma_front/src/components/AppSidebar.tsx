import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Calendar,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Package,
  PieChart,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Pill,
  Shield,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Database,
  Network,
  Building,
  UserCog,
  FilePlus,
  TrendingUp,
  Search,
  Calculator,
  MapPin,
  Archive,
  Star,
  Clipboard,
  MessageSquare,
  Bell,
  FileCheck,
  Target,
  DollarSign,
  Activity
} from "lucide-react";
import { usersAPI } from "@/services/api";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarNavItem {
  title: string;
  url?: string;
  icon?: any;
  isActive?: boolean;
  items?: SidebarNavItem[];
  roles?: string[];
  permissionKey?: string; // For permission-based filtering
}

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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userRole = currentUser?.role || '';

  // Initialize open groups based on user role
  const getInitialOpenGroups = () => {
    if (userRole === 'super_admin') {
      return {
        dashboard: true,
        organizations: false,
        users: false,
        subscriptions: false,
        reports: false,
      };
    }
    return {
      dashboard: true,
      pos: false,
      inventory: false,
      suppliers: false,
      compliance: false,
      network: false,
      customers: false,
      reports: false,
      admin: false,
      expenses: false
    };
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups());
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const hasAccess = (item: SidebarNavItem): boolean => {
    // Super admin has access to everything
    if (userRole === 'super_admin') return true;

    // Check permission key first (database-based permissions)
    if (item.permissionKey) {
      return userPermissions[item.permissionKey] === true;
    }

    // Fallback to role-based permissions if no permission key
    if (item.roles && item.roles.length > 0) {
      const roleMap: Record<string, string> = {
        super_admin: "SUPER_ADMIN",
        owner: "PHARMACY_OWNER",
        manager: "BRANCH_MANAGER",
        pharmacist: "PHARMACIST",
        technician: "PHARMACY_TECHNICIAN",
        cashier: "CASHIER",
        supplier: "SUPPLIER_ADMIN",
      };
      const normalized = roleMap[userRole] || userRole?.toUpperCase?.() || "";
      return item.roles.includes(normalized) || item.roles.includes(userRole) || item.roles.includes(userRole?.toUpperCase?.());
    }

    // If no permission key or roles, allow access
    return true;
  };
  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items?: SidebarNavItem[]) => {
    if (!items) return false;
    return items.some(item => item.url && isActive(item.url));
  };

  const handleNavigation = (url?: string) => {
    if (url) {
      navigate(url);
    }
  };

  // Load user permissions from backend
  const loadUserPermissions = async () => {
    if (!currentUser?.id) return;

    try {
      setLoadingPermissions(true);
      const response = await usersAPI.getUserModulePermissions(currentUser.id);

      if (response.success && response.data) {
        // Handle nested response structure
        const modules = response.data.data?.modules || response.data.modules || [];

        if (modules.length > 0) {
          // Convert permissions to a flat object for easy checking
          const permissions: Record<string, boolean> = {};

          modules.forEach((module: ModulePermission) => {
            permissions[module.id] = module.has_access;
            if (module.sub_modules) {
              module.sub_modules.forEach((subModule: SubModulePermission) => {
                permissions[subModule.id] = subModule.has_access;
              });
            }
          });

          setUserPermissions(permissions);
        }
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      // Fallback to role-based permissions if API fails
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Load permissions on component mount
  useEffect(() => {
    if (currentUser?.id && userRole !== 'super_admin') {
      loadUserPermissions();
    }
  }, [currentUser?.id, userRole]);

  // Super Admin specific navigation
  const superAdminNavigation: SidebarNavItem[] = [
    {
      title: "Dashboard",
      url: "/superadmin/dashboard",
      icon: BarChart3,
    },
    {
      title: "Organizations",
      url: "/superadmin/organizations",
      icon: Building2,
    },
    {
      title: "Users",
      url: "/superadmin/users",
      icon: Users,
    },
    {
      title: "Subscriptions",
      url: "/superadmin/subscriptions",
      icon: CreditCard,
    },
    {
      title: "Reports",
      url: "/superadmin/reports",
      icon: PieChart,
    },
  ];

  // Regular navigation for other users
  const regularNavigation: SidebarNavItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Patients",
      icon: UserCheck,
      permissionKey: "patients",
      items: [
        { title: "Directory", url: "/patients/directory", icon: Users, permissionKey: "pat_directory" },
        { title: "Medical Records", url: "/patients/records", icon: FileText, permissionKey: "pat_records" },
        { title: "Prescriptions", url: "/patients/prescriptions", icon: Pill, permissionKey: "pat_prescriptions" },
        { title: "Purchase History", url: "/patients/history", icon: Activity, permissionKey: "pat_history" },
        { title: "Reports", url: "/patients/reports", icon: BarChart3, permissionKey: "pat_reports" },
        { title: "Settings", url: "/patients/settings", icon: Settings, permissionKey: "pat_settings" },
      ],
    },
    {
      title: "Point of Sale",
      icon: ShoppingCart,
      permissionKey: "pos",
      items: [
        { title: "Billing", url: "/pos/billing", icon: CreditCard, permissionKey: "pos_billing" },
        { title: "Reports", url: "/pos/reports", icon: BarChart3, permissionKey: "pos_reports" },
        { title: "Settings", url: "/pos/settings", icon: Settings, permissionKey: "pos_settings" },
      ],
    },

    {
      title: "Inventory",
      icon: Package,
      permissionKey: "inventory",
      items: [
        { title: "Stock Entry", url: "/inventory/stock-management", icon: Package, permissionKey: "inv_stock_mgmt" },
        { title: "Manage Orders", url: "/inventory/manage-orders", icon: FileText, permissionKey: "inv_manage_orders" },
        { title: "Purchase Orders", url: "/inventory/purchase-orders", icon: FileText, permissionKey: "inv_purchase_orders" },
        { title: "Medication List", url: "/inventory/medication-list", icon: Pill, permissionKey: "inv_medication_list" },
        { title: "Reports", url: "/inventory/reports", icon: PieChart, permissionKey: "inv_reports" },
        { title: "Settings", url: "/inventory/settings", icon: Settings, permissionKey: "inv_settings" },
      ],
    },
    {
      title: "Expenses",
      icon: Calculator,
      permissionKey: "expenses",
      items: [
        { title: "Management", url: "/expenses/tracking", icon: TrendingUp, permissionKey: "exp_tracking" },
        { title: "Categories", url: "/expenses/categories", icon: Archive, permissionKey: "exp_categories" },
        { title: "Reports", url: "/expenses/reports", icon: BarChart3, permissionKey: "exp_reports" },
        { title: "Settings", url: "/expenses/settings", icon: Settings, permissionKey: "exp_settings" },
      ],
    },
    {
      title: "Suppliers",
      icon: Truck,
      permissionKey: "suppliers",
      items: [
        { title: "Dashboard", url: "/suppliers/dashboard", icon: BarChart3, permissionKey: "sup_dashboard" },
        { title: "Supplier Management", url: "/suppliers/management", icon: UserCog, permissionKey: "sup_management" },
        { title: "Reports", url: "/suppliers/reports", icon: PieChart, permissionKey: "sup_reports" },
      ],
    },
    {
      title: "Compliance",
      icon: Shield,
      permissionKey: "compliance",
      items: [
        { title: "Dashboard", url: "/compliance/dashboard", icon: BarChart3, permissionKey: "comp_dashboard" },
        { title: "Licenses", url: "/compliance/licenses", icon: FileCheck, permissionKey: "comp_licenses" },
        { title: "DDA Reporting", url: "/compliance/dda-reporting", icon: FileText, permissionKey: "comp_dda_reporting" },
        { title: "Inspections", url: "/compliance/inspections", icon: Search, permissionKey: "comp_inspections" },
        { title: "Drug Registers", url: "/compliance/drug-registers", icon: Clipboard, permissionKey: "comp_drug_registers" },
        { title: "Tracking", url: "/compliance/tracking", icon: Target, permissionKey: "comp_tracking" },
      ],
    },

    {
      title: "Network",
      icon: Network,
      permissionKey: "network",
      items: [
        { title: "Branches", url: "/network/branches", icon: Building, permissionKey: "net_branches" },
        { title: "Users", url: "/network/users", icon: Users, permissionKey: "net_users" },
        { title: "Reports", url: "/network/reports", icon: BarChart3, permissionKey: "net_reports" },
        { title: "Settings", url: "/network/settings", icon: Settings, permissionKey: "net_settings" },
      ],
    },
    {
      title: "Customers",
      icon: Users,
      permissionKey: "customers",
      items: [
        { title: "Directory", url: "/customers/directory", icon: Users, permissionKey: "cust_directory" },
        { title: "Prescriptions", url: "/customers/prescriptions", icon: Pill, permissionKey: "cust_prescriptions" },
        { title: "Loyalty Program", url: "/customers/loyalty", icon: Star, permissionKey: "cust_loyalty" },
        { title: "Reports", url: "/customers/reports", icon: BarChart3, permissionKey: "cust_reports" },
        { title: "Settings", url: "/customers/settings", icon: Settings, permissionKey: "cust_settings" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      permissionKey: "reports",
      items: [
        { title: "Overview", url: "/reports", icon: PieChart, permissionKey: "rep_overview" },
        { title: "Sales", url: "/reports/sales", icon: DollarSign, permissionKey: "rep_sales" },
        { title: "Inventory", url: "/reports/inventory", icon: Package, permissionKey: "rep_inventory" },
        { title: "Financial", url: "/reports/financial", icon: Calculator, permissionKey: "rep_financial" },
        { title: "Compliance", url: "/reports/compliance", icon: Shield, permissionKey: "rep_compliance" },
        { title: "Custom Reports", url: "/reports/custom", icon: FilePlus, permissionKey: "rep_custom" },
      ],
    },
  ];

  // Choose navigation based on user role
  const navigationItems = userRole === 'super_admin' ? superAdminNavigation : regularNavigation;

  // For super admin, show all items without filtering
  // For other users, filter based on permissions and roles
  const filteredNavItems = userRole === 'super_admin'
    ? navigationItems
    : navigationItems.filter(item => hasAccess(item));

  return (
    <Sidebar className={`bg-white border-r border-slate-200`} collapsible="icon">
      <SidebarContent className="bg-white">
        {/* Header */}
        <div className="p-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <Heart className="w-3 h-3 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-foreground">drpharmas</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isItemActive = item.url ? isActive(item.url) : isGroupActive(item.items);
                const hasSubItems = item.items && item.items.length > 0;
                const groupKey = item.title.toLowerCase().replace(' ', '');

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.url)}
                        className={`${isItemActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"} cursor-pointer`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {!collapsed && <span className="text-xs">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    open={openGroups[groupKey]}
                    onOpenChange={() => toggleGroup(groupKey)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`${isItemActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"} cursor-pointer`}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {!collapsed && (
                            <>
                              <span className="text-xs flex-1 text-left">{item.title}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${openGroups[groupKey] ? "rotate-90" : ""}`} />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {!collapsed && (
                        <CollapsibleContent className="transition-all duration-200">
                          <SidebarMenuSub>
                            {item.items?.filter(subItem => hasAccess(subItem)).map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  onClick={() => handleNavigation(subItem.url)}
                                  className={`${subItem.url && isActive(subItem.url) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"} cursor-pointer`}
                                >
                                  {subItem.icon && <subItem.icon className="w-3 h-3" />}
                                  <span className="text-xs">{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}