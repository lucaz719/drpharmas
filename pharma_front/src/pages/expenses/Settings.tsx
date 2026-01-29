import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, DollarSign, Users, CheckCircle, 
  Save, Bell, Calendar, CreditCard
} from "lucide-react";

export default function ExpenseSettings() {
  const [settings, setSettings] = useState({
    // Approval Settings
    requireApproval: true,
    approvalThreshold: 500,
    autoApproveBelow: 100,
    requireReceipts: true,
    
    // Budget Settings
    enableBudgetLimits: true,
    budgetWarningPercent: 80,
    budgetLimitPercent: 100,
    monthlyBudgetReset: true,
    
    // Notification Settings
    approvalNotifications: true,
    budgetAlerts: true,
    expiryReminders: true,
    weeklyReports: false,
    
    // Expense Policies
    mileageRate: 0.65,
    perDiemRate: 75,
    maxMealAmount: 50,
    receiptRetentionDays: 365,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Settings</h2>
          <p className="text-muted-foreground">Configure expense management policies and limits</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Save size={16} className="mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Workflow */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <CheckCircle className="mr-2 text-primary" size={20} />
              Approval Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require Approval</p>
                <p className="text-xs text-muted-foreground">All expenses need manager approval</p>
              </div>
              <Switch 
                checked={settings.requireApproval}
                onCheckedChange={() => handleToggle("requireApproval")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Approval Threshold ($)</label>
              <Input 
                type="number"
                value={settings.approvalThreshold}
                onChange={(e) => handleInputChange("approvalThreshold", parseFloat(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Expenses above this amount require approval</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Auto-approve Below ($)</label>
              <Input 
                type="number"
                value={settings.autoApproveBelow}
                onChange={(e) => handleInputChange("autoApproveBelow", parseFloat(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Automatically approve small expenses</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require Receipts</p>
                <p className="text-xs text-muted-foreground">Mandatory receipt upload for all expenses</p>
              </div>
              <Switch 
                checked={settings.requireReceipts}
                onCheckedChange={() => handleToggle("requireReceipts")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Management */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <DollarSign className="mr-2 text-success" size={20} />
              Budget Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Budget Limits</p>
                <p className="text-xs text-muted-foreground">Enforce category budget limits</p>
              </div>
              <Switch 
                checked={settings.enableBudgetLimits}
                onCheckedChange={() => handleToggle("enableBudgetLimits")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Budget Warning (%)</label>
              <Input 
                type="number"
                value={settings.budgetWarningPercent}
                onChange={(e) => handleInputChange("budgetWarningPercent", parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Warn when reaching this percentage of budget</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Budget Limit (%)</label>
              <Input 
                type="number"
                value={settings.budgetLimitPercent}
                onChange={(e) => handleInputChange("budgetLimitPercent", parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Block expenses when exceeding this percentage</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Monthly Budget Reset</p>
                <p className="text-xs text-muted-foreground">Reset budget limits every month</p>
              </div>
              <Switch 
                checked={settings.monthlyBudgetReset}
                onCheckedChange={() => handleToggle("monthlyBudgetReset")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Bell className="mr-2 text-warning" size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Approval Notifications</p>
                <p className="text-xs text-muted-foreground">Notify when expenses need approval</p>
              </div>
              <Switch 
                checked={settings.approvalNotifications}
                onCheckedChange={() => handleToggle("approvalNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Budget Alerts</p>
                <p className="text-xs text-muted-foreground">Alert when approaching budget limits</p>
              </div>
              <Switch 
                checked={settings.budgetAlerts}
                onCheckedChange={() => handleToggle("budgetAlerts")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Receipt Expiry Reminders</p>
                <p className="text-xs text-muted-foreground">Remind to submit receipts before expiry</p>
              </div>
              <Switch 
                checked={settings.expiryReminders}
                onCheckedChange={() => handleToggle("expiryReminders")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Reports</p>
                <p className="text-xs text-muted-foreground">Send weekly expense summary emails</p>
              </div>
              <Switch 
                checked={settings.weeklyReports}
                onCheckedChange={() => handleToggle("weeklyReports")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Expense Policies */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Settings className="mr-2 text-primary" size={20} />
              Expense Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Mileage Rate ($/mile)</label>
              <Input 
                type="number"
                step="0.01"
                value={settings.mileageRate}
                onChange={(e) => handleInputChange("mileageRate", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Per Diem Rate ($/day)</label>
              <Input 
                type="number"
                value={settings.perDiemRate}
                onChange={(e) => handleInputChange("perDiemRate", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Max Meal Amount ($)</label>
              <Input 
                type="number"
                value={settings.maxMealAmount}
                onChange={(e) => handleInputChange("maxMealAmount", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Receipt Retention (Days)</label>
              <Input 
                type="number"
                value={settings.receiptRetentionDays}
                onChange={(e) => handleInputChange("receiptRetentionDays", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <CreditCard className="mr-2 text-success" size={20} />
            Accepted Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Cards</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Corporate Credit Card</span>
                  <Badge variant="default">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Personal Cards</span>
                  <Badge variant="outline">Reimbursable</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Cash & Check</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Cash Payments</span>
                  <Badge variant="default">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Personal Checks</span>
                  <Badge variant="outline">Reimbursable</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Digital</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Digital Wallets</span>
                  <Badge variant="default">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Online Banking</span>
                  <Badge variant="default">Allowed</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}