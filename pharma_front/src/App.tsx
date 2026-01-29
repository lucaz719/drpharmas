import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppInitializer } from "./components/AppInitializer";
import { AuthGuard } from "./components/AuthGuard";
import { NotificationProvider } from "./contexts/NotificationContext";
import LayoutFixed from "./components/LayoutFixed";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import LoginModern from "./pages/LoginModern";
import NotFound from "./pages/NotFound";

// POS Module Pages
import POSBilling from "./pages/pos/Billing";
import QuickSale from "./pages/pos/QuickSale";
import POSReports from "./pages/pos/Reports";
import POSSettings from "./pages/pos/Settings";

// Inventory Module Pages
import StockManagement from "./pages/inventory/StockManagement";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import ManageOrders from "./pages/inventory/ManageOrders";
import PurchaseOrders from "./pages/inventory/PurchaseOrders";
import StockTransfers from "./pages/inventory/StockTransfers";
import MedicationList from "./pages/inventory/MedicationList";
import SuppliersDashboard from "./pages/suppliers/SuppliersDashboard";
import SuppliersDirectory from "./pages/suppliers/SuppliersDirectory";
import SupplierCommunications from "./pages/suppliers/SupplierCommunications";
import SupplierPerformance from "./pages/suppliers/SupplierPerformance";
import ComplianceDashboard from "./pages/compliance/ComplianceDashboard";
import LicenseManagement from "./pages/compliance/LicenseManagement";
import DDAReporting from "./pages/compliance/DDAReporting";
import InspectionRecords from "./pages/compliance/InspectionRecords";
import DrugRegisters from "./pages/compliance/DrugRegisters";

// Expenses Module Pages
import ExpenseTracking from "./pages/expenses/ExpenseTracking";

// Network Module Pages
import UserManagement from "./pages/network/UserManagement";
import BranchManagement from "./pages/network/BranchManagement";

import NetworkReports from "./pages/network/NetworkReports";

// Patient Module Pages
import PatientDirectory from "./pages/patients/PatientDirectory";
import PatientDetail from "./pages/patients/PatientDetail";
import MedicalRecords from "./pages/patients/MedicalRecords";
import PatientPrescriptions from "./pages/patients/PatientPrescriptions";
import PurchaseHistory from "./pages/patients/PurchaseHistory";
import PatientReports from "./pages/patients/PatientReports";
import PatientSettings from "./pages/patients/PatientSettings";

// Customer Module Pages
import CustomerDirectory from "./pages/customers/CustomerDirectory";
import CustomerDetail from "./pages/customers/CustomerDetail";
import CustomerPrescriptions from "./pages/customers/CustomerPrescriptions";
import LoyaltyProgram from "./pages/customers/LoyaltyProgram";

// Reports Module Pages
import SalesReports from "./pages/reports/SalesReports";
import InventoryReports from "./pages/reports/InventoryReports";
import FinancialReports from "./pages/reports/FinancialReports";
import ComplianceReports from "./pages/reports/ComplianceReports";
import CustomReports from "./pages/reports/CustomReports";

// Admin Module Pages
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import OrganizationManagementPage from "./pages/admin/OrganizationManagementPage";
import OrganizationDetailPage from "./pages/admin/OrganizationDetailPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import SubscriptionManagementPage from "./pages/admin/SubscriptionManagementPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import BranchManagementPage from "./pages/admin/BranchManagementPage";

// Staff Management Module
import StaffDashboard from "./pages/staff/StaffDashboard";

// Additional Imports for Missing Components
import InventorySettings from "./pages/inventory/Settings";
import ExpenseCategories from "./pages/expenses/Categories";
import ExpenseReports from "./pages/expenses/Reports";
import ExpenseSettings from "./pages/expenses/Settings";
import SupplierOrders from "./pages/suppliers/Orders";
import SupplierReports from "./pages/suppliers/SupplierReports";
import SupplierManagement from "./pages/suppliers/SupplierManagement";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import MedicineDetail from "./pages/inventory/MedicineDetail";
import BillDetail from "./pages/pos/BillDetail";
import SupplierSettings from "./pages/suppliers/Settings";
import ComplianceTracking from "./pages/compliance/Tracking";
import NetworkSettings from "./pages/network/Settings";
import CustomerReports from "./pages/customers/Reports";
import CustomerSettings from "./pages/customers/Settings";
import VendorPortal from "./pages/VendorPortal";
import DocumentManagement from "./pages/DocumentManagement";
import AuditManagement from "./pages/AuditManagement";
import Returns from "./pages/Returns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <NotificationProvider>
        <AppInitializer>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <Routes>
                  <Route path="/login" element={<LoginModern />} />
                  <Route path="/" element={<LayoutFixed />}>
            <Route index element={<Dashboard />} />
            
            {/* POS Module Routes */}
            <Route path="pos/billing" element={<POSBilling />} />
            <Route path="pos/bill/:billNumber" element={<BillDetail />} />
            <Route path="pos/stock-transfers" element={<StockTransfers />} />
            <Route path="pos/reports" element={<POSReports />} />
            <Route path="pos/settings" element={<POSSettings />} />

            {/* Inventory Module Routes */}
            <Route path="inventory" element={<InventoryDashboard />} />
            <Route path="inventory/dashboard" element={<InventoryDashboard />} />
            <Route path="inventory/stock-management" element={<StockManagement />} />
            <Route path="inventory/manage-orders" element={<ManageOrders />} />
            <Route path="inventory/purchase-orders" element={<PurchaseOrders />} />
            <Route path="inventory/stock-transfers" element={<StockTransfers />} />
            <Route path="inventory/medication-list" element={<MedicationList />} />
            <Route path="inventory/medicine/:id" element={<MedicineDetail />} />
            <Route path="inventory/reports" element={<InventoryReports />} />
            <Route path="inventory/settings" element={<InventorySettings />} />

            {/* Expenses Module Routes */}
            <Route path="expenses/tracking" element={<ExpenseTracking />} />
            <Route path="expenses/categories" element={<ExpenseCategories />} />
            <Route path="expenses/reports" element={<ExpenseReports />} />
            <Route path="expenses/settings" element={<ExpenseSettings />} />

            {/* Suppliers Module Routes */}
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="suppliers/dashboard" element={<SuppliersDashboard />} />
            <Route path="suppliers/management" element={<SupplierManagement />} />
            <Route path="suppliers/detail/:id" element={<SupplierDetail />} />
            <Route path="suppliers/reports" element={<SupplierReports />} />
            <Route path="suppliers/directory" element={<SuppliersDirectory />} />
            <Route path="suppliers/orders" element={<SupplierOrders />} />
            <Route path="suppliers/communications" element={<SupplierCommunications />} />
            <Route path="suppliers/performance" element={<SupplierPerformance />} />
            <Route path="suppliers/settings" element={<SupplierSettings />} />

            {/* Compliance Module Routes */}
            <Route path="compliance/dashboard" element={<ComplianceDashboard />} />
            <Route path="compliance/licenses" element={<LicenseManagement />} />
            <Route path="compliance/dda-reporting" element={<DDAReporting />} />
            <Route path="compliance/inspections" element={<InspectionRecords />} />
            <Route path="compliance/drug-registers" element={<DrugRegisters />} />
            <Route path="compliance/tracking" element={<ComplianceTracking />} />

            {/* Network Module Routes */}
            <Route path="network/branches" element={<BranchManagement />} />
            <Route path="network/users" element={<UserManagement />} />

            <Route path="network/reports" element={<NetworkReports />} />
            <Route path="network/settings" element={<NetworkSettings />} />

            {/* Patients Module Routes */}
            <Route path="patients" element={<PatientDirectory />} />
            <Route path="patients/directory" element={<PatientDirectory />} />
            <Route path="patients/detail/:id" element={<PatientDetail />} />
            <Route path="patients/records" element={<MedicalRecords />} />
            <Route path="patients/prescriptions" element={<PatientPrescriptions />} />
            <Route path="patients/history" element={<PurchaseHistory />} />
            <Route path="patients/reports" element={<PatientReports />} />
            <Route path="patients/settings" element={<PatientSettings />} />

            {/* Customers Module Routes */}
            <Route path="customers" element={<CustomerDirectory />} />
            <Route path="customers/directory" element={<CustomerDirectory />} />
            <Route path="customers/detail/:id" element={<CustomerDetail />} />
            <Route path="customers/prescriptions" element={<CustomerPrescriptions />} />
            <Route path="customers/loyalty" element={<LoyaltyProgram />} />
            <Route path="customers/reports" element={<CustomerReports />} />
            <Route path="customers/settings" element={<CustomerSettings />} />

            {/* Reports Module Routes */}
            <Route path="reports/sales" element={<SalesReports />} />
            <Route path="reports/inventory" element={<InventoryReports />} />
            <Route path="reports/financial" element={<FinancialReports />} />
            <Route path="reports/compliance" element={<ComplianceReports />} />
            <Route path="reports/custom" element={<CustomReports />} />
            
            {/* Advanced Modules */}
            <Route path="vendor-portal" element={<VendorPortal />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="audit" element={<AuditManagement />} />
            <Route path="staff/dashboard" element={<StaffDashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="returns" element={<Returns />} />
            
            {/* Admin Routes for Super Admin */}
            <Route path="superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="superadmin/organizations" element={<OrganizationManagementPage />} />
            <Route path="superadmin/organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="superadmin/users" element={<UserManagementPage />} />
            <Route path="superadmin/subscriptions" element={<SubscriptionManagementPage />} />
            <Route path="superadmin/reports" element={<AdminReportsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthGuard>
            </BrowserRouter>
          </TooltipProvider>
        </AppInitializer>
      </NotificationProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
