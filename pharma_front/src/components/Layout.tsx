import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { 
  Home, Package, ShoppingCart, Users, BarChart3, 
  Settings, RotateCcw, AlertTriangle,
  CreditCard, DollarSign, FileText, Building2, Shield, Network,
  ChevronDown, ChevronRight, UserCheck, Receipt, Warehouse,
  TrendingUp, Clipboard, Scale, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";

const getModulesByRole = (role: string) => {
  const allModules = {
    // POS Module
    pos: {
      name: "POS",
      icon: ShoppingCart,
      subModules: [
        { name: "Billing", href: "/pos/billing", icon: Receipt },
        { name: "Quick Sale", href: "/pos/quick-sale", icon: CreditCard },
        { name: "Reports", href: "/pos/reports", icon: BarChart3 },
        { name: "Settings", href: "/pos/settings", icon: Settings },
      ]
    },

    // Inventory Module
    inventory: {
      name: "Inventory",
      icon: Package,
      subModules: [
        { name: "Stock Management", href: "/inventory/stock", icon: Warehouse },
        { name: "Expiry Tracking", href: "/inventory/expiry", icon: AlertTriangle },
        { name: "Purchase Orders", href: "/inventory/purchase", icon: ShoppingCart },
        { name: "Stock Transfer", href: "/inventory/transfer", icon: Package },
        { name: "Reports", href: "/inventory/reports", icon: BarChart3 },
        { name: "Settings", href: "/inventory/settings", icon: Settings },
      ]
    },

    // Expenses Module
    expenses: {
      name: "Expenses",
      icon: DollarSign,
      subModules: [
        { name: "Expense Tracking", href: "/expenses/tracking", icon: Receipt },
        { name: "Categories", href: "/expenses/categories", icon: FileText },
        { name: "Approval Workflow", href: "/expenses/approval", icon: UserCheck },
        { name: "Reports", href: "/expenses/reports", icon: BarChart3 },
        { name: "Settings", href: "/expenses/settings", icon: Settings },
      ]
    },

    // Supplier Module
    supplier: {
      name: "Suppliers",
      icon: Building2,
      subModules: [
        { name: "Supplier Directory", href: "/suppliers/directory", icon: Users },
        { name: "Orders Management", href: "/suppliers/orders", icon: ShoppingCart },
        { name: "Communications", href: "/suppliers/communications", icon: FileText },
        { name: "Performance", href: "/suppliers/performance", icon: TrendingUp },
        { name: "Reports", href: "/suppliers/reports", icon: BarChart3 },
        { name: "Settings", href: "/suppliers/settings", icon: Settings },
      ]
    },

    // Nepal Compliance Module
    compliance: {
      name: "Compliance",
      icon: Shield,
      subModules: [
        { name: "License Management", href: "/compliance/license", icon: Clipboard },
        { name: "DDA Reporting", href: "/compliance/dda", icon: FileText },
        { name: "Inspection Records", href: "/compliance/inspection", icon: Scale },
        { name: "Drug Register", href: "/compliance/register", icon: Package },
        { name: "Reports", href: "/compliance/reports", icon: BarChart3 },
        { name: "Settings", href: "/compliance/settings", icon: Settings },
      ]
    },

    // Network Module
    network: {
      name: "Network",
      icon: Network,
      subModules: [
        { name: "Branch Management", href: "/network/branches", icon: Building2 },
        { name: "User Management", href: "/network/users", icon: Users },
        { name: "Access Control", href: "/network/access", icon: UserCheck },
        { name: "Data Sync", href: "/network/sync", icon: Network },
        { name: "Reports", href: "/network/reports", icon: BarChart3 },
        { name: "Settings", href: "/network/settings", icon: Settings },
      ]
    },

    // Additional Modules
    customers: {
      name: "Customers",
      icon: Users,
      subModules: [
        { name: "Customer Directory", href: "/customers/directory", icon: Users },
        { name: "Prescriptions", href: "/customers/prescriptions", icon: FileText },
        { name: "Loyalty Program", href: "/customers/loyalty", icon: Users },
        { name: "Reports", href: "/customers/reports", icon: BarChart3 },
        { name: "Settings", href: "/customers/settings", icon: Settings },
      ]
    },

    reports: {
      name: "Reports & Analytics",
      icon: BarChart3,
      subModules: [
        { name: "Sales Reports", href: "/reports/sales", icon: TrendingUp },
        { name: "Inventory Reports", href: "/reports/inventory", icon: Package },
        { name: "Financial Reports", href: "/reports/financial", icon: DollarSign },
        { name: "Compliance Reports", href: "/reports/compliance", icon: Shield },
        { name: "Custom Reports", href: "/reports/custom", icon: BarChart3 },
      ]
    },

    dashboard: { name: "Dashboard", href: "/", icon: Home, subModules: [] as any[] }
  };

  const roleModules = {
    PHARMACY_OWNER: [
      allModules.dashboard,
      allModules.pos,
      allModules.inventory,
      allModules.expenses,
      allModules.supplier,
      allModules.customers,
      allModules.compliance,
      allModules.network,
      allModules.reports,
    ],
    PHARMACY_MANAGER: [
      allModules.dashboard,
      allModules.pos,
      allModules.inventory,
      allModules.expenses,
      allModules.supplier,
      allModules.customers,
      allModules.compliance,
      allModules.reports,
    ],
    SENIOR_PHARMACIST: [
      allModules.dashboard,
      allModules.pos,
      allModules.inventory,
      allModules.customers,
      allModules.compliance,
      allModules.reports,
    ],
    PHARMACY_TECHNICIAN: [
      allModules.dashboard,
      allModules.inventory,
      allModules.customers,
    ],
    CASHIER: [
      allModules.dashboard,
      allModules.pos,
      allModules.customers,
    ],
    SUPPLIER_ADMIN: [
      allModules.dashboard,
      allModules.supplier,
      allModules.inventory,
      allModules.customers,
      allModules.reports,
    ],
    SALES_MANAGER: [
      allModules.dashboard,
      allModules.supplier,
      allModules.customers,
      allModules.reports,
    ],
    ACCOUNT_REPRESENTATIVE: [
      allModules.dashboard,
      allModules.customers,
      allModules.reports,
    ],
    DELIVERY_COORDINATOR: [
      allModules.dashboard,
      allModules.supplier,
      allModules.customers,
    ],
  };

  return roleModules[role as keyof typeof roleModules] || [];
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userEmail");
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-card border-r border-border transition-all duration-300 overflow-y-auto ${
          sidebarOpen ? "w-64" : "w-16"
        }`}>
          <nav className="p-4 space-y-2">
            {getModulesByRole(currentUser?.role || '').map((module) => {
              const ModuleIcon = module.icon;
              const moduleId = module.name.toLowerCase().replace(/\s+/g, '-');
              const isExpanded = expandedModules.includes(moduleId);
              const hasSubModules = module.subModules && module.subModules.length > 0;
              const isModuleActive = hasSubModules 
                ? module.subModules.some(sub => location.pathname === sub.href)
                : location.pathname === (module as any).href;

              const toggleModule = () => {
                if (hasSubModules && sidebarOpen) {
                  setExpandedModules(prev => 
                    isExpanded 
                      ? prev.filter(id => id !== moduleId)
                      : [...prev, moduleId]
                  );
                }
              };

              return (
                <div key={module.name} className="space-y-1">
                  {hasSubModules ? (
                    <button
                      onClick={toggleModule}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isModuleActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <ModuleIcon size={18} />
                        {sidebarOpen && <span>{module.name}</span>}
                      </div>
                      {sidebarOpen && (
                        isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>
                  ) : (
                    <Link
                      to={(module as any).href || '/'}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === (module as any).href 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <ModuleIcon size={18} />
                      {sidebarOpen && <span>{module.name}</span>}
                    </Link>
                  )}

                  {/* Sub-modules */}
                  {hasSubModules && isExpanded && sidebarOpen && (
                    <div className="ml-6 space-y-1">
                      {module.subModules.map((subModule) => {
                        const SubIcon = subModule.icon;
                        const isSubActive = location.pathname === subModule.href;

                        return (
                          <Link
                            key={subModule.name}
                            to={subModule.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                              isSubActive 
                                ? "bg-primary/10 text-primary border-l-2 border-primary" 
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            <SubIcon size={14} />
                            <span>{subModule.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-screen overflow-hidden">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}