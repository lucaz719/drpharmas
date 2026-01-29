import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, User, Building, Bell, 
  Shield, Database, Mail, Globe, Save, Key, Users 
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your pharmacy system preferences and configuration</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <User className="mr-2 text-primary" size={20} />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input defaultValue="Dr. Sarah Johnson" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input defaultValue="sarah.johnson@pharmacare.com" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input defaultValue="(555) 123-4567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Role</label>
              <div className="mt-1">
                <Badge variant="default">Pharmacy Manager</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Information */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Building className="mr-2 text-success" size={20} />
              Pharmacy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Pharmacy Name</label>
              <Input defaultValue="drpharmas" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">License Number</label>
              <Input defaultValue="PH-2024-001234" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input defaultValue="123 Health Street, Medical District" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Operating Hours</label>
              <Input defaultValue="8:00 AM - 10:00 PM" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Shield className="mr-2 text-warning" size={20} />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Key size={14} className="mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Bell className="mr-2 text-primary" size={20} />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Low Stock Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified when products are running low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Expiry Warnings</p>
                <p className="text-xs text-muted-foreground">Alerts for products nearing expiration</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Order Updates</p>
                <p className="text-xs text-muted-foreground">Notifications for order status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send notifications to email</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">SMS Alerts</p>
                <p className="text-xs text-muted-foreground">Important alerts via SMS</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <SettingsIcon className="mr-2 text-primary" size={20} />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Default Currency</label>
              <Input defaultValue="USD ($)" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tax Rate (%)</label>
              <Input defaultValue="8.5" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
              <Input defaultValue="10" placeholder="Minimum stock level" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Reorder</p>
                <p className="text-xs text-muted-foreground">Automatically create reorder suggestions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Backup Data</p>
                <p className="text-xs text-muted-foreground">Daily automatic backups</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration & API Settings */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Globe className="mr-2 text-success" size={20} />
            Integrations & API Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Payment Gateways</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Stripe</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">PayPal</span>
                  <Badge variant="outline">Disconnected</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Supplier APIs</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">MedSupply API</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">PharmaDist API</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">External Services</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Insurance Verification</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Drug Database</span>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Users className="mr-2 text-primary" size={20} />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Manage system users and their permissions</p>
            <Button variant="outline" size="sm">
              <Users size={14} className="mr-2" />
              Add User
            </Button>
          </div>
          <div className="space-y-2">
            {[
              { name: "Dr. Sarah Johnson", role: "Manager", status: "Active" },
              { name: "Mike Wilson", role: "Pharmacist", status: "Active" },
              { name: "Lisa Brown", role: "Technician", status: "Active" },
              { name: "John Doe", role: "Cashier", status: "Inactive" }
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                <div>
                  <p className="font-medium text-panel-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.status === "Active" ? "default" : "outline"}>
                    {user.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}