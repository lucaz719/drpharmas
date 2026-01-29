import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, Receipt, Percent, CreditCard, 
  Save, RotateCcw, Upload, FileImage, Loader2
} from "lucide-react";
import api from "@/services/api";

export default function POSSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [receiptSettings, setReceiptSettings] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    footerText: "",
    logoUrl: null as string | null
  });

  const [taxSettings, setTaxSettings] = useState({
    vatEnabled: false,
    vatRate: 13,
    taxInclusive: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    onlinePayments: ["cash", "online"]
  });

  const { toast } = useToast();

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pos/settings/');
      const data = response.data;
      
      setReceiptSettings({
        businessName: data.business_name || "",
        address: data.business_address || "",
        phone: data.business_phone || "",
        email: data.business_email || "",
        footerText: data.receipt_footer || "",
        logoUrl: data.receipt_logo || null
      });
      
      setTaxSettings({
        vatEnabled: data.tax_rate > 0,
        vatRate: data.tax_rate || 13,
        taxInclusive: data.tax_inclusive || false
      });
      
      setPaymentSettings({
        onlinePayments: data.payment_methods || ["cash", "online"]
      });
      
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load POS settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('business_name', receiptSettings.businessName);
      formData.append('business_address', receiptSettings.address);
      formData.append('business_phone', receiptSettings.phone);
      formData.append('business_email', receiptSettings.email);
      formData.append('receipt_footer', receiptSettings.footerText);
      formData.append('tax_rate', taxSettings.vatEnabled ? taxSettings.vatRate.toString() : '0');
      formData.append('tax_inclusive', taxSettings.taxInclusive ? 'true' : 'false');
      formData.append('payment_methods', JSON.stringify(paymentSettings.onlinePayments));
      
      if (logoFile) {
        formData.append('receipt_logo', logoFile);
      }
      
      await api.post('/pos/settings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Settings Saved",
        description: "POS settings have been updated successfully",
      });
      
      // Reload settings to get updated data
      await loadSettings();
      setLogoFile(null);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save POS settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setReceiptSettings({
      businessName: "",
      address: "",
      phone: "",
      email: "",
      footerText: "",
      logoUrl: null
    });
    
    setTaxSettings({
      vatEnabled: false,
      vatRate: 13,
      taxInclusive: false
    });
    
    setPaymentSettings({
      onlinePayments: ["cash", "online"]
    });
    
    setLogoFile(null);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      setLogoFile(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <SettingsIcon className="mr-2 text-primary" />
            POS Settings
          </h2>
          <p className="text-muted-foreground">Configure point of sale system preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetSettings} disabled={saving}>
            <RotateCcw size={16} className="mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="receipt" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="tax">Tax & VAT</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="receipt" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Receipt className="mr-2" />
                  Receipt Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={receiptSettings.businessName}
                    onChange={(e) => setReceiptSettings({...receiptSettings, businessName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={receiptSettings.address}
                    onChange={(e) => setReceiptSettings({...receiptSettings, address: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={receiptSettings.phone}
                      onChange={(e) => setReceiptSettings({...receiptSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={receiptSettings.email}
                      onChange={(e) => setReceiptSettings({...receiptSettings, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea
                    id="footerText"
                    value={receiptSettings.footerText}
                    onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Logo Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {receiptSettings.logoUrl && !logoFile ? (
                      <div className="mb-4">
                        <img 
                          src={receiptSettings.logoUrl.startsWith('http') ? receiptSettings.logoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/backend'}${receiptSettings.logoUrl}`} 
                          alt="Current logo" 
                          className="mx-auto max-h-20 object-contain mb-2"
                          onError={(e) => {
                            console.error('Failed to load image:', receiptSettings.logoUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-sm text-muted-foreground">Current logo</p>
                      </div>
                    ) : logoFile ? (
                      <div className="mb-4">
                        <img 
                          src={URL.createObjectURL(logoFile)} 
                          alt="New logo preview" 
                          className="mx-auto max-h-20 object-contain mb-2"
                        />
                        <p className="text-sm text-muted-foreground">New logo selected: {logoFile.name}</p>
                      </div>
                    ) : (
                      <FileImage className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button 
                      variant="outline" 
                      className="mb-2"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      {receiptSettings.logoUrl || logoFile ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-sm text-muted-foreground">Max size: 2MB, PNG/JPG format</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card className="bg-card border border-border max-w-md">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Percent className="mr-2" />
                Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="vatEnabled">Include Tax</Label>
                <Switch
                  id="vatEnabled"
                  checked={taxSettings.vatEnabled}
                  onCheckedChange={(checked) => setTaxSettings({...taxSettings, vatEnabled: checked})}
                />
              </div>

              <div className={`space-y-4 p-3 border rounded-lg transition-opacity ${!taxSettings.vatEnabled ? 'opacity-50 bg-muted/20' : 'bg-background'}`}>
                <div className="space-y-2">
                  <Label htmlFor="vatRate" className={!taxSettings.vatEnabled ? "text-muted-foreground" : ""}>Tax Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={taxSettings.vatRate}
                    onChange={(e) => setTaxSettings({...taxSettings, vatRate: Number(e.target.value)})}
                    placeholder="Enter tax percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!taxSettings.vatEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="taxInclusive" className={!taxSettings.vatEnabled ? "text-muted-foreground" : ""}>Tax Inclusive Pricing</Label>
                  <Switch
                    id="taxInclusive"
                    checked={taxSettings.taxInclusive}
                    onCheckedChange={(checked) => setTaxSettings({...taxSettings, taxInclusive: checked})}
                    disabled={!taxSettings.vatEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="bg-card border border-border max-w-lg">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <CreditCard className="mr-2" />
                Online Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {paymentSettings.onlinePayments.map((payment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={payment}
                      onChange={(e) => {
                        const newPayments = [...paymentSettings.onlinePayments];
                        newPayments[index] = e.target.value;
                        setPaymentSettings({...paymentSettings, onlinePayments: newPayments});
                      }}
                      placeholder="e.g., eSewa, Khalti, Bank Transfer"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPayments = paymentSettings.onlinePayments.filter((_, i) => i !== index);
                        setPaymentSettings({...paymentSettings, onlinePayments: newPayments});
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentSettings({
                      ...paymentSettings,
                      onlinePayments: [...paymentSettings.onlinePayments, ""]
                    });
                  }}
                >
                  Add Payment Method
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Payment Methods'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}