import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, Users, DollarSign, Clock, 
  Save, Settings, Mail, Phone 
} from "lucide-react";

export default function SupplierSettings() {
  const [settings, setSettings] = useState({
    // Order Management
    defaultPaymentTerms: "Net 30",
    autoApproveOrders: false,
    requireSignature: true,
    enablePartialDeliveries: true,
    
    // Communication
    orderConfirmationEmail: true,
    deliveryNotifications: true,
    invoiceReminders: true,
    communicationPreference: "email",
    
    // Performance Tracking
    trackDeliveryTime: true,
    trackOrderAccuracy: true,
    minimumOrderValue: 100,
    preferredDeliveryWindow: "morning",
    
    // Integration
    enableEDI: false,
    apiIntegration: true,
    autoInvoiceProcessing: false,
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
          <h2 className="text-2xl font-bold text-foreground">Supplier Settings</h2>
          <p className="text-muted-foreground">Configure supplier management preferences</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Save size={16} className="mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Management */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Truck className="mr-2 text-primary" size={20} />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Default Payment Terms</label>
              <select 
                value={settings.defaultPaymentTerms}
                onChange={(e) => handleInputChange("defaultPaymentTerms", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Minimum Order Value ($)</label>
              <Input 
                type="number"
                value={settings.minimumOrderValue}
                onChange={(e) => handleInputChange("minimumOrderValue", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-approve Orders</p>
                <p className="text-xs text-muted-foreground">Automatically approve orders below threshold</p>
              </div>
              <Switch 
                checked={settings.autoApproveOrders}
                onCheckedChange={() => handleToggle("autoApproveOrders")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require Delivery Signature</p>
                <p className="text-xs text-muted-foreground">Require signature for all deliveries</p>
              </div>
              <Switch 
                checked={settings.requireSignature}
                onCheckedChange={() => handleToggle("requireSignature")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Allow Partial Deliveries</p>
                <p className="text-xs text-muted-foreground">Accept partial shipments for large orders</p>
              </div>
              <Switch 
                checked={settings.enablePartialDeliveries}
                onCheckedChange={() => handleToggle("enablePartialDeliveries")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Mail className="mr-2 text-success" size={20} />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Preferred Communication</label>
              <select 
                value={settings.communicationPreference}
                onChange={(e) => handleInputChange("communicationPreference", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="portal">Supplier Portal</option>
                <option value="fax">Fax</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Order Confirmation Emails</p>
                <p className="text-xs text-muted-foreground">Send email confirmations for new orders</p>
              </div>
              <Switch 
                checked={settings.orderConfirmationEmail}
                onCheckedChange={() => handleToggle("orderConfirmationEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delivery Notifications</p>
                <p className="text-xs text-muted-foreground">Notify suppliers about delivery updates</p>
              </div>
              <Switch 
                checked={settings.deliveryNotifications}
                onCheckedChange={() => handleToggle("deliveryNotifications")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Invoice Reminders</p>
                <p className="text-xs text-muted-foreground">Send automatic payment reminders</p>
              </div>
              <Switch 
                checked={settings.invoiceReminders}
                onCheckedChange={() => handleToggle("invoiceReminders")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Tracking */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Clock className="mr-2 text-warning" size={20} />
              Performance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Preferred Delivery Window</label>
              <select 
                value={settings.preferredDeliveryWindow}
                onChange={(e) => handleInputChange("preferredDeliveryWindow", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Track Delivery Performance</p>
                <p className="text-xs text-muted-foreground">Monitor on-time delivery rates</p>
              </div>
              <Switch 
                checked={settings.trackDeliveryTime}
                onCheckedChange={() => handleToggle("trackDeliveryTime")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Track Order Accuracy</p>
                <p className="text-xs text-muted-foreground">Monitor order fulfillment accuracy</p>
              </div>
              <Switch 
                checked={settings.trackOrderAccuracy}
                onCheckedChange={() => handleToggle("trackOrderAccuracy")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Settings className="mr-2 text-primary" size={20} />
              System Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable EDI</p>
                <p className="text-xs text-muted-foreground">Electronic Data Interchange for orders</p>
              </div>
              <Switch 
                checked={settings.enableEDI}
                onCheckedChange={() => handleToggle("enableEDI")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">API Integration</p>
                <p className="text-xs text-muted-foreground">Connect with supplier APIs</p>
              </div>
              <Switch 
                checked={settings.apiIntegration}
                onCheckedChange={() => handleToggle("apiIntegration")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-process Invoices</p>
                <p className="text-xs text-muted-foreground">Automatically process received invoices</p>
              </div>
              <Switch 
                checked={settings.autoInvoiceProcessing}
                onCheckedChange={() => handleToggle("autoInvoiceProcessing")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Categories */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Users className="mr-2 text-primary" size={20} />
            Supplier Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: "Pharmaceutical", count: 12, color: "destructive" },
              { name: "Medical Equipment", count: 8, color: "default" },
              { name: "OTC Products", count: 15, color: "secondary" },
              { name: "Wellness & Nutrition", count: 6, color: "outline" },
              { name: "Office Supplies", count: 4, color: "outline" },
              { name: "Packaging", count: 3, color: "outline" },
            ].map((category, index) => (
              <div key={index} className="p-3 border border-border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-foreground text-sm">{category.name}</h4>
                  <Badge variant={category.color as any} className="text-xs">
                    {category.count}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Suppliers
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <DollarSign className="mr-2 text-success" size={20} />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Bank Transfer</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">ACH Transfer</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Wire Transfer</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Cards & Digital</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Corporate Cards</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">PayPal Business</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Traditional</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Check Payment</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <span className="text-sm text-panel-foreground">Cash on Delivery</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}