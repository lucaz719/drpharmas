import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Pill, AlertTriangle, CheckCircle, XCircle, Upload, Trash2, X, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI, Product, Category, Manufacturer, MedicationStats } from "@/services/api";

export default function MedicationList() {
  const [medications, setMedications] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPrescription, setFilterPrescription] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  // Form state for multiple medications
  const [formMedications, setFormMedications] = useState([{
    id: 1,
    name: "",
    product_code: "",
    generic_name: "",
    brand_name: "",
    category: "",
    dosage_form: "tablet",
    strength: "",
    pack_size: "",
    unit: "strip",
    manufacturer_name: "",
    requires_prescription: false,
    is_controlled: false,
    is_insured: false,
    description: "",
    alternatives: [] as string[]
  }]);

  // Alternative medications from existing medications plus custom entries
  const [alternativeSearch, setAlternativeSearch] = useState("");
  const [showAlternativeDropdown, setShowAlternativeDropdown] = useState(false);
  const [activeAlternativeField, setActiveAlternativeField] = useState<number | null>(null);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData(1);
  }, [searchTerm, filterCategory, filterStatus, filterPrescription]);

  const handlePageChange = (page: number) => {
    loadData(page);
  };

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        prescription_required: filterPrescription !== 'all' ? (filterPrescription === 'prescription') : undefined
      };
      
      const [medicationsResponse, categoriesResponse, manufacturersResponse, statsResponse] = await Promise.all([
        inventoryAPI.getMedications(params),
        inventoryAPI.getCategories(),
        inventoryAPI.getManufacturers(),
        inventoryAPI.getMedicationStats()
      ]);

      if (medicationsResponse.success && medicationsResponse.data) {
        setMedications(medicationsResponse.data.results || []);
        setPagination({
          count: medicationsResponse.data.count,
          next: medicationsResponse.data.next,
          previous: medicationsResponse.data.previous,
          currentPage: page,
          totalPages: Math.ceil(medicationsResponse.data.count / 10)
        });
      }
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
      if (manufacturersResponse.success) {
        setManufacturers(manufacturersResponse.data || []);
      }
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load medication data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Functions for managing multiple medications
  const addNewMedicationRow = () => {
    const newId = Math.max(...formMedications.map(med => med.id)) + 1;
    setFormMedications([...formMedications, {
      id: newId,
      name: "",
      product_code: "",
      generic_name: "",
      brand_name: "",
      category: "",
      dosage_form: "tablet",
      strength: "",
      pack_size: "",
      unit: "strip",
      manufacturer_name: "",
      requires_prescription: false,
      is_controlled: false,
      is_insured: false,
      description: "",
      alternatives: []
    }]);
  };

  const updateFormMedication = (id: number, field: string, value: any) => {
    setFormMedications(prev => prev.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeFormMedication = (id: number) => {
    if (formMedications.length > 1) {
      setFormMedications(formMedications.filter(med => med.id !== id));
    }
  };

  // Functions for alternatives multi-select
  const addAlternative = (medicationId: number, alternative: string) => {
    setFormMedications(prev => prev.map(med => {
      if (med.id === medicationId && !med.alternatives.includes(alternative)) {
        return { ...med, alternatives: [...med.alternatives, alternative] };
      }
      return med;
    }));
    setAlternativeSearch("");
    setShowAlternativeDropdown(false);
  };

  const removeAlternative = (medicationId: number, alternative: string) => {
    setFormMedications(prev => prev.map(med => {
      if (med.id === medicationId) {
        return { ...med, alternatives: med.alternatives.filter(alt => alt !== alternative) };
      }
      return med;
    }));
  };

  // Get alternatives from existing medications plus allow custom entries
  const getFilteredAlternatives = (medicationId: number) => {
    const currentMedication = formMedications.find(m => m.id === medicationId);
    const existingMedicineNames = medications.map(med => med.name);
    
    return existingMedicineNames
      .filter(name => 
        name.toLowerCase().includes(alternativeSearch.toLowerCase()) &&
        !currentMedication?.alternatives.includes(name)
      )
      .slice(0, 10); // Limit to 10 suggestions
  };

  // Download Excel template
  const downloadTemplate = () => {
    const headers = [
      'name', 'product_code', 'generic_name', 'brand_name', 'category_name',
      'manufacturer_name', 'dosage_form', 'strength', 'pack_size', 'unit',
      'requires_prescription', 'is_controlled', 'is_insured', 'description',
      'alternatives', 'cost_price', 'selling_price'
    ];
    
    const sampleData = [
      [
        'Paracetamol 500mg', 'MED001', 'Paracetamol', 'Crocin', 'Analgesics',
        'GSK', 'tablet', '500mg', '10 tablets', 'strip',
        'FALSE', 'FALSE', 'TRUE', 'Pain relief medication',
        'Aspirin,Ibuprofen', '50', '75'
      ],
      [
        'Amoxicillin 250mg', 'MED002', 'Amoxicillin', 'Augmentin', 'Antibiotics',
        'Pfizer', 'capsule', '250mg', '21 capsules', 'strip',
        'TRUE', 'FALSE', 'TRUE', 'Antibiotic for bacterial infections',
        'Azithromycin,Ciprofloxacin', '120', '180'
      ]
    ];

    // Create proper CSV content
    const csvContent = '\uFEFF' + [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\r\n');

    // Download as CSV file (more reliable than fake xlsx)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medication_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Excel upload function
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Error",
          description: "Please upload a valid Excel (.xlsx, .xls) or CSV file",
          variant: "destructive"
        });
        return;
      }

      try {
        const response = await inventoryAPI.bulkUploadMedications(file);
        // Check if the response indicates success
        if (response.success && response.data?.created_count !== undefined) {
          const count = response.data.created_count || 0;
          const errors = response.data.errors || [];
          
          toast({
            title: "Success",
            description: `${count} medications uploaded successfully${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
          });
          
          if (errors.length > 0) {
            console.warn('Upload errors:', errors);
          }
          
          loadData(); // Reload data
        } else {
          toast({
            title: "Error",
            description: response.error || response.message || "Failed to upload file",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to upload file. Please check the file format and try again.",
          variant: "destructive"
        });
      }
      
      // Reset file input
      event.target.value = '';
    }
  };

  // Server-side filtering, no need for client-side filtering
  const filteredMedications = medications;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "discontinued":
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditMedication = (medication: Product) => {
    // Extract alternatives from description
    let alternatives: string[] = [];
    if (medication.description && medication.description.includes('[ALTERNATIVES]')) {
      try {
        const start = medication.description.indexOf('[ALTERNATIVES]') + '[ALTERNATIVES]'.length;
        const end = medication.description.indexOf('[/ALTERNATIVES]');
        if (end > start) {
          alternatives = JSON.parse(medication.description.substring(start, end));
        }
      } catch (e) {
        alternatives = [];
      }
    }

    setFormMedications([{
      id: 1,
      name: medication.name,
      product_code: medication.product_code,
      generic_name: medication.generic_name || '',
      brand_name: medication.brand_name || '',
      category: medication.category?.toString() || '',
      dosage_form: medication.dosage_form,
      strength: medication.strength || '',
      pack_size: medication.pack_size || '',
      unit: medication.unit,
      manufacturer_name: medication.manufacturer_name || '',
      requires_prescription: medication.requires_prescription,
      is_controlled: medication.is_controlled,
      is_insured: medication.is_insured || false,
      description: medication.description?.replace(/\n\[ALTERNATIVES\].*?\[\/ALTERNATIVES\]/g, '') || '',
      alternatives: alternatives
    }]);
    setSelectedMedication(medication);
    setIsEditMode(true);
    setIsAddDialogOpen(true);
  };

  const handleAddMedications = async () => {
    const validMedications = formMedications.filter(med =>
      med.name && med.product_code
    );

    if (validMedications.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields (Name and Product Code) for at least one medication",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode && selectedMedication) {
        // Update existing medication
        const medData = validMedications[0];
        const updateData = {
          name: medData.name,
          product_code: medData.product_code,
          generic_name: medData.generic_name,
          brand_name: medData.brand_name,
          category: medData.category ? parseInt(medData.category) : undefined,
          manufacturer_name: medData.manufacturer_name,
          dosage_form: medData.dosage_form,
          strength: medData.strength,
          pack_size: medData.pack_size,
          unit: medData.unit,
          requires_prescription: medData.requires_prescription,
          is_controlled: medData.is_controlled,
          description: medData.description,
          alternatives: Array.isArray(medData.alternatives) ? medData.alternatives : [],
          is_insured: medData.is_insured,
          cost_price: selectedMedication.cost_price || 0,
          selling_price: selectedMedication.selling_price || 0
        };

        await inventoryAPI.updateMedication(selectedMedication.id, updateData);
        toast({
          title: "Success",
          description: "Medication updated successfully"
        });
      } else {
        // Convert form data to API format
        const medicationsToCreate = validMedications.map(med => ({
          name: med.name,
          product_code: med.product_code,
          generic_name: med.generic_name,
          brand_name: med.brand_name,
          category: med.category ? parseInt(med.category) : undefined,
          manufacturer_name: med.manufacturer_name,
          dosage_form: med.dosage_form,
          strength: med.strength,
          pack_size: med.pack_size,
          unit: med.unit,
          requires_prescription: med.requires_prescription,
          is_controlled: med.is_controlled,
          description: med.description,
          alternatives: Array.isArray(med.alternatives) ? med.alternatives : [],
          is_insured: med.is_insured,
          cost_price: 0,
          selling_price: 0,
          min_stock_level: 10,
          max_stock_level: 1000,
          reorder_point: 20,
          organization: 1
        }));

        // Create medications one by one
        for (const medData of medicationsToCreate) {
          await inventoryAPI.createMedication(medData);
        }

        toast({
          title: "Success",
          description: `${validMedications.length} medication(s) added successfully`
        });
      }

      // Reset form
      setFormMedications([{
        id: 1,
        name: "",
        product_code: "",
        generic_name: "",
        brand_name: "",
        category: "",
        dosage_form: "tablet",
        strength: "",
        pack_size: "",
        unit: "strip",
        manufacturer_name: "",
        requires_prescription: false,
        is_controlled: false,
        is_insured: false,
        description: "",
        alternatives: []
      }]);
      setSelectedMedication(null);
      setIsEditMode(false);
      setIsAddDialogOpen(false);

      // Reload data
      loadData();

    } catch (error) {
      console.error('Failed to add medications:', error);
      toast({
        title: "Error",
        description: "Failed to add medications",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalMedications = stats?.total_medications || 0;
  const activeMedications = stats?.active_medications || 0;
  const prescriptionMedications = stats?.prescription_medications || 0;
  const controlledMedications = stats?.controlled_medications || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading medications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medication List</h1>
          <p className="text-muted-foreground">Global medicine catalog with detailed information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setSelectedMedication(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} className="mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Medication' : 'Add New Medications'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update medication information' : 'Add multiple medications to the global medicine list'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col h-[75vh]">
              {/* Excel Upload Section - Only show in add mode */}
              {!isEditMode && (
                <div className="bg-blue-50 p-3 rounded mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Bulk Upload</Label>
                      <p className="text-xs text-muted-foreground">Download template first, then upload CSV/Excel file to add multiple medications</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <Download size={14} className="mr-2" />
                        Download Template
                      </Button>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelUpload}
                        className="hidden"
                        id="excel-upload"
                      />
                      <Label htmlFor="excel-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload size={14} className="mr-2" />
                            Choose File
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications Header - Hide add row button in edit mode */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">{isEditMode ? 'Medication' : 'Medications'}</div>
                {!isEditMode && (
                  <Button type="button" variant="outline" size="sm" onClick={addNewMedicationRow} className="h-7 px-2">
                    <Plus size={14} className="mr-1" />
                    Add Row
                  </Button>
                )}
              </div>

              {/* Scrollable Medications Section */}
              <div className="flex-1 overflow-y-auto border rounded p-2 mb-2">
                <div className="space-y-3">
                  {formMedications.map((medication, index) => (
                    <div key={medication.id} className="border rounded p-3 bg-card">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Medication {index + 1}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFormMedication(medication.id)}
                          disabled={formMedications.length === 1}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>

                      {/* 4-Column Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Name *</div>}
                          <Input
                            value={medication.name}
                            onChange={(e) => updateFormMedication(medication.id, 'name', e.target.value)}
                            placeholder="Medication name"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Product Code *</div>}
                          <Input
                            value={medication.product_code}
                            onChange={(e) => updateFormMedication(medication.id, 'product_code', e.target.value)}
                            placeholder="MED001"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Generic Name</div>}
                          <Input
                            value={medication.generic_name}
                            onChange={(e) => updateFormMedication(medication.id, 'generic_name', e.target.value)}
                            placeholder="Generic name"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Brand Name</div>}
                          <Input
                            value={medication.brand_name}
                            onChange={(e) => updateFormMedication(medication.id, 'brand_name', e.target.value)}
                            placeholder="Brand name"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Category</div>}
                          <Select value={medication.category} onValueChange={(value) => updateFormMedication(medication.id, 'category', value)}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Dosage Form</div>}
                          <Select value={medication.dosage_form} onValueChange={(value) => updateFormMedication(medication.id, 'dosage_form', value)}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tablet">Tablet</SelectItem>
                              <SelectItem value="capsule">Capsule</SelectItem>
                              <SelectItem value="syrup">Syrup</SelectItem>
                              <SelectItem value="injection">Injection</SelectItem>
                              <SelectItem value="cream">Cream</SelectItem>
                              <SelectItem value="drops">Drops</SelectItem>
                              <SelectItem value="powder">Powder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Strength</div>}
                          <Input
                            value={medication.strength}
                            onChange={(e) => updateFormMedication(medication.id, 'strength', e.target.value)}
                            placeholder="500mg"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Pack Size</div>}
                          <Input
                            value={medication.pack_size}
                            onChange={(e) => updateFormMedication(medication.id, 'pack_size', e.target.value)}
                            placeholder="10 tablets"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Unit</div>}
                          <Select value={medication.unit} onValueChange={(value) => updateFormMedication(medication.id, 'unit', value)}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strip">Strip</SelectItem>
                              <SelectItem value="bottle">Bottle</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="vial">Vial</SelectItem>
                              <SelectItem value="tube">Tube</SelectItem>
                              <SelectItem value="pen">Pen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Manufacturer</div>}
                          <Input
                            value={medication.manufacturer_name}
                            onChange={(e) => updateFormMedication(medication.id, 'manufacturer_name', e.target.value)}
                            placeholder="Manufacturer name"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2">
                          {index === 0 && <div className="text-xs text-gray-500 mb-1">Requirements</div>}
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={medication.requires_prescription}
                                onChange={(e) => updateFormMedication(medication.id, 'requires_prescription', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-xs">Rx Required</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={medication.is_controlled}
                                onChange={(e) => updateFormMedication(medication.id, 'is_controlled', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-xs">Controlled</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={medication.is_insured}
                                onChange={(e) => updateFormMedication(medication.id, 'is_insured', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-xs">Insured</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Description</div>}
                        <Textarea
                          value={medication.description}
                          onChange={(e) => updateFormMedication(medication.id, 'description', e.target.value)}
                          placeholder="Medication description"
                          rows={2}
                          className="text-xs"
                        />
                      </div>

                      {/* Alternatives Multi-Select */}
                      <div className="mt-3">
                        {index === 0 && <div className="text-xs text-gray-500 mb-2">Alternatives</div>}
                        <div className="relative">
                          <Input
                            value={alternativeSearch}
                            onChange={(e) => {
                              setAlternativeSearch(e.target.value);
                              setShowAlternativeDropdown(true);
                              setActiveAlternativeField(medication.id);
                            }}
                            onFocus={() => {
                              setShowAlternativeDropdown(true);
                              setActiveAlternativeField(medication.id);
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowAlternativeDropdown(false);
                                setActiveAlternativeField(null);
                              }, 300);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && alternativeSearch.trim()) {
                                e.preventDefault();
                                addAlternative(medication.id, alternativeSearch.trim());
                              }
                            }}
                            placeholder="Type medicine name or search existing..."
                            className="text-xs h-8"
                          />
                          {showAlternativeDropdown && activeAlternativeField === medication.id && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                              {getFilteredAlternatives(medication.id).map(alternative => (
                                <div
                                  key={alternative}
                                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    addAlternative(medication.id, alternative);
                                  }}
                                >
                                  {alternative}
                                </div>
                              ))}
                              {alternativeSearch.trim() && !getFilteredAlternatives(medication.id).includes(alternativeSearch.trim()) && (
                                <div
                                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs border-t bg-blue-50"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    addAlternative(medication.id, alternativeSearch.trim());
                                  }}
                                >
                                  + Add "{alternativeSearch.trim()}" as custom alternative
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 rounded border min-h-[40px]">
                          {medication.alternatives.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {medication.alternatives.map(alternative => (
                                <Badge key={alternative} variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                                  {alternative}
                                  <X
                                    size={12}
                                    className="cursor-pointer hover:text-red-500"
                                    onClick={() => removeAlternative(medication.id, alternative)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic flex items-center h-6">
                              No alternatives selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valid Medications:</span>
                    <span className="ml-2 font-medium">{formMedications.filter(m => m.name && m.product_code).length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Rows:</span>
                    <span className="ml-2 font-medium">{formMedications.length}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMedications}>
                {isEditMode ? 'Update Medication' : 'Add Medications'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Pill className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalMedications}</p>
                <p className="text-sm text-muted-foreground">Total Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeMedications}</p>
                <p className="text-sm text-muted-foreground">Active Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{prescriptionMedications}</p>
                <p className="text-sm text-muted-foreground">Prescription Required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{controlledMedications}</p>
                <p className="text-sm text-muted-foreground">Controlled Substances</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPrescription} onValueChange={setFilterPrescription}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Prescription required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Medications</SelectItem>
                <SelectItem value="prescription">Prescription Required</SelectItem>
                <SelectItem value="otc">Over The Counter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medication Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Catalog ({pagination.count} total, showing {filteredMedications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Generic/Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{medication.product_code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{medication.generic_name}</div>
                        <div className="text-muted-foreground">{medication.brand_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{medication.category_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{medication.dosage_form}</Badge>
                    </TableCell>
                    <TableCell>{medication.strength}</TableCell>
                    <TableCell>{medication.pack_size}</TableCell>
                    <TableCell>{medication.unit}</TableCell>
                    <TableCell>{medication.manufacturer_name}</TableCell>
                    <TableCell>{getStatusBadge(medication.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {medication.requires_prescription && (
                          <Badge variant="outline" className="text-xs">Rx Required</Badge>
                        )}
                        {medication.is_controlled && (
                          <Badge variant="destructive" className="text-xs">Controlled</Badge>
                        )}
                        {medication.is_insured && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">Insured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEditMedication(medication)}>
                        <Edit size={12} className="mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.count} total items)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.previous}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}