import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown, Building2, RotateCcw, Clock, Calendar, MapPin, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';



export default function StockManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user's branch
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userBranchId = currentUser?.branch_id;

  // Form states
  const [globalSupplier, setGlobalSupplier] = useState({
    name: "",
    contact: ""
  });
  
  const [items, setItems] = useState([{
    id: 1,
    medicineId: "",
    medicineName: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    unit: "pieces",
    packSize: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    rackId: "",
    rackName: "",
    sectionId: "",
    sectionName: ""
  }]);

  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medicineSuggestions, setMedicineSuggestions] = useState({});
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState({});
  const [medicineSearchTerm, setMedicineSearchTerm] = useState({});

  // Rack and section management
  const [racks, setRacks] = useState([]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState({});
  const [rackSectionsMap, setRackSectionsMap] = useState({});
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [currentItemForSection, setCurrentItemForSection] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Payment tracking states
  const [paymentDetails, setPaymentDetails] = useState({
    totalAmount: 0,
    paidAmount: 0,
    creditAmount: 0,
    paymentMethod: 'cash', // cash, credit, partial
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);

  // Bulk upload states
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [bulkUploadData, setBulkUploadData] = useState({
    supplier_name: '',
    supplier_contact: '',
    supplier_id: null,
    supplier_type: 'custom',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    paid_amount: '',
    notes: '',
    file: null
  });
  const [bulkUploadProgress, setBulkUploadProgress] = useState({
    uploading: false,
    completed: false,
    created_count: 0,
    errors: [],
    transaction_number: ''
  });
  const [showBulkSupplierSuggestions, setBulkSupplierSuggestions] = useState(false);

  // Update payment total when items change
  useEffect(() => {
    const total = getTotalAmount();
    setPaymentDetails(prev => ({
      ...prev,
      totalAmount: total,
      paidAmount: prev.paidAmount || total,
      creditAmount: Math.max(0, total - (prev.paidAmount || total))
    }));
  }, [items]);

  // Fetch inventory data (branch-specific)
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const url = userBranchId
        ? `${API_BASE_URL}/inventory/inventory-items/?branch_id=${userBranchId}`
        : `${API_BASE_URL}/inventory/inventory-items/`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.medicine?.category?.name).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch racks for the user's branch
  const fetchRacks = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/racks/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRacks(data);
      }
    } catch (error) {
      console.error('Error fetching racks:', error);
    }
  };

  // Fetch sections for selected rack
  const fetchRackSections = async (rackId) => {
    console.log('=== FETCH RACK SECTIONS DEBUG ===');
    console.log('Fetching sections for rackId:', rackId);

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('Token available:', !!token);

      const response = await fetch(`${API_BASE_URL}/inventory/racks/${rackId}/sections/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Raw sections data:', data);

        // Store sections in map for future use
        setRackSectionsMap(prev => ({
          ...prev,
          [rackId]: data
        }));

        // Show all sections (both occupied and empty) for stock management
        console.log('All sections:', data);
        console.log('Setting availableSections to all sections:', data);

        setAvailableSections(data);

        // Force update the UI
        setTimeout(() => {
          console.log('Forcing UI update after setting sections');
        }, 100);
      } else {
        console.error('Failed to fetch sections, response:', response);
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        setAvailableSections([]);
      }
    } catch (error) {
      console.error('Error fetching rack sections:', error);
      setAvailableSections([]);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/purchase-history/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPurchaseHistory(data);
      }
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchPurchaseHistory();
    fetchRacks();
  }, []);

  const getTotalAmount = () => {
    return items.reduce((total, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.costPrice) || 0;
      return total + (qty * price);
    }, 0);
  };

  const getTotalItems = () => {
    return items.filter(item => item.medicineName && item.quantity && item.costPrice).length;
  };

  const searchSuppliers = async (query) => {
    if (query.length < 2) {
      setSupplierSuggestions([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const url = userBranchId 
        ? `${API_BASE_URL}/inventory/suppliers/search/?q=${encodeURIComponent(query)}&branch_id=${userBranchId}`
        : `${API_BASE_URL}/inventory/suppliers/search/?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('Supplier search response status:', response.status);
      
      if (!response.ok) {
        console.error('Supplier search failed:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text);
        setSupplierSuggestions([]);
        return;
      }
      
      const data = await response.json();
      console.log('Supplier search data:', data);
      setSupplierSuggestions(data);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      setSupplierSuggestions([]);
    }
  };

  const searchMedicines = async (query, itemId) => {
    console.log(`Medicine search called with query: '${query}', itemId: ${itemId}`);
    
    if (query.length < 2) {
      console.log('Query too short, clearing suggestions');
      setMedicineSuggestions(prev => ({ ...prev, [itemId]: [] }));
      return;
    }
    
    try {
      console.log('Making API call to medicine search');
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('Token found:', token ? 'Yes' : 'No');
      const response = await fetch(`${API_BASE_URL}/inventory/medicines/search/?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('Medicine search response status:', response.status);
      
      if (!response.ok) {
        console.error('Medicine search failed:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text);
        setMedicineSuggestions(prev => ({ ...prev, [itemId]: [] }));
        return;
      }
      
      const data = await response.json();
      console.log('Medicine search data:', data);
      setMedicineSuggestions(prev => ({ ...prev, [itemId]: data }));
    } catch (error) {
      console.error('Error searching medicines:', error);
      setMedicineSuggestions(prev => ({ ...prev, [itemId]: [] }));
    }
  };

  const addNewRow = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, {
      id: newId,
      medicineId: "",
      medicineName: "",
      quantity: "",
      costPrice: "",
      sellingPrice: "",
      unit: "pieces",
      packSize: "",
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      rackId: "",
      rackName: "",
      sectionId: "",
      sectionName: ""
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Handle rack selection
  const handleRackChange = (itemId, rackId) => {
    console.log('=== RACK CHANGE DEBUG ===');
    console.log('itemId:', itemId);
    console.log('rackId:', rackId);

    const selectedRack = racks.find(rack => rack.id.toString() === rackId);
    console.log('selectedRack:', selectedRack);

    // Update the specific item with rack info
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? {
        ...item,
        rackId: rackId,
        rackName: selectedRack?.name || '',
        sectionId: '', // Reset section when rack changes
        sectionName: ''
      } : item
    ));

    if (rackId) {
      console.log('Rack selected, checking sections...');
      // Check if we already have sections for this rack
      if (rackSectionsMap[rackId]) {
        console.log('Sections already cached for rack:', rackId);
        // Show all sections (both occupied and empty) for stock management
        console.log('All sections:', rackSectionsMap[rackId]);
        setAvailableSections(rackSectionsMap[rackId]);
      } else {
        console.log('Fetching sections for rack:', rackId);
        // Fetch sections for this rack
        fetchRackSections(rackId);
      }
    } else {
      console.log('No rack selected, clearing sections');
      setAvailableSections([]);
    }

    // Force re-render by updating state
    setSelectedRack(selectedRack);
  };

  // Force update available sections when rackSectionsMap changes
  useEffect(() => {
    if (selectedRack && rackSectionsMap[selectedRack.id]) {
      const allSections = rackSectionsMap[selectedRack.id];
      console.log('=== USE EFFECT UPDATE ===');
      console.log('selectedRack:', selectedRack);
      console.log('Setting availableSections from useEffect:', allSections);
      setAvailableSections(allSections);
    }
  }, [rackSectionsMap, selectedRack]);

  // Handle section selection
  const handleSectionChange = (itemId, sectionId) => {
    const selectedSection = availableSections.find(section => section.id.toString() === sectionId);
    setItems(prevItems => prevItems.map(item =>
      item.id === itemId ? {
        ...item,
        sectionId: sectionId,
        sectionName: selectedSection?.section_name || ''
      } : item
    ));
  };

  // Open section selection modal
  const openSectionModal = (item) => {
    setCurrentItemForSection(item);
    setIsSectionModalOpen(true);
  };

  // Handle section selection from modal
  const handleSectionSelect = (section) => {
    if (currentItemForSection) {
      // Check if this is for location management modal
      if (selectedItem && selectedItem.batches) {
        const updatedBatches = selectedItem.batches.map((batch: any) =>
          batch.id === currentItemForSection.id ? {
            ...batch,
            newSectionId: section.id.toString(),
            newSectionName: section.section_name
          } : batch
        );
        setSelectedItem({...selectedItem, batches: updatedBatches});
      } else {
        // For stock management form
        setItems(prevItems => prevItems.map(item =>
          item.id === currentItemForSection.id ? {
            ...item,
            sectionId: section.id.toString(),
            sectionName: section.section_name
          } : item
        ));
      }
    }
    setIsSectionModalOpen(false);
    setCurrentItemForSection(null);
  };

  // Calculate today for expiry filtering
  const today = new Date();

  // Group and filter inventory by medicine
  const medicineGroups = {};
  inventory.forEach(item => {
    const medicineId = item.medicine?.id;
    if (!medicineId) return;

    if (!medicineGroups[medicineId]) {
      medicineGroups[medicineId] = {
        id: medicineId,
        medicine: item.medicine,
        total_stock: 0,
        min_stock: item.min_stock || 10,
        max_stock: item.max_stock || 1000,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        supplier_name: item.supplier_name,
        batches: [],
        earliest_expiry: null
      };
    }

    medicineGroups[medicineId].total_stock += item.current_stock || 0;
    medicineGroups[medicineId].batches.push(item);

    // Track earliest expiry date
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date);
      if (!medicineGroups[medicineId].earliest_expiry || expiryDate < medicineGroups[medicineId].earliest_expiry) {
        medicineGroups[medicineId].earliest_expiry = expiryDate;
      }
    }
  });
  
  const groupedMedicines = Object.values(medicineGroups);
  
  const filteredInventory = groupedMedicines.filter(item => {
    const medicineName = item.medicine?.name || '';
    const categoryName = item.medicine?.category?.name || '';
    
    const matchesSearch = medicineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || categoryName === filterCategory;
    const matchesStock = stockFilter === "all" || 
      (stockFilter === "low" && item.total_stock <= item.min_stock) ||
      (stockFilter === "normal" && item.total_stock > item.min_stock && item.total_stock < item.max_stock) ||
      (stockFilter === "high" && item.total_stock >= item.max_stock);
    
    // Expiry filter logic based on earliest expiry
    const matchesExpiry = expiryFilter === "all" || (() => {
      if (!item.earliest_expiry) return false;
      const daysToExpiry = Math.ceil((item.earliest_expiry - today) / (1000 * 60 * 60 * 24));
      
      if (expiryFilter === "critical") return daysToExpiry <= 7 && daysToExpiry >= 0;
      if (expiryFilter === "high_risk") return daysToExpiry <= 30 && daysToExpiry > 7;
      if (expiryFilter === "expired") return daysToExpiry < 0;
      return true;
    })();
    
    return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
  });

  const getStockStatus = (item) => {
    const currentStock = item.total_stock || 0;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || 999;
    
    if (currentStock <= minStock) return { status: "Low Stock", variant: "destructive", icon: TrendingDown };
    if (currentStock >= maxStock) return { status: "Overstock", variant: "secondary", icon: TrendingUp };
    return { status: "Normal", variant: "default", icon: Package };
  };

  const handleStockUpdate = (item, adjustment) => {
    toast({
      title: "Stock Updated",
      description: `${item.name} stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)}`,
    });
  };

  // Group inventory by medicine for proper statistics
  const statsGroups = {};
  inventory.forEach(item => {
    const medicineId = item.medicine?.id;
    if (!medicineId) return;
    
    if (!statsGroups[medicineId]) {
      statsGroups[medicineId] = {
        medicine: item.medicine,
        total_stock: 0,
        total_value: 0,
        min_stock: item.min_stock || 10,
        batches: []
      };
    }
    
    statsGroups[medicineId].total_stock += item.current_stock || 0;
    statsGroups[medicineId].total_value += (item.current_stock || 0) * (item.cost_price || 0);
    statsGroups[medicineId].batches.push(item);
  });
  
  const uniqueMedicines = Object.values(statsGroups);
  const totalItems = uniqueMedicines.length;
  const lowStockItems = uniqueMedicines.filter(med => med.total_stock <= med.min_stock).length;
  const totalValue = uniqueMedicines.reduce((sum, med) => sum + med.total_value, 0);
  
  // Calculate expiry-based metrics from individual batches
  const criticalItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 7 && daysToExpiry >= 0;
  });
  
  const highRiskItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 30 && daysToExpiry > 7;
  });
  
  const valueAtRisk = [...criticalItems, ...highRiskItems].reduce((sum, item) => 
    sum + ((item.current_stock || 0) * (item.cost_price || 0)), 0
  );

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleRestock = (item) => {
    setRestockItem(item);
    // Pre-fill form with existing item data
    setGlobalSupplier({ name: item.supplier_name || '', contact: '' });
    setItems([{
      id: 1,
      medicineId: item.medicine.id,
      medicineName: item.medicine.name,
      quantity: '',
      costPrice: '',
      sellingPrice: item.selling_price || '',
      unit: item.unit || 'pieces',
      packSize: '',
      batchNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      location: item.location || ''  // Auto-fill location from previous item
    }]);
    setMedicineSearchTerm({ 1: item.medicine.name });
    setIsRestockDialogOpen(true);
  };

  // Download template function
  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/inventory/download-template/`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'inventory_upload_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Template downloaded successfully",
        });
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  // Bulk upload handler
  const handleBulkUpload = async () => {
    if (!bulkUploadData.supplier_name || !bulkUploadData.file) {
      toast({
        title: "Error",
        description: "Please provide supplier name and select a file",
        variant: "destructive",
      });
      return;
    }

    setBulkUploadProgress({ ...bulkUploadProgress, uploading: true });

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('file', bulkUploadData.file);
      formData.append('supplier_name', bulkUploadData.supplier_name);
      formData.append('supplier_contact', bulkUploadData.supplier_contact);
      if (bulkUploadData.supplier_id) {
        formData.append('supplier_id', bulkUploadData.supplier_id);
      }
      formData.append('supplier_type', bulkUploadData.supplier_type);
      formData.append('payment_method', bulkUploadData.payment_method);
      formData.append('payment_date', bulkUploadData.payment_date);
      if (bulkUploadData.paid_amount) {
        formData.append('paid_amount', bulkUploadData.paid_amount);
      }
      formData.append('notes', bulkUploadData.notes);
      
      const response = await fetch(`${API_BASE_URL}/inventory/inventory/bulk-upload/`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBulkUploadProgress({
          uploading: false,
          completed: true,
          created_count: data.created_count,
          errors: data.errors || [],
          transaction_number: data.transaction_number
        });
        
        toast({
          title: "Success",
          description: data.message,
        });
        
        // Refresh inventory and purchase history
        fetchInventory();
        fetchPurchaseHistory();
        
        // Reset form after successful upload
        setTimeout(() => {
          setBulkUploadData({
            supplier_name: '',
            supplier_contact: '',
            supplier_id: null,
            supplier_type: 'custom',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            paid_amount: '',
            notes: '',
            file: null
          });
          setBulkSupplierSuggestions(false);
        }, 3000);
        
      } else {
        setBulkUploadProgress({
          uploading: false,
          completed: true,
          created_count: 0,
          errors: [data.error || 'Upload failed'],
          transaction_number: ''
        });
        
        toast({
          title: "Error",
          description: data.error || "Failed to upload inventory",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading bulk inventory:', error);
      setBulkUploadProgress({
        uploading: false,
        completed: true,
        created_count: 0,
        errors: ['Network error or file processing failed'],
        transaction_number: ''
      });
      
      toast({
        title: "Error",
        description: "Failed to upload inventory",
        variant: "destructive",
      });
    }
  };

  const handleSaveStock = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const validItems = items.filter(item => item.medicineName && item.quantity && item.costPrice);
      
      for (const item of validItems) {
        const payload = {
          medicine: item.medicineId,
          supplier_name: globalSupplier.name,
          supplier_contact: globalSupplier.contact,
          quantity: parseInt(item.quantity),
          cost_price: parseFloat(item.costPrice),
          selling_price: parseFloat(item.sellingPrice) || parseFloat(item.costPrice),
          batch_number: item.batchNumber,
          manufacturing_date: item.manufacturingDate,
          expiry_date: item.expiryDate,
        };
        
        const response = await fetch(`${API_BASE_URL}/inventory/create-inventory-item/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create inventory item: ${response.statusText}`);
        }
      }
      
      toast({
        title: "Success",
        description: `${validItems.length} item(s) added to inventory successfully`,
      });
      
      // Reset form and close dialog
      setGlobalSupplier({ name: "", contact: "" });
      setItems([{
        id: 1,
        medicineId: "",
        medicineName: "",
        quantity: "",
        costPrice: "",
        sellingPrice: "",
        unit: "pieces",
        packSize: "",
        batchNumber: "",
        manufacturingDate: "",
        expiryDate: "",
        rackId: "",
        rackName: "",
        sectionId: "",
        sectionName: ""
      }]);
      setIsAddDialogOpen(false);
      
      // Refresh inventory
      fetchInventory();
      
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock items",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPurchaseHistory(true)}>
            <Clock size={16} className="mr-2" />
            Purchase History
          </Button>
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Inventory</DialogTitle>
                <DialogDescription>
                  Upload multiple inventory items from Excel or CSV file
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Supplier Information */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="text-sm font-medium mb-3">Supplier Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Label>Supplier Name *</Label>
                      <Input
                        value={bulkUploadData.supplier_name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkUploadData({...bulkUploadData, supplier_name: value, supplier_id: null, supplier_type: 'custom'});
                          if (value.length >= 2) {
                            searchSuppliers(value);
                            setBulkSupplierSuggestions(true);
                          } else {
                            setBulkSupplierSuggestions(false);
                          }
                        }}
                        onFocus={() => {
                          if (bulkUploadData.supplier_name.length >= 2) {
                            setBulkSupplierSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setBulkSupplierSuggestions(false);
                          }, 300);
                        }}
                        placeholder="Search or enter supplier name"
                      />
                      {showBulkSupplierSuggestions && supplierSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                          {supplierSuggestions.map(supplier => (
                            <div
                              key={`${supplier.type}-${supplier.id}`}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setBulkUploadData({
                                  ...bulkUploadData,
                                  supplier_name: supplier.name, 
                                  supplier_contact: supplier.contact,
                                  supplier_id: supplier.id,
                                  supplier_type: supplier.type
                                });
                                setBulkSupplierSuggestions(false);
                              }}
                            >
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-gray-500 text-xs">{supplier.contact}</div>
                              <div className="text-xs text-blue-500">{supplier.type === 'user' ? 'Supplier User' : 'Custom'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <Input
                        value={bulkUploadData.supplier_contact}
                        onChange={(e) => setBulkUploadData({...bulkUploadData, supplier_contact: e.target.value})}
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="text-sm font-medium mb-3">Payment Information</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={bulkUploadData.payment_method} onValueChange={(value) => setBulkUploadData({...bulkUploadData, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={bulkUploadData.payment_date}
                        onChange={(e) => setBulkUploadData({...bulkUploadData, payment_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Paid Amount (Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bulkUploadData.paid_amount}
                        onChange={(e) => setBulkUploadData({...bulkUploadData, paid_amount: e.target.value})}
                        placeholder="Leave empty for full payment"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Notes</Label>
                    <Textarea
                      value={bulkUploadData.notes}
                      onChange={(e) => setBulkUploadData({...bulkUploadData, notes: e.target.value})}
                      placeholder="Additional notes about this purchase"
                      rows={2}
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Upload File *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </Button>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setBulkUploadData({...bulkUploadData, file: e.target.files[0]})}
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
                  </p>
                </div>

                {/* Upload Progress */}
                {bulkUploadProgress.uploading && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Processing file...</span>
                    </div>
                  </div>
                )}

                {/* Upload Results */}
                {bulkUploadProgress.completed && (
                  <div className="space-y-2">
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="text-sm font-medium text-green-800">Upload Completed</h5>
                      <p className="text-sm text-green-700">
                        Successfully created {bulkUploadProgress.created_count} items
                      </p>
                      {bulkUploadProgress.transaction_number && (
                        <p className="text-xs text-green-600">
                          Transaction: {bulkUploadProgress.transaction_number}
                        </p>
                      )}
                    </div>
                    {bulkUploadProgress.errors && bulkUploadProgress.errors.length > 0 && (
                      <div className="bg-red-50 p-3 rounded max-h-32 overflow-y-auto">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
                        {bulkUploadProgress.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-700">{error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsBulkUploadDialogOpen(false);
                  setBulkUploadProgress({ uploading: false, completed: false, created_count: 0, errors: [], transaction_number: '' });
                  setBulkUploadData({
                    supplier_name: '',
                    supplier_contact: '',
                    supplier_id: null,
                    supplier_type: 'custom',
                    payment_method: 'cash',
                    payment_date: new Date().toISOString().split('T')[0],
                    paid_amount: '',
                    notes: '',
                    file: null
                  });
                }}>
                  {bulkUploadProgress.completed ? 'Close' : 'Cancel'}
                </Button>
                {!bulkUploadProgress.completed && (
                  <Button 
                    onClick={handleBulkUpload}
                    disabled={!bulkUploadData.supplier_name || !bulkUploadData.file || bulkUploadProgress.uploading}
                  >
                    {bulkUploadProgress.uploading ? 'Uploading...' : 'Upload Inventory'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={20} className="mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new medicine or product to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col h-[75vh]">
              {/* Compact Supplier Section */}
              <div className="bg-gray-50 p-2 rounded mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      value={globalSupplier.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setGlobalSupplier({...globalSupplier, name: value, id: null, type: 'custom'});
                        if (value.length >= 2) {
                          searchSuppliers(value);
                          setShowSuggestions(true);
                        } else {
                          setShowSuggestions(false);
                        }
                      }}
                      onFocus={() => {
                        if (globalSupplier.name.length >= 2) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowSuggestions(false);
                        }, 300);
                      }}
                      placeholder="Supplier Name *"
                      className="text-sm h-8"
                    />
                    {showSuggestions && supplierSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                        {supplierSuggestions.map(supplier => (
                          <div
                            key={`${supplier.type}-${supplier.id}`}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setGlobalSupplier({
                                name: supplier.name, 
                                contact: supplier.contact,
                                id: supplier.id,
                                type: supplier.type
                              });
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-gray-500">{supplier.contact}</div>
                            <div className="text-xs text-blue-500">{supplier.type === 'user' ? 'Supplier User' : 'Custom'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    value={globalSupplier.contact}
                    onChange={(e) => setGlobalSupplier({...globalSupplier, contact: e.target.value})}
                    placeholder="Contact"
                    className="text-sm h-8"
                  />
                </div>
              </div>

              {/* Items Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Items</div>
                <Button type="button" variant="outline" size="sm" onClick={addNewRow} className="h-7 px-2">
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </div>
              
              {/* Scrollable Items Section */}
              <div className="flex-1 overflow-y-auto border rounded p-2 mb-2">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded bg-white">
                      <div className="col-span-2 relative">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Medicine Name *</div>}
                        <input
                          type="text"
                          value={medicineSearchTerm[item.id] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMedicineSearchTerm(prev => ({ ...prev, [item.id]: value }));
                            if (value.length >= 2) {
                              searchMedicines(value, item.id);
                              setShowMedicineSuggestions(prev => ({ ...prev, [item.id]: true }));
                            } else {
                              setShowMedicineSuggestions(prev => ({ ...prev, [item.id]: false }));
                            }
                          }}
                          placeholder="Search medicine..."
                          style={{
                            width: '100%',
                            height: '28px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            outline: 'none'
                          }}
                        />
                        {showMedicineSuggestions[item.id] && medicineSuggestions[item.id]?.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                            {medicineSuggestions[item.id].map(medicine => (
                              <div
                                key={medicine.id}
                                className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                                onClick={() => {
                                  console.log('Selected medicine:', medicine);
                                  console.log('Medicine unit:', medicine.unit);
                                  
                                  setItems(prevItems => prevItems.map(prevItem => 
                                    prevItem.id === item.id ? {
                                      ...prevItem,
                                      medicineName: medicine.name,
                                      medicineId: medicine.id,
                                      unit: medicine.unit || 'pieces',
                                      packSize: medicine.pack_size || '',
                                      costPrice: medicine.cost_price || '',
                                      sellingPrice: medicine.selling_price || ''
                                    } : prevItem
                                  ));
                                  
                                  setMedicineSearchTerm(prev => ({ ...prev, [item.id]: medicine.name }));
                                  setShowMedicineSuggestions(prev => ({ ...prev, [item.id]: false }));
                                  console.log('Updated item unit to:', medicine.unit);
                                }}
                              >
                                <div className="font-medium">{medicine.name}</div>
                                <div className="text-gray-500">{medicine.strength} - {medicine.dosage_form}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Qty *</div>}
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          placeholder="0"
                          className="text-xs h-7"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Unit</div>}
                        <input
                          key={`unit-${item.id}-${item.unit}`}
                          type="text"
                          value={item.unit}
                          readOnly
                          style={{
                            width: '100%',
                            height: '28px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280'
                          }}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Cost *</div>}
                        <input
                          type="number"
                          step="0.01"
                          value={item.costPrice}
                          onChange={(e) => updateItem(item.id, 'costPrice', e.target.value)}
                          placeholder="0.00"
                          style={{
                            width: '100%',
                            height: '28px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px'
                          }}
                        />
                        {item.quantity && item.costPrice && (
                          <div className="text-xs text-gray-500 mt-1">
                            Total: NPR {(parseFloat(item.quantity) * parseFloat(item.costPrice)).toFixed(2)}
                          </div>
                        )}
                        {item.packSize && (
                          <div className="text-xs text-blue-600 mt-1">
                            1 {item.unit} = {item.packSize} pieces
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">SP</div>}
                        <Input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(item.id, 'sellingPrice', e.target.value)}
                          placeholder="0"
                          className="text-xs h-7"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Batch *</div>}
                        <Input
                          value={item.batchNumber}
                          onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)}
                          placeholder="Batch"
                          className="text-xs h-7"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Mfg Date *</div>}
                        <input
                          type="date"
                          value={item.manufacturingDate}
                          onChange={(e) => updateItem(item.id, 'manufacturingDate', e.target.value)}
                          style={{
                            width: '100%',
                            height: '28px',
                            padding: '2px 4px',
                            fontSize: '11px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Exp Date *</div>}
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)}
                          style={{
                            width: '100%',
                            height: '28px',
                            padding: '2px 4px',
                            fontSize: '11px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px'
                          }}
                        />
                      </div>

                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Rack</div>}
                        <Select value={item.rackId || ""} onValueChange={(value) => handleRackChange(item.id, value)}>
                          <SelectTrigger className="text-xs h-7">
                            <SelectValue placeholder="Select rack" />
                          </SelectTrigger>
                          <SelectContent>
                            {racks.map(rack => (
                              <SelectItem key={rack.id} value={rack.id.toString()}>
                                {rack.name} ({rack.rows}×{rack.columns})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Section</div>}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openSectionModal(item)}
                          disabled={!item.rackId}
                          className="text-xs h-7 w-full"
                        >
                          {item.sectionName || "Select Section"}
                        </Button>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Del</div>}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="h-7 w-7 p-0 ml-0"
                        >
                          <Trash2 size={10} />
                        </Button>
                      </div>

                      <div className="col-span-1">
                        {index === 0 && <div className="text-xs text-gray-500 mb-1">Stored Location</div>}
                        <div className="text-xs text-center">
                          {item.rackName && item.sectionName ? (
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-800">
                              ✅ {item.rackName}-{item.sectionName}
                            </Badge>
                          ) : (
                            <span className="text-red-400 text-xs">⚠️ Not assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Section */}
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Payment Details</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Total Amount</Label>
                    <Input
                      type="number"
                      value={getTotalAmount().toFixed(2)}
                      disabled
                      className="text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paid Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentDetails.paidAmount}
                      onChange={(e) => {
                        const paid = parseFloat(e.target.value) || 0;
                        const total = getTotalAmount();
                        setPaymentDetails(prev => ({
                          ...prev,
                          paidAmount: paid,
                          creditAmount: Math.max(0, total - paid),
                          paymentMethod: paid >= total ? 'cash' : paid > 0 ? 'partial' : 'credit'
                        }));
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Credit/Due</Label>
                    <Input
                      type="number"
                      value={(getTotalAmount() - paymentDetails.paidAmount).toFixed(2)}
                      disabled
                      className="text-xs bg-red-50 text-red-600 font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <Select value={paymentDetails.paymentMethod} onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash Payment</SelectItem>
                        <SelectItem value="credit">Credit (Pay Later)</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Payment Date</Label>
                    <Input
                      type="date"
                      value={paymentDetails.paymentDate}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentDate: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
              
              {/* Purchase Summary */}
              <div className="bg-gray-50 p-2 rounded">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-1 font-medium">{getTotalItems()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-1 font-medium">NPR {getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Supplier:</span>
                    <span className="ml-1 font-medium text-xs">{globalSupplier.name || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                console.log('\n=== FRONTEND INVENTORY CREATE DEBUG ===');
                console.log('Global supplier:', globalSupplier);
                console.log('All items:', items);
                console.log('Payment details:', paymentDetails);
                console.log('User branch ID:', userBranchId);
                
                if (!globalSupplier.name) {
                  console.log('ERROR: No supplier name provided');
                  toast({ title: "Error", description: "Please select a supplier", variant: "destructive" });
                  return;
                }
                
                const validItems = items.filter(item => 
                  item.medicineId && item.medicineName && item.quantity && item.costPrice && 
                  item.batchNumber && item.manufacturingDate && item.expiryDate
                );
                
                console.log('Valid items count:', validItems.length);
                console.log('Valid items:', validItems);
                
                if (validItems.length === 0) {
                  console.log('ERROR: No valid items found');
                  toast({ title: "Error", description: "Please fill in all required fields for at least one item", variant: "destructive" });
                  return;
                }
                
                const requestPayload = {
                  supplier: {
                    name: globalSupplier.name,
                    contact: globalSupplier.contact,
                    id: globalSupplier.id,
                    type: globalSupplier.type || 'custom'
                  },
                  branch_id: userBranchId,
                  items: validItems.map(item => ({
                    medicine_id: item.medicineId,
                    quantity: item.quantity,
                    unit: item.unit,
                    cost_price: item.costPrice,
                    selling_price: item.sellingPrice || null,
                    batch_number: item.batchNumber,
                    manufacturing_date: item.manufacturingDate,
                    expiry_date: item.expiryDate,
                    rackId: item.rackId,
                    sectionId: item.sectionId,
                    rackName: item.rackName,
                    sectionName: item.sectionName
                  })),
                  payment: paymentDetails
                };
                
                console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
                
                try {
                  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                  console.log('Token available:', token ? 'Yes' : 'No');
                  
                  const response = await fetch(`${API_BASE_URL}/inventory/inventory/create/`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    body: JSON.stringify(requestPayload)
                  });
                  
                  console.log('Response status:', response.status);
                  console.log('Response ok:', response.ok);
                  
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  if (response.ok) {
                    console.log('SUCCESS: Inventory created successfully');
                    console.log('Created items count:', data.created_items?.length || 0);
                    console.log('Errors count:', data.errors?.length || 0);
                    
                    setGlobalSupplier({name: "", contact: "", id: null, type: 'custom'});
                    setItems([{
                      id: 1,
                      medicineId: "",
                      medicineName: "",
                      quantity: "",
                      costPrice: "",
                      sellingPrice: "",
                      unit: "pieces",
                      batchNumber: "",
                      manufacturingDate: "",
                      expiryDate: ""
                    }]);
                    setPaymentDetails({ totalAmount: 0, paidAmount: 0, creditAmount: 0, paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
                    setIsAddDialogOpen(false);
                    toast({ title: "Success", description: data.message });
                    fetchInventory();
                    fetchPurchaseHistory();
                  } else {
                    console.log('ERROR: Failed to create inventory');
                    console.log('Error details:', data);
                    toast({ title: "Error", description: data.error || "Failed to create inventory items", variant: "destructive" });
                  }
                } catch (error) {
                  console.error('CRITICAL ERROR creating inventory items:', error);
                  toast({ title: "Error", description: "Failed to create inventory items", variant: "destructive" });
                }
              }}>
                Add Item
              </Button>
            </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold">{lowStockItems}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-bold">NPR {(totalValue/1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Stock Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-600">{criticalItems.length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-orange-600">{highRiskItems.length}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-600">NPR {(valueAtRisk/1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{criticalItems.length + highRiskItems.length}</p>
                <p className="text-xs text-muted-foreground">Expiring</p>
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
                  placeholder="Search medicines..."
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
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
                <SelectItem value="high">Overstock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="critical">Critical (≤ 7 days)</SelectItem>
                <SelectItem value="high_risk">High Risk (≤ 30 days)</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stored Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const StatusIcon = stockStatus.icon;
                    const firstBatch = item.batches[0]; // Use first batch for restock/edit

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.medicine?.name || 'N/A'}
                          {item.medicine?.strength && (
                            <div className="text-xs text-muted-foreground">
                              {item.medicine.strength} - {item.medicine.dosage_form}
                            </div>
                          )}
                          {item.batches.length > 1 && (
                            <div className="text-xs text-blue-600">
                              {item.batches.length} batches available
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.medicine?.category?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium">{item.total_stock || 0}</span>
                            <div className="text-xs text-muted-foreground">
                              Min: {item.min_stock || 0} | Max: {item.max_stock || 999}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any} className="flex items-center gap-1 w-fit">
                            <StatusIcon size={12} />
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>NPR {item.cost_price || 0}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsLocationModalOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="View/Manage Locations"
                          >
                            <MapPin size={16} className={item.batches?.some((b: any) => b.location) ? "text-green-600" : "text-gray-400"} />
                          </Button>
                        </TableCell>
                        <TableCell>{item.supplier_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestock(firstBatch)}
                              title="Restock this item"
                            >
                              <RotateCcw size={12} className="mr-1" />
                              Restock
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit size={12} className="mr-1" />
                              Manage Batches
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsLocationModalOpen(true);
                              }}
                              className="h-6 px-2 text-xs"
                              title="View Locations"
                            >
                              <MapPin size={12} className="mr-1" />
                              Locations
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Batch Management Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Batches - {selectedItem?.medicine?.name}</DialogTitle>
            <DialogDescription>
              Update selling prices and locations for individual batches
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Medicine Summary</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><span className="text-gray-600">Total Stock:</span> <span className="font-medium">{selectedItem.total_stock}</span></div>
                  <div><span className="text-gray-600">Batches:</span> <span className="font-medium">{selectedItem.batches?.length || 0}</span></div>
                  <div><span className="text-gray-600">Category:</span> <span className="font-medium">{selectedItem.medicine?.category?.name || 'N/A'}</span></div>
                  <div><span className="text-gray-600">Unit:</span> <span className="font-medium">{selectedItem.batches?.[0]?.unit || 'pieces'}</span></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Individual Batches</h4>
                {selectedItem.batches?.map((batch, index) => (
                  <div key={batch.id} className="border rounded p-3 bg-white">
                    <div className="grid grid-cols-6 gap-3 items-center">
                      <div>
                        <Label className="text-xs">Batch #{index + 1}</Label>
                        <div className="text-xs font-medium">{batch.batch_number}</div>
                        <div className="text-xs text-gray-500">Stock: {batch.current_stock}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Cost Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={batch.cost_price || 0}
                          disabled
                          className="text-xs bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Selling Price *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={batch.selling_price || 0}
                          onChange={(e) => {
                            const updatedBatches = selectedItem.batches.map(b => 
                              b.id === batch.id ? {...b, selling_price: parseFloat(e.target.value) || 0} : b
                            );
                            setSelectedItem({...selectedItem, batches: updatedBatches});
                          }}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Location</Label>
                        <Input
                          value={batch.location || ''}
                          onChange={(e) => {
                            const updatedBatches = selectedItem.batches.map(b => 
                              b.id === batch.id ? {...b, location: e.target.value} : b
                            );
                            setSelectedItem({...selectedItem, batches: updatedBatches});
                          }}
                          placeholder="e.g., A1-01"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Expiry Date</Label>
                        <div className="text-xs font-medium">{batch.expiry_date || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{batch.supplier_name || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Total Value</Label>
                        <div className="text-xs font-medium text-green-600">
                          NPR {((batch.selling_price || 0) * (batch.current_stock || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!selectedItem?.batches) return;
              
              try {
                const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                const updatePromises = selectedItem.batches.map(batch => 
                  fetch(`${API_BASE_URL}/inventory/inventory-items/${batch.id}/`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                      selling_price: batch.selling_price,
                      location: batch.location,
                      branch_id: userBranchId,
                    }),
                  })
                );
                
                const responses = await Promise.all(updatePromises);
                const allSuccessful = responses.every(response => response.ok);
                
                if (allSuccessful) {
                  toast({
                    title: "Success",
                    description: `Updated ${selectedItem.batches.length} batches successfully`,
                  });
                  setIsEditDialogOpen(false);
                  fetchInventory();
                } else {
                  toast({
                    title: "Partial Success",
                    description: "Some batches failed to update",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error('Error updating batches:', error);
                toast({
                  title: "Error",
                  description: "Failed to update batches",
                  variant: "destructive",
                });
              }
            }}>
              Save All Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restock Item - {restockItem?.medicine?.name}</DialogTitle>
            <DialogDescription>
              Add new stock for existing medicine with updated pricing and batch details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Supplier Section */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium mb-2">Supplier Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={globalSupplier.name}
                  onChange={(e) => setGlobalSupplier({...globalSupplier, name: e.target.value})}
                  placeholder="Supplier Name *"
                  className="text-sm"
                />
                <Input
                  value={globalSupplier.contact}
                  onChange={(e) => setGlobalSupplier({...globalSupplier, contact: e.target.value})}
                  placeholder="Contact"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Item Details */}
            <div className="border rounded p-3">
              <h4 className="text-sm font-medium mb-2">Item Details</h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs">Medicine</Label>
                  <Input value={items[0]?.medicineName || ''} disabled className="text-xs bg-gray-100" />
                </div>
                <div>
                  <Label className="text-xs">Quantity *</Label>
                  <Input
                    type="number"
                    value={items[0]?.quantity || ''}
                    onChange={(e) => updateItem(1, 'quantity', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cost Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={items[0]?.costPrice || ''}
                    onChange={(e) => updateItem(1, 'costPrice', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Selling Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={items[0]?.sellingPrice || ''}
                    onChange={(e) => updateItem(1, 'sellingPrice', e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Batch Number *</Label>
                  <Input
                    value={items[0]?.batchNumber || ''}
                    onChange={(e) => updateItem(1, 'batchNumber', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Manufacturing Date</Label>
                  <Input
                    type="date"
                    value={items[0]?.manufacturingDate || ''}
                    onChange={(e) => updateItem(1, 'manufacturingDate', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Expiry Date *</Label>
                  <Input
                    type="date"
                    value={items[0]?.expiryDate || ''}
                    onChange={(e) => updateItem(1, 'expiryDate', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={items[0]?.location || ''}
                    onChange={(e) => updateItem(1, 'location', e.target.value)}
                    placeholder="e.g., A1-01"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="text-sm font-medium mb-2">Payment Details</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Total Amount</Label>
                  <Input
                    type="number"
                    value={getTotalAmount().toFixed(2)}
                    disabled
                    className="text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs">Paid Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentDetails.paidAmount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      const total = getTotalAmount();
                      setPaymentDetails(prev => ({
                        ...prev,
                        paidAmount: paid,
                        creditAmount: Math.max(0, total - paid),
                        paymentMethod: paid >= total ? 'cash' : paid > 0 ? 'partial' : 'credit'
                      }));
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Credit/Due</Label>
                  <Input
                    type="number"
                    value={(getTotalAmount() - paymentDetails.paidAmount).toFixed(2)}
                    disabled
                    className="text-xs bg-red-50 text-red-600 font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <Select value={paymentDetails.paymentMethod} onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Payment</SelectItem>
                      <SelectItem value="credit">Credit (Pay Later)</SelectItem>
                      <SelectItem value="partial">Partial Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentDetails.paymentDate}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Previous Stock Info */}
            {restockItem && (
              <div className="bg-yellow-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Previous Stock Info</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>Current: <span className="font-medium">{restockItem.current_stock}</span></div>
                  <div>Cost: <span className="font-medium">NPR {restockItem.cost_price}</span></div>
                  <div>Selling: <span className="font-medium">NPR {restockItem.selling_price}</span></div>
                  <div>Batch: <span className="font-medium">{restockItem.batch_number}</span></div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!globalSupplier.name || !items[0]?.quantity || !items[0]?.costPrice || !items[0]?.batchNumber || !items[0]?.expiryDate) {
                toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
                return;
              }
              
              try {
                const restockPayload = {
                  supplier: {
                    name: globalSupplier.name,
                    contact: globalSupplier.contact,
                    type: globalSupplier.type || 'custom'
                  },
                  branch_id: userBranchId,
                  item: {
                    medicine_id: items[0].medicineId,
                    quantity: items[0].quantity,
                    unit: items[0].unit,
                    cost_price: items[0].costPrice,
                    selling_price: items[0].sellingPrice,
                    batch_number: items[0].batchNumber,
                    manufacturing_date: items[0].manufacturingDate,
                    expiry_date: items[0].expiryDate,
                    rackId: items[0].rackId,
                    sectionId: items[0].sectionId,
                    rackName: items[0].rackName,
                    sectionName: items[0].sectionName
                  },
                  payment: paymentDetails,
                  previous_item_id: restockItem.id
                };
                
                console.log('\n=== FRONTEND RESTOCK DEBUG ===');
                console.log('Restock payload:', JSON.stringify(restockPayload, null, 2));
                console.log('Restock item:', restockItem);
                
                const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/inventory/restock/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                  },
                  body: JSON.stringify(restockPayload)
                });
                
                console.log('Restock response status:', response.status);
                const data = await response.json();
                console.log('Restock response data:', data);
                
                if (response.ok) {
                  console.log('SUCCESS: Restock completed');
                  toast({ title: "Success", description: data.message });
                  setIsRestockDialogOpen(false);
                  fetchInventory();
                  fetchPurchaseHistory();
                  // Reset forms
                  setGlobalSupplier({ name: '', contact: '' });
                  setItems([{ id: 1, medicineId: '', medicineName: '', quantity: '', costPrice: '', sellingPrice: '', unit: 'pieces', packSize: '', batchNumber: '', manufacturingDate: '', expiryDate: '', rackId: '', rackName: '', sectionId: '', sectionName: '' }]);
                  setPaymentDetails({ totalAmount: 0, paidAmount: 0, creditAmount: 0, paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
                } else {
                  console.log('ERROR: Restock failed');
                  toast({ title: "Error", description: data.error || "Failed to restock item", variant: "destructive" });
                }
              } catch (error) {
                console.error('CRITICAL ERROR restocking item:', error);
                toast({ title: "Error", description: "Failed to restock item", variant: "destructive" });
              }
            }}>
              Complete Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Selection Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Select Rack Section</DialogTitle>
            <DialogDescription>
              Choose a section from the rack layout. Green sections contain medicine, white sections are empty.
            </DialogDescription>
          </DialogHeader>

          {selectedRack && availableSections.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Rack: {selectedRack.name}</h3>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div><span className="text-gray-600">Rows:</span> <span className="font-medium">{selectedRack.rows}</span></div>
                  <div><span className="text-gray-600">Columns:</span> <span className="font-medium">{selectedRack.columns}</span></div>
                  <div><span className="text-gray-600">Total Sections:</span> <span className="font-medium">{availableSections.length}</span></div>
                  <div><span className="text-gray-600">Occupied:</span> <span className="font-medium">{availableSections.filter(s => s.is_occupied).length}</span></div>
                </div>
              </div>

              {/* Rack Layout Grid */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${selectedRack.columns}, minmax(0, 1fr))`,
                    maxWidth: `${Math.min(selectedRack.columns * 60, 600)}px`
                  }}
                >
                  {Array.from({ length: selectedRack.rows }, (_, rowIndex) =>
                    Array.from({ length: selectedRack.columns }, (_, colIndex) => {
                      const sectionName = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
                      const section = availableSections.find(s =>
                        s.row_number === rowIndex + 1 && s.column_number === colIndex + 1
                      );

                      const isOccupied = section?.is_occupied || false;
                      const isSelected = currentItemForSection?.sectionId === section?.id?.toString();

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition-all hover:scale-105 relative ${
                            isSelected
                              ? 'bg-blue-500 border-blue-600 text-white'
                              : isOccupied
                                ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                          onClick={() => section && handleSectionSelect(section)}
                          title={section ? `${sectionName}: ${isOccupied ? 'Occupied' : 'Empty'}` : sectionName}
                        >
                          <span>{sectionName}</span>
                          {isOccupied && (
                            <span className="text-xs font-bold">{section.quantity || 0}</span>
                          )}
                        </button>
                      );
                    })
                  ).flat()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span>Has Medicine (Occupied)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span>Empty</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Management Modal */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MapPin className="mr-2" size={20} />
              Manage Locations - {selectedItem?.medicine?.name}
            </DialogTitle>
            <DialogDescription>
              View and update storage locations for different batches of this medicine
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Medicine Summary</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-600">Total Stock:</span> <span className="font-medium">{selectedItem.total_stock}</span></div>
                  <div><span className="text-gray-600">Batches:</span> <span className="font-medium">{selectedItem.batches?.length || 0}</span></div>
                  <div><span className="text-gray-600">Category:</span> <span className="font-medium">{selectedItem.medicine?.category?.name || 'N/A'}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Batch Locations</h4>
                {selectedItem.batches?.map((batch: any, index: number) => (
                  <div key={batch.id} className="border rounded p-3 bg-white">
                    <div className="grid grid-cols-5 gap-3 items-center">
                      <div>
                        <Label className="text-xs">Batch #{index + 1}</Label>
                        <div className="text-xs font-medium">{batch.batch_number}</div>
                        <div className="text-xs text-gray-500">Stock: {batch.current_stock}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Current Location</Label>
                        <div className="text-xs font-medium">
                          {batch.location ? (
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                              📍 {batch.location}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">New Rack</Label>
                        <Select
                          value={batch.newRackId || ""}
                          onValueChange={(value) => {
                            const updatedBatches = selectedItem.batches.map((b: any) =>
                              b.id === batch.id ? {...b, newRackId: value, newRackName: racks.find(r => r.id.toString() === value)?.name} : b
                            );
                            setSelectedItem({...selectedItem, batches: updatedBatches});
                          }}
                        >
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue placeholder="Select rack" />
                          </SelectTrigger>
                          <SelectContent>
                            {racks.map(rack => (
                              <SelectItem key={rack.id} value={rack.id.toString()}>
                                {rack.name} ({rack.rows}×{rack.columns})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">New Section</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentItemForSection(batch);
                            setSelectedRack(racks.find(r => r.id.toString() === batch.newRackId));
                            if (batch.newRackId) {
                              fetchRackSections(batch.newRackId);
                            }
                            setIsSectionModalOpen(true);
                          }}
                          disabled={!batch.newRackId}
                          className="text-xs h-8 w-full"
                        >
                          {batch.newSectionName || "Select Section"}
                        </Button>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!batch.newRackName || !batch.newSectionName) {
                              toast({
                                title: "Error",
                                description: "Please select both rack and section",
                                variant: "destructive"
                              });
                              return;
                            }

                            try {
                              const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                              const response = await fetch(`${API_BASE_URL}/inventory/inventory-items/${batch.id}/`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  ...(token && { 'Authorization': `Bearer ${token}` }),
                                },
                                body: JSON.stringify({
                                  location: `${batch.newRackName}-${batch.newSectionName}`,
                                  branch_id: userBranchId,
                                }),
                              });

                              if (response.ok) {
                                // Update local state
                                const updatedBatches = selectedItem.batches.map((b: any) =>
                                  b.id === batch.id ? {
                                    ...b,
                                    location: `${batch.newRackName}-${batch.newSectionName}`,
                                    newRackId: undefined,
                                    newRackName: undefined,
                                    newSectionName: undefined
                                  } : b
                                );
                                setSelectedItem({...selectedItem, batches: updatedBatches});

                                toast({
                                  title: "Success",
                                  description: `Location updated for batch ${batch.batch_number}`,
                                });

                                // Refresh inventory
                                fetchInventory();
                              } else {
                                toast({
                                  title: "Error",
                                  description: "Failed to update location",
                                  variant: "destructive"
                                });
                              }
                            } catch (error) {
                              console.error('Error updating location:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update location",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={!batch.newRackName || !batch.newSectionName}
                          className="text-xs h-8"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={showPurchaseHistory} onOpenChange={setShowPurchaseHistory}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No purchase history found
              </div>
            ) : (
              purchaseHistory.map((transaction) => (
                <div key={transaction.id} className="border rounded p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{transaction.transaction_number}</h4>
                      <p className="text-sm text-gray-600">{transaction.supplier_name}</p>
                      <p className="text-xs text-gray-500">{transaction.created_at}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">NPR {transaction.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{transaction.payment_method}</p>
                      {transaction.credit_amount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Credit: NPR {transaction.credit_amount.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Items:</h5>
                    {transaction.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-gray-500 ml-2">Batch: {item.batch_number}</span>
                        </div>
                        <div className="text-right">
                          <span>{item.quantity_purchased} {item.unit}</span>
                          <span className="ml-2 text-gray-600">@ NPR {item.cost_price.toFixed(2)}</span>
                          <span className="ml-2 font-medium">= NPR {item.total_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}