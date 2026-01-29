import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Building2, Users, Package, DollarSign,
  BarChart3, FileText, Settings, Truck, Pill,
  ShoppingCart, Heart, Hospital, UserCog,
  Network, Clipboard, TrendingUp, Calculator,
  UserCheck, Layers, Globe, Database, ChevronRight
} from "lucide-react";
import { type User, type Organization, type Branch, getRoleDisplayName } from "@/data/mockData";

interface AppSidebarProps {
  user: User;
  organization?: Organization;
  branch?: Branch;
}

export function AppSidebar({ user, organization, branch }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>(['main']);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium border-l-2 border-primary" : "hover:bg-accent/50 text-foreground";

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Define navigation items based on user role with enhanced reporting
  const getNavigationItems = () => {
    // Super Admin Navigation - System-wide control
    if (user.role === 'super_admin') {
      return [
        {
          id: 'system',
          title: "System Management",
          icon: Shield,
          items: [
            { title: "Dashboard", href: "/superadmin/dashboard", icon: BarChart3 },
            { title: "Organizations", href: "/superadmin/organizations", icon: Building2 },
            { title: "System Users", href: "/superadmin/users", icon: Users },
            { title: "Subscriptions", href: "/superadmin/subscriptions", icon: DollarSign },
            { title: "System Health", href: "/superadmin/health", icon: Database },
          ]
        },
        {
          id: 'reports',
          title: "Centralized Reports",
          icon: TrendingUp,
          items: [
            { title: "Global Analytics", href: "/superadmin/reports/global", icon: BarChart3 },
            { title: "Cross-Org Reports", href: "/superadmin/reports/cross-org", icon: FileText },
            { title: "Revenue Analytics", href: "/superadmin/reports/revenue", icon: DollarSign },
            { title: "Performance Metrics", href: "/superadmin/reports/performance", icon: TrendingUp },
            { title: "Compliance Status", href: "/superadmin/reports/compliance", icon: Clipboard },
          ]
        },
        {
          id: 'config',
          title: "Configuration",
          icon: Settings,
          items: [
            { title: "System Settings", href: "/superadmin/settings", icon: Settings },
            { title: "Integrations", href: "/superadmin/integrations", icon: Globe },
            { title: "Backup & Security", href: "/superadmin/backup", icon: Database },
          ]
        }
      ];
    }

    // Pharmacy Owner Navigation - Full pharmacy chain control
    if (user.role === 'owner') {
      return [
        {
          id: 'organization',
          title: "Organization Control",
          icon: Building2,
          items: [
            { title: "Dashboard", href: "/", icon: BarChart3 },
            { title: "Branch Management", href: "/network/branches", icon: Building2 },
            { title: "User Management", href: "/network/users", icon: Users },
            { title: "Organization Settings", href: "/organization/settings", icon: Settings },
          ]
        },
        {
          id: 'operations',
          title: "Multi-Branch Operations",
          icon: Layers,
          items: [
            { title: "Inventory Overview", href: "/inventory/multi-branch", icon: Package },
            { title: "Supplier Network", href: "/suppliers/dashboard", icon: Truck },
            { title: "Compliance Central", href: "/compliance/dashboard", icon: Clipboard },
            { title: "Customer Analytics", href: "/customers/analytics", icon: UserCheck },
          ]
        },
        {
          id: 'reports',
          title: "Centralized Reports",
          icon: TrendingUp,
          items: [
            { title: "Multi-Branch Analytics", href: "/reports/multi-branch", icon: BarChart3 },
            { title: "Financial Consolidation", href: "/reports/financial", icon: Calculator },
            { title: "Performance Comparison", href: "/reports/branch-comparison", icon: TrendingUp },
            { title: "Compliance Reports", href: "/reports/compliance", icon: Clipboard },
            { title: "Custom Reports", href: "/reports/custom", icon: FileText },
          ]
        }
      ];
    }

    // Branch Manager Navigation - Specific branch control
    if (user.role === 'manager') {
      return [
        {
          id: 'branch',
          title: "Branch Operations",
          icon: Building2,
          items: [
            { title: "Dashboard", href: "/", icon: BarChart3 },
            { title: "Point of Sale", href: "/pos/billing", icon: ShoppingCart },
            { title: "Branch Inventory", href: "/inventory/dashboard", icon: Package },
            { title: "Staff Management", href: "/branch/staff", icon: Users },
          ]
        },
        {
          id: 'management',
          title: "Daily Management",
          icon: UserCog,
          items: [
            { title: "Prescriptions", href: "/prescriptions", icon: Pill },
            { title: "Customer Service", href: "/customers/directory", icon: UserCheck },
            { title: "Supplier Orders", href: "/suppliers/branch-orders", icon: Truck },
            { title: "Expense Tracking", href: "/expenses/tracking", icon: Calculator },
          ]
        },
        {
          id: 'reports',
          title: "Branch Reports",
          icon: FileText,
          items: [
            { title: "Branch Analytics", href: "/reports/branch", icon: BarChart3 },
            { title: "Sales Reports", href: "/reports/sales", icon: DollarSign },
            { title: "Inventory Reports", href: "/reports/inventory", icon: Package },
            { title: "Staff Performance", href: "/reports/staff", icon: Users },
            { title: "Daily Summary", href: "/reports/daily", icon: FileText },
          ]
        },
        {
          id: 'compliance',
          title: "Branch Compliance",
          icon: Clipboard,
          items: [
            { title: "Drug Registers", href: "/compliance/drug-registers", icon: Pill },
            { title: "Inspections", href: "/compliance/inspections", icon: Clipboard },
            { title: "License Status", href: "/compliance/licenses", icon: FileText },
          ]
        }
      ];
    }

    // Senior Pharmacist Navigation
    if (user.role === 'pharmacist') {
      return [
        {
          id: 'pharmacy',
          title: "Pharmacy Operations",
          icon: Pill,
          items: [
            { title: "Dashboard", href: "/", icon: BarChart3 },
            { title: "Prescription Processing", href: "/prescriptions", icon: Pill },
            { title: "Drug Information", href: "/pharmacy/drug-info", icon: Pill },
            { title: "Patient Counseling", href: "/pharmacy/counseling", icon: UserCheck },
          ]
        },
        {
          id: 'inventory',
          title: "Inventory Control",
          icon: Package,
          items: [
            { title: "Stock Management", href: "/inventory/stock-management", icon: Package },
            { title: "Expiry Tracking", href: "/inventory/expiry-tracking", icon: Package },
            { title: "Drug Orders", href: "/inventory/drug-orders", icon: ShoppingCart },
          ]
        },
        {
          id: 'reports',
          title: "Pharmacy Reports",
          icon: FileText,
          items: [
            { title: "My Performance", href: "/reports/personal", icon: BarChart3 },
            { title: "Prescription Analytics", href: "/reports/prescriptions", icon: Pill },
            { title: "Drug Usage", href: "/reports/drug-usage", icon: Package },
          ]
        }
      ];
    }

    // Staff Navigation (Pharmacist, Technician, Cashier)
    if (['PHARMACIST', 'PHARMACY_TECHNICIAN', 'CASHIER'].includes(user.role)) {
      const staffItems = [
        {
          id: 'daily',
          title: "Daily Tasks",
          icon: ShoppingCart,
          items: [
            { title: "Dashboard", href: "/", icon: BarChart3 },
            { title: "Point of Sale", href: "/pos/billing", icon: ShoppingCart },
            { title: "Quick Sale", href: "/pos/quick-sale", icon: DollarSign },
          ]
        }
      ];

      if (user.permissions.includes('prescriptions')) {
        staffItems.push({
          id: 'prescriptions',
          title: "Prescriptions",
          icon: Pill,
          items: [
            { title: "Process Prescriptions", href: "/prescriptions", icon: Pill },
            { title: "Customer Records", href: "/customers/directory", icon: UserCheck },
          ]
        });
      }

      if (user.permissions.includes('inventory')) {
        staffItems.push({
          id: 'inventory',
          title: "Inventory Tasks",
          icon: Package,
          items: [
            { title: "Stock Check", href: "/inventory/stock-check", icon: Package },
            { title: "Expiry Check", href: "/inventory/expiry-tracking", icon: Package },
          ]
        });
      }

      staffItems.push({
        id: 'reports',
        title: "My Reports",
        icon: FileText,
        items: [
          { title: "My Performance", href: "/reports/personal", icon: BarChart3 },
          { title: "Sales Summary", href: "/reports/my-sales", icon: DollarSign },
        ]
      });

      return staffItems;
    }

    // Supplier Navigation
    if (['SUPPLIER_ADMIN', 'SALES_REPRESENTATIVE'].includes(user.role)) {
      return [
        {
          id: 'supplier',
          title: "Supplier Operations",
          icon: Truck,
          items: [
            { title: "Dashboard", href: "/", icon: BarChart3 },
            { title: "Product Catalog", href: "/supplier/catalog", icon: Package },
            { title: "Order Management", href: "/supplier/orders", icon: ShoppingCart },
            { title: "Client Network", href: "/supplier/clients", icon: Building2 },
          ]
        },
        {
          id: 'sales',
          title: "Sales & Analytics",
          icon: TrendingUp,
          items: [
            { title: "Sales Dashboard", href: "/supplier/sales", icon: DollarSign },
            { title: "Territory Reports", href: "/supplier/territory", icon: BarChart3 },
            { title: "Performance Metrics", href: "/supplier/performance", icon: TrendingUp },
            { title: "Delivery Tracking", href: "/supplier/delivery", icon: Truck },
          ]
        }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} bg-card border-r border-border`}
    >
      <SidebarTrigger
        className="m-2 self-end text-foreground hover:bg-accent"
        onClick={() => setCollapsed(!collapsed)}
      />

      <SidebarHeader className="border-b border-border p-4 bg-card">
        <div className="flex items-center gap-3">
          <Heart className={`text-primary ${collapsed ? 'w-6 h-6' : 'w-8 h-8'}`} />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">MediPro</h2>
              <p className="text-sm text-muted-foreground">
                {organization?.name || 'System'}
              </p>
            </div>
          )}
        </div>

        {branch && !collapsed && (
          <div className="mt-2 p-2 bg-muted border border-border">
            <div className="text-sm font-medium text-foreground">{branch.name}</div>
            <div className="text-xs text-muted-foreground">{branch.type} branch</div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2 bg-card">
        {navigationItems.map((section) => {
          const isGroupOpen = openGroups.includes(section.id);
          const hasActiveItem = section.items.some(item => isActive(item.href));

          return (
            <SidebarGroup key={section.id}>
              <SidebarGroupLabel
                className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground px-2 py-1"
                onClick={() => toggleGroup(section.id)}
              >
                <section.icon className="w-4 h-4" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{section.title}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isGroupOpen ? 'rotate-90' : ''}`} />
                  </>
                )}
              </SidebarGroupLabel>

              {(isGroupOpen || hasActiveItem) && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.href}
                            end
                            className={getNavCls}
                          >
                            <item.icon className={collapsed ? "w-4 h-4" : "w-4 h-4 mr-3"} />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-card">
        <div className="flex items-center gap-3">
          <div className={`bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm border ${collapsed ? 'w-6 h-6' : 'w-8 h-8'}`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-card-foreground">{user.name}</div>
              <Badge variant="outline" className="text-xs">
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          )}
        </div>

        {user.collectionAmount && !collapsed && (
          <div className="mt-2 p-2 bg-muted border border-border">
            <div className="text-xs text-muted-foreground">Monthly Collection</div>
            <div className="text-sm font-semibold text-success">
              ₹{user.collectionAmount.toLocaleString()}
            </div>
            {user.targets && (
              <div className="text-xs text-muted-foreground">
                Target: ₹{user.targets.monthly.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}