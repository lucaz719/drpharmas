import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI, Category, Manufacturer } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import {
  Settings, Plus, Edit, Trash2, Archive, Eye, Search
} from "lucide-react";

export default function InventorySettings() {

  // Category and Manufacturer management
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isManufacturerDialogOpen, setIsManufacturerDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  // Rack Management State
  const [racks, setRacks] = useState<any[]>([]);
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false);
  const [isRackViewDialogOpen, setIsRackViewDialogOpen] = useState(false);
  const [isSectionDetailDialogOpen, setIsSectionDetailDialogOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [rackForm, setRackForm] = useState({
    name: "",
    description: "",
    rows: "",
    columns: ""
  });
  const [rackLayout, setRackLayout] = useState<any[]>([]);
  const [rackSearchTerm, setRackSearchTerm] = useState("");

  // Medicine search states for rack assignment
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [assignmentQuantity, setAssignmentQuantity] = useState("");
  const [isSearchingMedicines, setIsSearchingMedicines] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState<any[]>([]);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    parent: "",
    is_active: true
  });

  const [manufacturerForm, setManufacturerForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    license_number: "",
    is_active: true
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadRacks();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, manufacturersResponse] = await Promise.all([
        inventoryAPI.getCategories(),
        inventoryAPI.getManufacturers()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
      if (manufacturersResponse.success) {
        setManufacturers(manufacturersResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load categories and manufacturers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRacks = async () => {
    try {
      const response = await inventoryAPI.getRacks();
      if (response.success) {
        setRacks(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load racks:', error);
      toast({
        title: "Error",
        description: "Failed to load rack data",
        variant: "destructive"
      });
    }
  };




  // Category handlers
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description,
        parent: categoryForm.parent ? parseInt(categoryForm.parent) : null,
        is_active: categoryForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.createCategory(categoryData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Category added successfully"
        });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        loadData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add category",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      parent: category.parent?.toString() || "",
      is_active: category.is_active
    });
    setIsCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) return;

    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description,
        parent: categoryForm.parent ? parseInt(categoryForm.parent) : null,
        is_active: categoryForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.updateCategory(editingCategory.id, categoryData);
      if (response.success) {
        // Update local state with the response data
        const updatedCategory = response.data || { ...editingCategory, ...categoryData };
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        setEditingCategory(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await inventoryAPI.deleteCategory(categoryId);
      if (response.success) {
        // Remove from local state immediately
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      parent: "",
      is_active: true
    });
  };

  // Manufacturer handlers
  const handleAddManufacturer = async () => {
    if (!manufacturerForm.name.trim()) {
      toast({
        title: "Error",
        description: "Manufacturer name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const manufacturerData = {
        name: manufacturerForm.name,
        contact_person: manufacturerForm.contact_person,
        phone: manufacturerForm.phone,
        email: manufacturerForm.email,
        address: manufacturerForm.address,
        website: manufacturerForm.website,
        license_number: manufacturerForm.license_number,
        is_active: manufacturerForm.is_active,
        organization: 1
      };

      const response = await inventoryAPI.createManufacturer(manufacturerData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Manufacturer added successfully"
        });
        setIsManufacturerDialogOpen(false);
        resetManufacturerForm();
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add manufacturer",
        variant: "destructive"
      });
    }
  };

  const resetManufacturerForm = () => {
    setManufacturerForm({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      license_number: "",
      is_active: true
    });
  };

  // Rack Management Functions
  const generateRackLayout = () => {
    const rows = parseInt(rackForm.rows) || 0;
    const cols = parseInt(rackForm.columns) || 0;

    if (rows <= 0 || cols <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid rows and columns",
        variant: "destructive"
      });
      return;
    }

    const layout = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const sectionName = `${String.fromCharCode(65 + row)}${col + 1}`;
        layout.push({
          id: `${row}-${col}`,
          name: sectionName,
          row: row + 1,
          col: col + 1,
          hasMedicine: Math.random() > 0.7, // Mock data
          medicineName: Math.random() > 0.7 ? "Paracetamol 500mg" : null
        });
      }
    }
    setRackLayout(layout);
  };

  const handleSaveRack = async () => {
    if (!rackForm.name.trim()) {
      toast({
        title: "Error",
        description: "Rack name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const rackData = {
        name: rackForm.name,
        description: rackForm.description,
        rows: parseInt(rackForm.rows),
        columns: parseInt(rackForm.columns),
        organization: currentUser?.organizationId || 1
      };

      const response = await inventoryAPI.createRack(rackData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Rack created successfully"
        });
        setIsRackDialogOpen(false);
        setRackForm({ name: "", description: "", rows: "", columns: "" });
        loadRacks();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create rack",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create rack",
        variant: "destructive"
      });
    }
  };

  const handleViewRack = async (rack: any) => {
    try {
      // Fetch real rack sections data
      const response = await inventoryAPI.getRackSections(rack.id);
      if (response.success) {
        // Update rack with real sections data
        const rackWithSections = {
          ...rack,
          sections: response.data || []
        };
        setSelectedRack(rackWithSections);
      } else {
        // Fallback to rack without sections
        setSelectedRack(rack);
      }
    } catch (error) {
      console.error('Failed to load rack sections:', error);
      setSelectedRack(rack);
    }
    setIsRackViewDialogOpen(true);
  };

  const handleSectionClick = (section: any) => {
    // Use real section data if available
    if (section.sectionData) {
      setSelectedSection({
        ...section,
        medicines: section.sectionData.medicine ? [{
          id: section.sectionData.medicine.id,
          name: section.sectionData.medicine.name,
          genericName: section.sectionData.medicine.generic_name || '',
          brandName: section.sectionData.medicine.brand_name || '',
          strength: section.sectionData.medicine.strength || '',
          dosageForm: section.sectionData.medicine.dosage_form || '',
          packSize: section.sectionData.medicine.pack_size || '',
          batchNumber: section.sectionData.batch_number || '',
          expiryDate: section.sectionData.expiry_date || '',
          quantity: section.sectionData.quantity || 0,
          costPrice: section.sectionData.medicine.cost_price || 0,
          sellingPrice: section.sectionData.medicine.selling_price || 0,
          manufacturer: section.sectionData.medicine.manufacturer_name || '',
          location: section.name
        }] : []
      });
    } else {
      // Empty section
      setSelectedSection({
        ...section,
        medicines: []
      });
    }
    setIsSectionDetailDialogOpen(true);
  };

  // Medicine search function for rack assignment
  const searchMedicines = async (query: string) => {
    if (!query.trim()) {
      setMedicineSuggestions([]);
      setShowMedicineDropdown(false);
      return;
    }

    setIsSearchingMedicines(true);
    try {
      const response = await inventoryAPI.searchMedicinesForRack(query);
      if (response.success) {
        setMedicineSuggestions(response.data || []);
        setShowMedicineDropdown(true);
      } else {
        setMedicineSuggestions([]);
        setShowMedicineDropdown(false);
      }
    } catch (error) {
      console.error('Failed to search medicines:', error);
      setMedicineSuggestions([]);
      setShowMedicineDropdown(false);
    } finally {
      setIsSearchingMedicines(false);
    }
  };

  // Handle medicine search input change
  const handleMedicineSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMedicineSearchTerm(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMedicines(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle medicine selection
  const handleMedicineSelect = (medicine: any) => {
    setSelectedMedicine(medicine);
    setMedicineSearchTerm(medicine.name);
    setShowMedicineDropdown(false);
  };

  // Add medicine to assignment list
  const addMedicineToAssignment = () => {
    if (!selectedMedicine || !assignmentQuantity) {
      toast({
        title: "Error",
        description: "Please select a medicine and enter quantity",
        variant: "destructive"
      });
      return;
    }

    const requestedQuantity = parseInt(assignmentQuantity);
    const availableQuantity = selectedMedicine.available_quantity || 0;

    // Validate quantity against available stock
    if (requestedQuantity > availableQuantity) {
      toast({
        title: "Quantity Adjusted",
        description: `Only ${availableQuantity} units available. Quantity adjusted to maximum available.`,
        variant: "default"
      });
      // Auto-adjust to available quantity
      const adjustedQuantity = availableQuantity;
    }

    const finalQuantity = requestedQuantity > availableQuantity ? availableQuantity : requestedQuantity;

    // Check if medicine is already in the list
    const existingIndex = assignedMedicines.findIndex(item => item.medicine.id === selectedMedicine.id);
    if (existingIndex !== -1) {
      // Update quantity if already exists
      const updatedMedicines = [...assignedMedicines];
      updatedMedicines[existingIndex].quantity = finalQuantity;
      setAssignedMedicines(updatedMedicines);
    } else {
      // Add new medicine
      setAssignedMedicines([...assignedMedicines, {
        medicine: selectedMedicine,
        quantity: finalQuantity
      }]);
    }

    // Clear form
    setSelectedMedicine(null);
    setMedicineSearchTerm("");
    setAssignmentQuantity("");
    setMedicineSuggestions([]);
    setShowMedicineDropdown(false);
  };

  // Remove medicine from assignment list
  const removeMedicineFromAssignment = (medicineId: number) => {
    setAssignedMedicines(assignedMedicines.filter(item => item.medicine.id !== medicineId));
  };

  const filteredRacks = racks.filter(rack =>
    rack.name.toLowerCase().includes(rackSearchTerm.toLowerCase()) ||
    rack.description.toLowerCase().includes(rackSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Settings</h2>
          <p className="text-muted-foreground">Configure inventory management preferences and manage categories</p>
        </div>

      </div>

      <Tabs defaultValue="rack-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rack-management">Rack Management</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
        </TabsList>

        {/* Rack Management Tab */}
        <TabsContent value="rack-management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rack Creation */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Archive className="mr-2" size={20} />
                  Create New Rack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Rack Name</Label>
                    <Input
                      placeholder="e.g., Main Rack A"
                      value={rackForm.name}
                      onChange={(e) => setRackForm({...rackForm, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Input
                      placeholder="Optional description"
                      value={rackForm.description}
                      onChange={(e) => setRackForm({...rackForm, description: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Number of Rows</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      value={rackForm.rows}
                      onChange={(e) => setRackForm({...rackForm, rows: e.target.value})}
                      className="mt-1"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Number of Columns</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={rackForm.columns}
                      onChange={(e) => setRackForm({...rackForm, columns: e.target.value})}
                      className="mt-1"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <Button
                  onClick={generateRackLayout}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!rackForm.rows || !rackForm.columns}
                >
                  Generate Layout Preview
                </Button>

                {/* Layout Preview */}
                {rackLayout.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Layout Preview</Label>
                    <div className="grid gap-1 p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${rackForm.columns}, 1fr)`,
                          gridTemplateRows: `repeat(${rackForm.rows}, 1fr)`
                        }}
                      >
                        {rackLayout.map((section) => (
                          <div
                            key={section.id}
                            className="aspect-square bg-white border border-gray-300 rounded flex items-center justify-center text-xs font-medium hover:bg-blue-50 cursor-pointer transition-colors"
                            title={`Edit Section ${section.name}`}
                            onClick={() => handleSectionClick(section)}
                          >
                            {section.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total sections: {rackLayout.length}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSaveRack}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!rackForm.name.trim() || rackLayout.length === 0}
                >
                  Save Rack
                </Button>
              </CardContent>
            </Card>

            {/* Rack List */}
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-green-800">
                  <div className="flex items-center">
                    <Archive className="mr-2" size={20} />
                    Existing Racks
                  </div>
                  <Dialog open={isRackDialogOpen} onOpenChange={setIsRackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Plus size={14} className="mr-1" />
                        Create New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Rack</DialogTitle>
                        <DialogDescription>
                          Set up a new storage rack for your pharmacy
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Rack Name</Label>
                          <Input
                            placeholder="e.g., Main Rack A"
                            value={rackForm.name}
                            onChange={(e) => setRackForm({...rackForm, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            placeholder="Optional description"
                            value={rackForm.description}
                            onChange={(e) => setRackForm({...rackForm, description: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Rows</Label>
                            <Input
                              type="number"
                              placeholder="5"
                              value={rackForm.rows}
                              onChange={(e) => setRackForm({...rackForm, rows: e.target.value})}
                              min="1"
                              max="20"
                            />
                          </div>
                          <div>
                            <Label>Columns</Label>
                            <Input
                              type="number"
                              placeholder="10"
                              value={rackForm.columns}
                              onChange={(e) => setRackForm({...rackForm, columns: e.target.value})}
                              min="1"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRackDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          generateRackLayout();
                          handleSaveRack();
                          setIsRackDialogOpen(false);
                        }}>
                          Create Rack
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <Input
                    placeholder="Search racks..."
                    value={rackSearchTerm}
                    onChange={(e) => setRackSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Rack Cards */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRacks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No racks found
                    </div>
                  ) : (
                    filteredRacks.map((rack) => (
                      <div key={rack.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{rack.name}</h4>
                            <p className="text-sm text-gray-600">{rack.description}</p>
                          </div>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {rack.rows}×{rack.columns}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{rack.total_sections} sections</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewRack(rack)}>
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit size={12} className="mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rack Layout View Dialog */}
          <Dialog open={isRackViewDialogOpen} onOpenChange={setIsRackViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Archive className="mr-2" size={20} />
                  {selectedRack?.name} - Layout View
                </DialogTitle>
                <DialogDescription>
                  Visual layout of rack sections. Click on any section to view medicine details.
                </DialogDescription>
              </DialogHeader>

              {selectedRack && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <Input
                      placeholder="Search rack or section..."
                      className="pl-8"
                    />
                  </div>

                  {/* Rack Layout Grid */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div
                      className="grid gap-2 mx-auto"
                      style={{
                        gridTemplateColumns: `repeat(${selectedRack.columns}, minmax(0, 1fr))`,
                        maxWidth: `${Math.min(selectedRack.columns * 60, 800)}px`
                      }}
                    >
                      {Array.from({ length: selectedRack.rows }, (_, rowIndex) =>
                        Array.from({ length: selectedRack.columns }, (_, colIndex) => {
                          const sectionName = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;

                          // Check if this section has real medicine assigned
                          const sectionData = selectedRack.sections?.find((s: any) =>
                            s.row_number === rowIndex + 1 && s.column_number === colIndex + 1
                          );

                          const hasMedicine = sectionData?.is_occupied || false;
                          const medicineCount = sectionData?.quantity || 0;
                          const medicineName = sectionData?.medicine?.name || null;

                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition-all hover:scale-105 relative ${
                                hasMedicine
                                  ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                              }`}
                              title={medicineName ? `${sectionName}: ${medicineName} (${medicineCount} items)` : `${sectionName}: Empty`}
                              onClick={() => handleSectionClick({
                                name: sectionName,
                                row: rowIndex + 1,
                                col: colIndex + 1,
                                hasMedicine,
                                medicineCount,
                                medicineName,
                                sectionData
                              })}
                            >
                              <span>{sectionName}</span>
                              {hasMedicine && (
                                <span className="text-xs font-bold">{medicineCount}</span>
                              )}
                            </div>
                          );
                        })
                      ).flat()}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                      <span>Has Medicine (Click to view details)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                      <span>Empty</span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRackViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Section Detail Dialog */}
          <Dialog open={isSectionDetailDialogOpen} onOpenChange={setIsSectionDetailDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Archive className="mr-2" size={20} />
                  Section {selectedSection?.name} - Medicine Details
                </DialogTitle>
                <DialogDescription>
                  Complete inventory details for rack section {selectedSection?.name}
                </DialogDescription>
              </DialogHeader>

              {selectedSection && (
                <div className="space-y-6">
                  {/* Section Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Section Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Section:</span>
                        <span className="ml-2 font-medium">{selectedSection.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Row:</span>
                        <span className="ml-2 font-medium">{selectedSection.row}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Column:</span>
                        <span className="ml-2 font-medium">{selectedSection.col}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medicine Assignment Form */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-medium text-yellow-900 mb-3">Assign Medicine to Section</h3>
                    <div className="space-y-4">
                      {/* Medicine Assignment Form */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-gray-700">Search & Select Medicine</Label>
                          <div className="relative mt-1">
                            <Input
                              placeholder="Type to search medicines..."
                              className="pr-8"
                              value={medicineSearchTerm}
                              onChange={handleMedicineSearchChange}
                            />
                            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            {isSearchingMedicines && (
                              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              </div>
                            )}
                          </div>
                          {/* Medicine suggestions dropdown */}
                          {showMedicineDropdown && medicineSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {medicineSuggestions.map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleMedicineSelect(medicine)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{medicine.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {medicine.generic_name && `${medicine.generic_name} • `}
                                        {medicine.brand_name && `${medicine.brand_name} • `}
                                        {medicine.strength && `${medicine.strength} • `}
                                        {medicine.dosage_form}
                                      </div>
                                    </div>
                                    <div className="text-xs text-green-600 font-medium ml-2">
                                      {medicine.available_quantity} available
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {showMedicineDropdown && medicineSuggestions.length === 0 && !isSearchingMedicines && medicineSearchTerm.trim() && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                              No medicines found
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Quantity * {selectedMedicine && <span className="text-xs text-gray-500">(Max: {selectedMedicine.available_quantity})</span>}
                          </Label>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            className="mt-1"
                            min="1"
                            max={selectedMedicine?.available_quantity || undefined}
                            value={assignmentQuantity}
                            onChange={(e) => setAssignmentQuantity(e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mt-2">
                            Note: Batch number and expiry date will be auto-filled from available stock entries
                          </p>
                        </div>
                      </div>

                      {/* Selected Medicine Display */}
                      {selectedMedicine && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-blue-900">{selectedMedicine.name}</h4>
                              <p className="text-sm text-blue-700">
                                {selectedMedicine.generic_name} • {selectedMedicine.brand_name} • {selectedMedicine.strength} • {selectedMedicine.dosage_form}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Cost: NPR {selectedMedicine.cost_price} • Selling: NPR {selectedMedicine.selling_price}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMedicine(null);
                                setMedicineSearchTerm("");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={addMedicineToAssignment}>
                          <Plus size={14} className="mr-1" />
                          Add Medicine
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedMedicine(null);
                          setMedicineSearchTerm("");
                          setAssignmentQuantity("");
                          setMedicineSuggestions([]);
                          setShowMedicineDropdown(false);
                        }}>
                          Clear Form
                        </Button>
                      </div>

                      {/* Assigned Medicines List */}
                      {assignedMedicines.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-900">Medicines to Assign:</h4>
                          {assignedMedicines.map((item, index) => (
                            <div key={item.medicine.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.medicine.name}</div>
                                <div className="text-sm text-gray-600">
                                  {item.medicine.generic_name} • {item.medicine.brand_name} • Quantity: {item.quantity}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeMedicineFromAssignment(item.medicine.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assign All Button */}
                      {assignedMedicines.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              try {
                                // Find the actual section ID from the rack sections
                                const sectionData = selectedRack.sections?.find((s: any) =>
                                  s.row_number === selectedSection.row && s.column_number === selectedSection.col
                                );

                                if (!sectionData) {
                                  toast({
                                    title: "Error",
                                    description: "Section data not found",
                                    variant: "destructive"
                                  });
                                  return;
                                }

                                // For now, assign the first medicine (since backend only supports one medicine per section)
                                // TODO: Update backend to support multiple medicines per section
                                const firstMedicine = assignedMedicines[0];
                                const response = await inventoryAPI.assignMedicineToSection(sectionData.id, {
                                  medicine_id: firstMedicine.medicine.id,
                                  quantity: firstMedicine.quantity,
                                  batch_number: firstMedicine.medicine.batch_number || '',
                                  expiry_date: firstMedicine.medicine.expiry_date || null
                                });

                                if (response.success) {
                                  toast({
                                    title: "Success",
                                    description: `${assignedMedicines.length > 1 ? 'First medicine' : 'Medicine'} assigned to section successfully`
                                  });

                                  // Clear all assigned medicines
                                  setAssignedMedicines([]);

                                  // Refresh section data
                                  if (selectedRack) {
                                    const rackResponse = await inventoryAPI.getRackSections(selectedRack.id);
                                    if (rackResponse.success) {
                                      setSelectedRack({
                                        ...selectedRack,
                                        sections: rackResponse.data || []
                                      });
                                      // Update the selected section with the new data
                                      const updatedSection = rackResponse.data?.find((s: any) =>
                                        s.row_number === selectedSection.row && s.column_number === selectedSection.col
                                      );
                                      if (updatedSection) {
                                        setSelectedSection(updatedSection);
                                      }
                                    }
                                  }
                                } else {
                                  toast({
                                    title: "Error",
                                    description: response.message || "Failed to assign medicine",
                                    variant: "destructive"
                                  });
                                }
                              } catch (error) {
                                console.error('Failed to assign medicine:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to assign medicine to section",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Plus size={16} className="mr-2" />
                            Assign {assignedMedicines.length} Medicine{assignedMedicines.length > 1 ? 's' : ''} to Section
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medicines Table */}
                  {selectedSection.medicines && selectedSection.medicines.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Medicines in This Section</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medicine</TableHead>
                              <TableHead>Batch</TableHead>
                              <TableHead>Expiry</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Cost Price</TableHead>
                              <TableHead>Selling Price</TableHead>
                              <TableHead>Total Value</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedSection.medicines.map((medicine: any) => {
                              const expiryDate = new Date(medicine.expiryDate);
                              const today = new Date();
                              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                              const isExpired = daysUntilExpiry <= 0;

                              return (
                                <TableRow key={medicine.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{medicine.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {medicine.genericName} • {medicine.brandName}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {medicine.strength} • {medicine.dosageForm} • {medicine.packSize}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{medicine.batchNumber}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                                      {expiryDate.toLocaleDateString()}
                                      {isExpired && <div className="text-xs">EXPIRED</div>}
                                      {isExpiringSoon && !isExpired && <div className="text-xs">{daysUntilExpiry} days</div>}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{medicine.quantity}</TableCell>
                                  <TableCell>NPR {medicine.costPrice.toLocaleString()}</TableCell>
                                  <TableCell>NPR {medicine.sellingPrice.toLocaleString()}</TableCell>
                                  <TableCell className="font-medium">
                                    NPR {(medicine.quantity * medicine.costPrice).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      medicine.quantity <= 10 ? 'destructive' :
                                      medicine.quantity <= 25 ? 'secondary' : 'default'
                                    }>
                                      {medicine.quantity <= 10 ? 'Low Stock' :
                                       medicine.quantity <= 25 ? 'Medium' : 'Good'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="outline">
                                        <Edit size={12} />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-600">
                                        <Trash2 size={12} />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Summary */}
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Items:</span>
                            <span className="ml-2 font-medium">{selectedSection.medicines.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Quantity:</span>
                            <span className="ml-2 font-medium">
                              {selectedSection.medicines.reduce((sum: number, med: any) => sum + med.quantity, 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Value:</span>
                            <span className="ml-2 font-medium">
                              NPR {selectedSection.medicines.reduce((sum: number, med: any) => sum + (med.quantity * med.costPrice), 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Low Stock Items:</span>
                            <span className="ml-2 font-medium">
                              {selectedSection.medicines.filter((med: any) => med.quantity <= 10).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Archive size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>This section is currently empty</p>
                      <p className="text-sm">Assign medicines to this section using the form above</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSectionDetailDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  // TODO: Implement medicine assignment to section
                  toast({
                    title: "Coming Soon",
                    description: "Medicine assignment to rack sections will be implemented next",
                  });
                }}>
                  <Plus size={16} className="mr-2" />
                  Assign Medicine
                </Button>
                {selectedSection?.medicines && selectedSection.medicines.length > 0 && (
                  <Button variant="outline">
                    <Edit size={16} className="mr-2" />
                    Edit Section
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <div className="flex items-center">
                  <Settings className="mr-2 text-primary" size={20} />
                  Product Categories
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }}>
                      <Plus size={16} className="mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Update category information' : 'Create a new product category'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-name" className="text-right">Name</Label>
                        <Input
                          id="category-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-description" className="text-right">Description</Label>
                        <Textarea
                          id="category-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          className="col-span-3"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-parent" className="text-right">Parent Category</Label>
                        <Select value={categoryForm.parent || "none"} onValueChange={(value) => setCategoryForm({...categoryForm, parent: value === "none" ? "" : value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories.filter(c => c.id !== editingCategory?.id).map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={categoryForm.is_active}
                            onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                        {editingCategory ? 'Update' : 'Add'} Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.parent ? categories.find(c => c.id === category.parent)?.name : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                              <Edit size={12} className="mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 size={12} className="mr-1" />
                              Delete
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

        <TabsContent value="manufacturers" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <div className="flex items-center">
                  <Settings className="mr-2 text-primary" size={20} />
                  Manufacturers
                </div>
                <Dialog open={isManufacturerDialogOpen} onOpenChange={setIsManufacturerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetManufacturerForm()}>
                      <Plus size={16} className="mr-2" />
                      Add Manufacturer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Manufacturer</DialogTitle>
                      <DialogDescription>
                        Create a new medication manufacturer/supplier
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-name" className="text-right">Name *</Label>
                        <Input
                          id="manufacturer-name"
                          value={manufacturerForm.name}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-contact" className="text-right">Contact Person</Label>
                        <Input
                          id="manufacturer-contact"
                          value={manufacturerForm.contact_person}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, contact_person: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-phone" className="text-right">Phone</Label>
                        <Input
                          id="manufacturer-phone"
                          value={manufacturerForm.phone}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, phone: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-email" className="text-right">Email</Label>
                        <Input
                          id="manufacturer-email"
                          type="email"
                          value={manufacturerForm.email}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-address" className="text-right">Address</Label>
                        <Textarea
                          id="manufacturer-address"
                          value={manufacturerForm.address}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, address: e.target.value})}
                          className="col-span-3"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-website" className="text-right">Website</Label>
                        <Input
                          id="manufacturer-website"
                          value={manufacturerForm.website}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, website: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manufacturer-license" className="text-right">License Number</Label>
                        <Input
                          id="manufacturer-license"
                          value={manufacturerForm.license_number}
                          onChange={(e) => setManufacturerForm({...manufacturerForm, license_number: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Active</Label>
                        <div className="col-span-3">
                          <Switch
                            checked={manufacturerForm.is_active}
                            onCheckedChange={(checked) => setManufacturerForm({...manufacturerForm, is_active: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsManufacturerDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddManufacturer}>
                        Add Manufacturer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturers.map((manufacturer) => (
                      <TableRow key={manufacturer.id}>
                        <TableCell className="font-medium">{manufacturer.name}</TableCell>
                        <TableCell>{manufacturer.contact_person || '-'}</TableCell>
                        <TableCell>{manufacturer.phone || '-'}</TableCell>
                        <TableCell>{manufacturer.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={manufacturer.is_active ? "default" : "secondary"}>
                            {manufacturer.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}