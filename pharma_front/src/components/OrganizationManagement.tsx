import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Building2, Users, MapPin, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { organizationsAPI, usersAPI, subscriptionAPI, Organization, Branch, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface OrganizationFormData {
  name: string;
  type: string;
  medical_system: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  license_number: string;
  license_expiry: string;
  tax_id: string;
  registration_number: string;
  currency: string;
  tax_rate: string;
  timezone: string;
  language: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expiry: string;
  logo?: File;
}


export function OrganizationManagement() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPricingTier, setSelectedPricingTier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('organizations');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [orgForm, setOrgForm] = useState<OrganizationFormData>({
    name: '',
    type: 'retail_pharmacy',
    medical_system: 'allopathic',
    address: '',
    city: 'Kathmandu',
    state: 'Bagmati',
    postal_code: '44600',
    country: 'Nepal',
    phone: '+977-1-234567',
    email: '',
    website: '',
    license_number: '',
    license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_id: '',
    registration_number: '',
    currency: 'NPR',
    tax_rate: '13.00',
    timezone: 'Asia/Kathmandu',
    language: 'en',
    subscription_plan: 'basic',
    subscription_status: 'active',
    subscription_expiry: '',
    logo: undefined,
  });


  // Load data on component mount
  useEffect(() => {
    loadOrganizations();
    loadBranches();
    loadUsers();
    loadActiveSubscriptions();
    loadSubscriptionPlans();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getOrganizations();
      if (response.success && response.data) {
        setOrganizations(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setOrganizations(response);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await organizationsAPI.getBranches();

      // Handle both wrapped response format and direct array format
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        setBranches(response.data);
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        setBranches(response);
      } else {
        console.warn('Unexpected branch API response format:', response);
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranches([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getUsers();

      // Handle both wrapped response format and direct array format
      if (response.success && response.data) {
        // Wrapped response format: {success: true, data: [...]}
        setUsers(response.data);
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        setUsers(response);
      } else {
        console.warn('Unexpected users API response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const loadActiveSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getSubscriptions({ status: 'active' });

      if (response.success && response.data) {
        const subscriptions = (response.data as any).results || response.data;
        setActiveSubscriptions(Array.isArray(subscriptions) ? subscriptions : []);
      } else if (Array.isArray(response)) {
        setActiveSubscriptions(response);
      } else {
        console.warn('Unexpected subscriptions API response format:', response);
        setActiveSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to load active subscriptions:', error);
      // Don't block the UI if subscription loading fails
      setActiveSubscriptions([]);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();

      if (response.success && response.data) {
        setSubscriptionPlans(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setSubscriptionPlans(response);
      } else {
        console.warn('Unexpected plans API response format:', response);
        setSubscriptionPlans([]);
      }
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      setSubscriptionPlans([]);
    }
  };

  const resetForms = () => {
    setOrgForm({
      name: '',
      type: 'retail_pharmacy',
      medical_system: 'allopathic',
      address: '',
      city: 'Kathmandu',
      state: 'Bagmati',
      postal_code: '44600',
      country: 'Nepal',
      phone: '+977-1-234567',
      email: '',
      website: '',
      license_number: '',
      license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_id: '',
      registration_number: '',
      currency: 'NPR',
      tax_rate: '13.00',
      timezone: 'Asia/Kathmandu',
      language: 'en',
      subscription_plan: 'basic',
      subscription_status: 'active',
      subscription_expiry: '',
      logo: undefined,
    });
    setSelectedPlan(null);
    setSelectedPricingTier(null);
    setFormErrors({});
    setIsEditMode(false);
    setSelectedOrganization(null);
  };

  const handleCreateOrganization = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      // Validate required fields
      if (!orgForm.name || !orgForm.email || !orgForm.address || !orgForm.license_number || !orgForm.license_expiry ||
        !orgForm.city || !orgForm.state || !orgForm.postal_code || !orgForm.phone || !selectedPlan || !selectedPricingTier) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields including subscription plan and pricing tier',
          variant: 'destructive',
        });
        return;
      }

      // Clean the data
      const cleanOrgForm: any = {
        name: orgForm.name.trim(),
        type: orgForm.type,
        medical_system: orgForm.medical_system,
        address: orgForm.address.trim(),
        city: orgForm.city.trim(),
        state: orgForm.state.trim(),
        postal_code: orgForm.postal_code.trim(),
        country: orgForm.country.trim(),
        phone: orgForm.phone.trim(),
        email: orgForm.email.replace(/,+$/, '').trim(), // Remove trailing commas
        license_number: orgForm.license_number.trim(),
        license_expiry: orgForm.license_expiry,
        currency: orgForm.currency,
        tax_rate: parseFloat(orgForm.tax_rate) || 13.00,
        timezone: orgForm.timezone,
        language: orgForm.language,
        subscription_plan: selectedPlan.name,
        subscription_status: 'active',
        subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      };

      // Only include optional fields if they have values
      if (orgForm.website.trim()) {
        cleanOrgForm.website = orgForm.website.trim();
      }
      if (orgForm.tax_id.trim()) {
        cleanOrgForm.tax_id = orgForm.tax_id.trim();
      }
      if (orgForm.registration_number.trim()) {
        cleanOrgForm.registration_number = orgForm.registration_number.trim();
      }

      // Prepare payload
      let response: any;

      if (isEditMode && selectedOrganization) {
        // Handle Update
        if (orgForm.logo) {
          // Update with logo (FormData)
          const formData = new FormData();
          Object.entries(cleanOrgForm).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          formData.append('logo', orgForm.logo);

          const apiResponse = await (await import('@/services/api')).default.put(`/organizations/${selectedOrganization.id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          response = { success: true, data: apiResponse.data, message: 'Organization updated successfully' };
        } else {
          // Update without logo (JSON)
          response = await organizationsAPI.updateOrganization(selectedOrganization.id, cleanOrgForm);
        }
      } else {
        // Handle Create
        if (orgForm.logo) {
          // Use FormData for file upload
          const formData = new FormData();
          Object.entries(cleanOrgForm).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          formData.append('logo', orgForm.logo);

          // Use api instance for consistent base URL handling
          // This ensures requests go to the correct relative path in production (proxied by Nginx)
          const apiResponse = await (await import('@/services/api')).default.post('/organizations/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          // Map response to matches expected structure for downstream logic
          const axiosResponse = { data: apiResponse.data };

          // Handle backend response structure for FormData
          if (axiosResponse.data && axiosResponse.data.organization) {
            response = {
              success: true,
              data: axiosResponse.data.organization,
              message: axiosResponse.data.message || 'Organization created successfully'
            };
          } else {
            response = {
              success: true,
              data: axiosResponse.data,
              message: 'Organization created successfully'
            };
          }
        } else {
          // Use JSON payload
          response = await organizationsAPI.createOrganization(cleanOrgForm);
        }
      }

      if (response.success) {
        // Create subscription record only for new organizations
        if (!isEditMode) {
          try {
            const subscriptionData = {
              organization: response.data.id,
              plan: selectedPlan.id,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              auto_renew: true
            };
            await subscriptionAPI.createSubscription(subscriptionData);
          } catch (subError) {
            console.error('Failed to create subscription:', subError);
          }
        }

        toast({
          title: 'Success',
          description: `Organization ${isEditMode ? 'updated' : 'created'} successfully`,
        });
        setShowCreateDialog(false);
        resetForms();
        loadOrganizations();
        loadUsers();
        loadActiveSubscriptions();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to action',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      setFormErrors(errorData || {});
      toast({
        title: 'Error',
        description: errorData?.error || JSON.stringify(errorData) || 'Failed to action',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setIsEditMode(true);

    // Parse address if possible or use as is
    setOrgForm({
      name: org.name,
      type: org.type,
      medical_system: org.medical_system || 'allopathic',
      address: org.address,
      city: org.city,
      state: org.state,
      postal_code: org.postal_code,
      country: org.country,
      phone: org.phone,
      email: org.email,
      website: org.website || '',
      license_number: '', // These might not be returned in list view, would need detail fetch or just empty
      license_expiry: '',
      tax_id: '',
      registration_number: '',
      currency: 'NPR',
      tax_rate: '13.00',
      timezone: 'Asia/Kathmandu',
      language: 'en',
      subscription_plan: org.subscription_plan || 'basic',
      subscription_status: 'active',
      subscription_expiry: '',
      logo: undefined
    });

    // Ideally we should fetch full details here, but for now this enables the edit dialog
    setShowCreateDialog(true);
  };

  const handleDeleteOrganization = async (orgId: string | number) => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) return;

    try {
      setLoading(true);
      await organizationsAPI.deleteOrganization(orgId.toString());
      toast({
        title: "Success",
        description: "Organization deleted successfully"
      });
      loadOrganizations();
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const getAvailableSubscriptionPlans = () => {
    return subscriptionPlans.filter(plan => plan.is_active);
  };

  const handlePlanSelection = (plan: any) => {
    setSelectedPlan(plan);
    setSelectedPricingTier(null); // Reset pricing tier when plan changes
  };

  const getPricingTiers = () => {
    if (!selectedPlan || !selectedPlan.pricing_tiers) return [];
    return selectedPlan.pricing_tiers;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      pending: { variant: 'outline' as const, icon: Loader2, color: 'text-yellow-600' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Manage pharmacy organizations and their branches</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new pharmacy organization.
              </DialogDescription>
            </DialogHeader>

            {Object.keys(formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please correct the following errors:
                  <ul className="list-disc pl-5">
                    {Object.entries(formErrors).map(([field, errors]) => (
                      <li key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Organization Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="Enter organization name"
                    className="border"
                    required
                  />
                  {formErrors.name && <span className="text-red-500 text-sm">{formErrors.name[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-email">Email *</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    placeholder="organization@example.com"
                    className="border"
                    required
                  />
                  {formErrors.email && <span className="text-red-500 text-sm">{formErrors.email[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-medical-system">Medical System *</Label>
                  <Select
                    value={orgForm.medical_system}
                    onValueChange={(value) => setOrgForm({ ...orgForm, medical_system: value })}
                  >
                    <SelectTrigger id="org-medical-system" className="border">
                      <SelectValue placeholder="Select medical system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allopathic">Allopathic (Western)</SelectItem>
                      <SelectItem value="ayurvedic">Ayurvedic (Traditional)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.medical_system && <span className="text-red-500 text-sm">{formErrors.medical_system[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-license">License Number *</Label>
                  <Input
                    id="org-license"
                    value={orgForm.license_number}
                    onChange={(e) => setOrgForm({ ...orgForm, license_number: e.target.value })}
                    placeholder="PH-2024-001234"
                    className="border"
                    required
                  />
                  {formErrors.license_number && <span className="text-red-500 text-sm">{formErrors.license_number[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-license-expiry">License Expiry *</Label>
                  <Input
                    id="org-license-expiry"
                    type="date"
                    value={orgForm.license_expiry}
                    onChange={(e) => setOrgForm({ ...orgForm, license_expiry: e.target.value })}
                    className="border"
                    required
                  />
                  {formErrors.license_expiry && <span className="text-red-500 text-sm">{formErrors.license_expiry[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-city">City *</Label>
                  <Input
                    id="org-city"
                    value={orgForm.city}
                    onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                    placeholder="Kathmandu"
                    className="border"
                    required
                  />
                  {formErrors.city && <span className="text-red-500 text-sm">{formErrors.city[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-state">State *</Label>
                  <Input
                    id="org-state"
                    value={orgForm.state}
                    onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })}
                    placeholder="Bagmati"
                    className="border"
                    required
                  />
                  {formErrors.state && <span className="text-red-500 text-sm">{formErrors.state[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-postal-code">Postal Code *</Label>
                  <Input
                    id="org-postal-code"
                    value={orgForm.postal_code}
                    onChange={(e) => setOrgForm({ ...orgForm, postal_code: e.target.value })}
                    placeholder="44600"
                    className="border"
                    required
                  />
                  {formErrors.postal_code && <span className="text-red-500 text-sm">{formErrors.postal_code[0]}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone *</Label>
                  <Input
                    id="org-phone"
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                    placeholder="+977-1-234567"
                    className="border"
                    required
                  />
                  {formErrors.phone && <span className="text-red-500 text-sm">{formErrors.phone[0]}</span>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Subscription Plan *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getAvailableSubscriptionPlans().map((plan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                          }`}
                        onClick={() => handlePlanSelection(plan)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h3 className="font-semibold text-lg">{plan.display_name}</h3>
                            <Badge className="mt-1">{plan.name}</Badge>
                            <div className="mt-2">
                              {plan.pricing_tiers && plan.pricing_tiers.length > 0 ? (
                                <div className="text-sm text-gray-600">
                                  From {formatCurrency(Math.min(...plan.pricing_tiers.map((t: any) => parseFloat(t.price))))}
                                </div>
                              ) : (
                                <div className="text-lg font-bold">{formatCurrency(plan.price)}</div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {plan.max_users ? `Up to ${plan.max_users} users` : 'Unlimited users'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {!selectedPlan && <span className="text-red-500 text-sm">Please select a subscription plan</span>}
                </div>

                {selectedPlan && getPricingTiers().length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Billing Cycle *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getPricingTiers().map((tier: any, index: number) => (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-all ${selectedPricingTier?.cycle === tier.cycle
                            ? 'ring-2 ring-green-500 bg-green-50'
                            : 'hover:shadow-md'
                            }`}
                          onClick={() => setSelectedPricingTier(tier)}
                        >
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-medium capitalize">{tier.cycle}</h4>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(parseFloat(tier.price))}
                              </div>
                              <div className="text-xs text-gray-500">
                                per {tier.cycle}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {!selectedPricingTier && <span className="text-red-500 text-sm">Please select a billing cycle</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-address">Address *</Label>
                <Textarea
                  id="org-address"
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={2}
                  className="border"
                  required
                />
                {formErrors.address && <span className="text-red-500 text-sm">{formErrors.address[0]}</span>}
              </div>

              {selectedPlan && selectedPricingTier && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Selected Subscription</h4>
                  <div className="mt-2 text-sm text-blue-800">
                    <p><strong>Plan:</strong> {selectedPlan.display_name}</p>
                    <p><strong>Billing:</strong> {formatCurrency(parseFloat(selectedPricingTier.price))} per {selectedPricingTier.cycle}</p>
                    <p><strong>Users:</strong> {selectedPlan.max_users ? `Up to ${selectedPlan.max_users}` : 'Unlimited'}</p>
                    <p><strong>Organizations:</strong> {selectedPlan.max_organizations ? `Up to ${selectedPlan.max_organizations}` : 'Unlimited'}</p>
                    {selectedPlan.features && selectedPlan.features.length > 0 && (
                      <div className="mt-2">
                        <strong>Features:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {selectedPlan.features.map((feature: string, index: number) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                resetForms();
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={loading || !selectedPlan || !selectedPricingTier}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditMode ? 'Update Organization' : 'Create Organization'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organizations ({organizations.length})
              </CardTitle>
              <CardDescription>
                Manage pharmacy organizations and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">S.No</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org, index) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{org.id}</TableCell>
                        <TableCell>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={`${org.name} logo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">' + org.name.charAt(0).toUpperCase() + '</div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {org.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => {
                              window.location.href = `/superadmin/organizations/${org.id}`;
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {org.name}
                          </button>
                          <div className="text-[10px] text-muted-foreground capitalize">
                            {org.medical_system || 'allopathic'}
                          </div>
                        </TableCell>
                        <TableCell>{(org.type || '').replace('_', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(org.status)}</TableCell>
                        <TableCell>{org.owner_name || 'Not assigned'}</TableCell>
                        <TableCell>{org.total_branches || 0}</TableCell>
                        <TableCell>{org.total_users || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Navigate to organization detail page
                                window.location.href = `/superadmin/organizations/${org.id}`;
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditOrganization(org)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOrganization(org.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Branches ({branches.length})
              </CardTitle>
              <CardDescription>
                Manage organization branches and locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.code}</TableCell>
                      <TableCell>{branch.organization_name}</TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>{branch.manager_name || 'Not assigned'}</TableCell>
                      <TableCell>{branch.total_users || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{(user.role || '').replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.organization_name || 'N/A'}</TableCell>
                      <TableCell>{user.branch_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}