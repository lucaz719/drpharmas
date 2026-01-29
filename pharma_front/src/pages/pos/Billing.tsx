import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, X, Eye, Filter, Printer, Split, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReceiptModal from "@/components/ReceiptModal";
import { useNavigate } from "react-router-dom";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

export default function POSBilling() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", discount: 0 });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [showPatientSearchResults, setShowPatientSearchResults] = useState(false);
  const [savedBills, setSavedBills] = useState([]);
  const [completedBills, setCompletedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billSearch, setBillSearch] = useState("");
  const [billFilter, setBillFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState("percent");
  const [transactionType, setTransactionType] = useState("cash");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [splitPayments, setSplitPayments] = useState([
    { method: 'cash', amount: '', transaction_id: '' },
    { method: 'online', amount: '', transaction_id: '' }
  ]);
  const [posSettings, setPosSettings] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    receipt_footer: '',
    receipt_logo: null,
    tax_rate: 13,
    tax_inclusive: false,
    payment_methods: ['cash', 'online']
  });
  const [showCreditApprovalDialog, setShowCreditApprovalDialog] = useState(false);
  const [creditApprovalData, setCreditApprovalData] = useState({
    credit_limit: '',
    phone: '',
    address: ''
  });
  const [isProcessingCreditApproval, setIsProcessingCreditApproval] = useState(false);
  const [patientCreditInfo, setPatientCreditInfo] = useState(null);
  const { toast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userBranchId = currentUser?.branch_id;

  // Fetch POS settings for current branch
  const fetchPOSSettings = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/settings/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosSettings({
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          receipt_footer: data.receipt_footer || '',
          receipt_logo: data.receipt_logo || null,
          tax_rate: data.tax_rate || 13,
          tax_inclusive: data.tax_inclusive || false,
          payment_methods: data.payment_methods || ['cash', 'online']
        });
      }
    } catch (error) {
      console.error('Error fetching POS settings:', error);
      // Use default settings if fetch fails
      setPosSettings({
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        receipt_footer: '',
        receipt_logo: null,
        tax_rate: 13,
        tax_inclusive: false,
        payment_methods: ['cash', 'online']
      });
    }
  };

  // Helper function to get available stock considering cart items
  const getAvailableStock = (medicineId) => {
    const product = inventory.find(p => p.medicine_id === medicineId);
    if (!product) return 0;
    
    const cartQty = cartItems
      .filter(item => item.medicine_id === medicineId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    return Math.max(0, product.total_stock - cartQty);
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const url = userBranchId 
        ? `${API_BASE_URL}/inventory/inventory-items/?branch_id=${userBranchId}&pos_mode=true`
        : `${API_BASE_URL}/inventory/inventory-items/?pos_mode=true`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const posProducts = data.map(item => ({
          id: item.id,
          medicine_id: item.medicine_id,
          name: item.medicine?.name || 'Unknown Medicine',
          batch: item.batch_number,
          price: parseFloat(item.selling_price) || 0,
          stock: item.current_stock,
          total_stock: item.total_stock,
          expiry: item.expiry_date,
          barcode: item.medicine?.product_code || '',
          strength: item.medicine?.strength || '',
          dosage_form: item.medicine?.dosage_form || '',
          unit: item.unit,
          location: item.location,
          all_batches: item.all_batches || []
        })).filter(item => item.total_stock > 0);
        
        setInventory(posProducts);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedBills = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchPendingBills = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/pending/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedBills(data);
      }
    } catch (error) {
      console.error('Error fetching pending bills:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCompletedBills();
    fetchPendingBills();
    fetchPOSSettings();
  }, []);

  const filteredProducts = inventory.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = async (product, requestedQuantity = 1) => {
    // Check available stock first
    const currentCartQty = cartItems
      .filter(item => item.medicine_id === product.medicine_id)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const totalRequested = currentCartQty + requestedQuantity;
    
    if (totalRequested > product.total_stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.total_stock} units available. You already have ${currentCartQty} in cart.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/allocate-stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          medicine_id: product.medicine_id,
          quantity: requestedQuantity,
          branch_id: userBranchId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Stock Error",
          description: errorData.error || "Failed to allocate stock",
          variant: "destructive",
        });
        return;
      }
      
      const allocation = await response.json();
      
      const priceGroups = {};
      allocation.allocations.forEach(alloc => {
        const priceKey = alloc.selling_price.toString();
        if (!priceGroups[priceKey]) {
          priceGroups[priceKey] = {
            price: alloc.selling_price,
            quantity: 0,
            batches: []
          };
        }
        priceGroups[priceKey].quantity += alloc.allocated_quantity;
        priceGroups[priceKey].batches.push({
          inventory_item_id: alloc.batch_id,
          batch_number: alloc.batch_number,
          allocated_quantity: alloc.allocated_quantity,
          selling_price: alloc.selling_price
        });
      });
      
      setCartItems(prevItems => {
        let newItems = [...prevItems];
        
        Object.values(priceGroups).forEach((group: any) => {
          const cartKey = `${product.medicine_id}_${group.price}`;
          const existingItemIndex = newItems.findIndex(item => item.cart_key === cartKey);

          if (existingItemIndex >= 0) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + group.quantity,
              batch_info: [...newItems[existingItemIndex].batch_info, ...group.batches]
            };
          } else {
            newItems.push({
              ...product,
              id: cartKey,
              cart_key: cartKey,
              medicine_id: product.medicine_id,
              price: group.price,
              quantity: group.quantity,
              batch_info: group.batches
            });
          }
        });
        
        return newItems;
      });
      
      fetchInventory();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (cartKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    const cartItem = cartItems.find(item => item.cart_key === cartKey);
    if (!cartItem) return;

    // Find the product to check total stock
    const product = inventory.find(p => p.medicine_id === cartItem.medicine_id);
    if (!product) {
      toast({
        title: "Product Not Found",
        description: "Unable to validate stock for this item",
        variant: "destructive",
      });
      return;
    }

    // Check if new quantity exceeds available stock
    const otherCartQty = cartItems
      .filter(item => item.medicine_id === cartItem.medicine_id && item.cart_key !== cartKey)
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalRequested = otherCartQty + newQuantity;

    if (totalRequested > product.total_stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.total_stock} units available. Maximum you can set: ${product.total_stock - otherCartQty}`,
        variant: "destructive",
      });
      return;
    }

    const quantityDiff = newQuantity - cartItem.quantity;

    if (quantityDiff > 0) {
      // Increasing quantity - allocate more stock
      await addToCart(cartItem, quantityDiff);
    } else if (quantityDiff < 0) {
      // Decreasing quantity - deallocate stock
      const quantityToReduce = Math.abs(quantityDiff);

      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/inventory/deallocate-stock/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({
            medicine_id: cartItem.medicine_id,
            quantity: quantityToReduce,
            branch_id: userBranchId,
            cart_key: cartKey
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast({
            title: "Stock Error",
            description: errorData.error || "Failed to deallocate stock",
            variant: "destructive",
          });
          return;
        }

        // Update cart item quantity and batch info
        const deallocation = await response.json();
        setCartItems(prevItems => prevItems.map(item => {
          if (item.cart_key === cartKey) {
            return {
              ...item,
              quantity: newQuantity,
              batch_info: deallocation.remaining_batches || item.batch_info
            };
          }
          return item;
        }));

        fetchInventory(); // Refresh inventory to show updated stock

      } catch (error) {
        console.error('Error deallocating stock:', error);
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        });
      }
    }
    // If quantityDiff === 0, do nothing
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prevItems => prevItems.filter(item => item.cart_key !== cartKey));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Dynamic tax calculation based on settings
  const shouldShowTax = posSettings.tax_rate > 0 && posSettings.tax_inclusive === true;
  const taxAmount = shouldShowTax ? subtotal * (posSettings.tax_rate / 100) : 0;
  const subtotalWithTax = subtotal + taxAmount;
  
  const calculatedDiscountAmount = discountType === "amount" 
    ? discountAmount 
    : (subtotalWithTax * customerInfo.discount) / 100;
  const total = subtotalWithTax - calculatedDiscountAmount;
  const creditAmount = Math.max(0, total - (parseFloat(paidAmount) || 0));

  const handlePatientSearch = async (value) => {
    setPatientSearchTerm(value);
    if (value.trim()) {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/patients/?search=${encodeURIComponent(value)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPatientSearchResults(data.results || []);
          setShowPatientSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching patients:', error);
      }
    } else {
      setShowPatientSearchResults(false);
      setPatientSearchResults([]);
    }
  };

  const handlePatientSelect = async (patient) => {
    setPatientId(patient.patient_id || '');
    setPatientName(patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim());
    setPatientPhone(patient.phone || '');
    setPatientAge(patient.age || '');
    setPatientGender(patient.gender || '');
    setCustomerInfo({
      name: patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
      phone: patient.phone || '',
      discount: 0
    });
    setShowPatientSearchResults(false);
    setPatientSearchTerm('');

    // Check if patient has credit approval
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const patientData = await response.json();
        setPatientCreditInfo({
          credit_allowed: patientData.credit_allowed || false,
          credit_limit: patientData.credit_limit || 0,
          current_credit_balance: patientData.current_credit_balance || 0
        });
      } else {
        // If patient fetch fails, reset credit info
        setPatientCreditInfo(null);
      }
    } catch (error) {
      console.error('Error fetching patient credit info:', error);
      setPatientCreditInfo(null);
    }
  };

  const handleSaveBill = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const pendingBillData = {
        patient_id: patientId,
        patient_name: patientName || "Walk-in Customer",
        patient_age: patientAge,
        patient_phone: patientPhone,
        patient_gender: patientGender,
        branch_id: userBranchId,
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
          batch: item.batch,
          batch_info: item.batch_info
        })),
        subtotal,
        total,
        discount_amount: calculatedDiscountAmount,
        tax_amount: taxAmount,
        payment_method: paymentMethod
      };

      const url = editingBillId 
        ? `${API_BASE_URL}/pos/sales/${editingBillId}/update-pending/`
        : `${API_BASE_URL}/pos/sales/save-pending/`;
      
      const response = await fetch(url, {
        method: editingBillId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(pendingBillData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save pending bill');
      }

      const result = await response.json();
      
      // Clear current cart
      setCartItems([]);
      setPatientId("");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientSearchTerm("");
      setShowPatientSearchResults(false);
      setCustomerInfo({ name: "", phone: "", discount: 0 });
      setDiscountAmount(0);
      setPaidAmount("");
      setEditingBillId(null);

      // Refresh pending bills
      fetchPendingBills();

      toast({
        title: editingBillId ? "Bill Updated" : "Bill Saved",
        description: `Bill ${result.sale_number} ${editingBillId ? 'updated' : 'saved'} successfully`,
      });
    } catch (error) {
      console.error('Error saving pending bill:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save pending bill",
        variant: "destructive",
      });
    }
  };

  const handleLoadBill = (bill) => {
    setPatientId(bill.patientId);
    setPatientName(bill.patientName);
    setPatientPhone(bill.patientPhone);
    setPatientAge(bill.patientAge);
    setPatientGender(bill.patientGender);
    setCartItems(bill.items);
    setCustomerInfo({ name: bill.patientName, phone: bill.patientPhone, discount: 0 });
    setEditingBillId(bill.id); // Track that we're editing this bill
    
    toast({
      title: "Bill Loaded",
      description: `Bill ${bill.sale_number} loaded to cart`,
    });
  };

  const handleDeleteSavedBill = async (billId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/${billId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        setSavedBills(prev => prev.filter(b => b.id !== billId));
        toast({ title: "Bill Deleted", description: "Pending bill deleted successfully" });
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Delete Error", 
          description: errorData.error || "Failed to delete pending bill",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting pending bill:', error);
      toast({ 
        title: "Delete Error", 
        description: "Failed to delete pending bill",
        variant: "destructive"
      });
    }
  };

  const showSalePreview = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Check credit limit validation before showing preview
    const isSplitPayment = splitPayments.some(p => p.amount && parseFloat(p.amount) > 0);
    const totalSplitAmount = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const finalCreditAmount = isSplitPayment ? Math.max(0, total - totalSplitAmount) : creditAmount;
    const isCreditSale = finalCreditAmount > 0;

    if (isCreditSale) {
      // For walk-in customers (no patientId) or patients without credit info, always show approval dialog
      if (!patientId || !patientCreditInfo || !patientCreditInfo.credit_allowed) {
        // Show credit approval dialog
        setCreditApprovalData({
          credit_limit: Math.max(0, finalCreditAmount).toString(),
          phone: patientPhone || '',
          address: ''
        });
        setShowCreditApprovalDialog(true);
        return;
      } else {
        // Patient has credit approval, check credit limit
        const currentCreditBalance = patientCreditInfo.current_credit_balance || 0;
        const availableCredit = patientCreditInfo.credit_limit - currentCreditBalance;

        if (finalCreditAmount > availableCredit) {
          // Show credit approval dialog to allow limit increase
          setCreditApprovalData({
            credit_limit: Math.max(patientCreditInfo.credit_limit, finalCreditAmount + currentCreditBalance).toString(),
            phone: patientPhone || '',
            address: patientCreditInfo.address || ''
          });
          setShowCreditApprovalDialog(true);
          return;
        }
      }
    }

    setShowPreviewModal(true);
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // Check if split payment is used
      const isSplitPayment = splitPayments.some(p => p.amount && parseFloat(p.amount) > 0);
      const totalSplitAmount = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Check if credit is being used and patient has credit approval
      const finalCreditAmount = isSplitPayment ? Math.max(0, total - totalSplitAmount) : creditAmount;
      const isCreditSale = finalCreditAmount > 0;

      if (isCreditSale) {
        // For walk-in customers (no patientId) or patients without credit info, always show approval dialog
        if (!patientId || !patientCreditInfo || !patientCreditInfo.credit_allowed) {
          // Show credit approval dialog
          setCreditApprovalData({
            credit_limit: '',
            phone: patientPhone || '',
            address: ''
          });
          setShowCreditApprovalDialog(true);
          return;
        } else {
          // Patient has credit approval, check credit limit
          const currentCreditBalance = patientCreditInfo.current_credit_balance || 0;
          const availableCredit = patientCreditInfo.credit_limit - currentCreditBalance;

          if (finalCreditAmount > availableCredit) {
            // Show credit approval dialog to allow limit increase
            setCreditApprovalData({
              credit_limit: Math.max(patientCreditInfo.credit_limit, finalCreditAmount + currentCreditBalance).toString(),
              phone: patientPhone || '',
              address: patientCreditInfo.address || ''
            });
            setShowCreditApprovalDialog(true);
            return;
          }
        }
      }

      const saleData = {
        patient_id: patientId,
        patient_name: patientName || "Walk-in Customer",
        patient_age: patientAge,
        patient_phone: patientPhone,
        patient_gender: patientGender,
        branch_id: userBranchId,
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
          batch: item.batch,
          batch_info: item.batch_info
        })),
        subtotal,
        total,
        discount_amount: calculatedDiscountAmount,
        tax_amount: taxAmount,
        payment_method: isSplitPayment ? 'split' : paymentMethod,
        paid_amount: isSplitPayment ? totalSplitAmount : (parseFloat(paidAmount) || 0),
        credit_amount: finalCreditAmount,
        transaction_id: paymentMethod === 'online' ? `TXN_${Date.now()}` : '',
        split_payments: isSplitPayment ? splitPayments.filter(p => p.amount && parseFloat(p.amount) > 0) : null,
        sale_id: editingBillId // Include sale_id if completing pending bill
      };

      const endpoint = editingBillId
        ? `${API_BASE_URL}/pos/sales/complete/`
        : `${API_BASE_URL}/pos/sales/create/`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sale');
      }

      const result = await response.json();

      const saleType = isCreditSale ? 'Credit Sale' : 'Cash Sale';
      const message = isCreditSale
        ? `Credit sale completed. Due: NPR ${finalCreditAmount.toFixed(2)}`
        : `Sale completed for NPR ${total.toFixed(2)}`;

      toast({
        title: saleType,
        description: `${message} - Bill: ${result.sale_number}`,
      });

      // Show receipt modal
      if (result.receipt) {
        setReceiptData(result.receipt);
        setShowReceiptModal(true);
      }

      // Clear form
      setCartItems([]);
      setCustomerInfo({ name: "", phone: "", discount: 0 });
      setPaymentMethod("cash");
      setPaidAmount("");
      setSearchTerm("");
      setPatientId("");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientSearchTerm("");
      setShowPatientSearchResults(false);
      setDiscountAmount(0);
      setDiscountType("percent");
      setTransactionType("cash");
      setEditingBillId(null);
      setSplitPayments([
        { method: 'cash', amount: '', transaction_id: '' },
        { method: 'online', amount: '', transaction_id: '' }
      ]);
      setPatientCreditInfo(null);

      // Clear patient info when clearing form
      setPatientId("");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientSearchTerm("");
      setShowPatientSearchResults(false);

      // Refresh data
      fetchInventory();
      fetchCompletedBills();
      fetchPendingBills();

    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Sale Error",
        description: error.message || "Failed to complete sale",
        variant: "destructive",
      });
    }
  };

  const handleCreditApprovalSubmit = async () => {
    const creditLimit = parseFloat(creditApprovalData.credit_limit);
    if (creditLimit <= 0) {
      toast({
        title: "Invalid Credit Limit",
        description: "Credit limit must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Only require phone and address for new credit approvals, not limit increases
    const isExistingPatientWithCredit = patientCreditInfo && patientCreditInfo.credit_allowed;
    if (!isExistingPatientWithCredit && (!creditApprovalData.phone.trim() || !creditApprovalData.address.trim())) {
      toast({
        title: "Missing Information",
        description: "Phone number and address are required for credit approval",
        variant: "destructive"
      });
      return;
    }

    // For existing patients, use their stored address if not provided in the form
    if (isExistingPatientWithCredit && !creditApprovalData.address.trim() && patientCreditInfo?.address) {
      setCreditApprovalData(prev => ({ ...prev, address: patientCreditInfo.address }));
    }

    setIsProcessingCreditApproval(true);
    
    // Use requestAnimationFrame to prevent forced reflow
    await new Promise(resolve => requestAnimationFrame(resolve));
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // For walk-in customers, we need to create a patient first
      let patientIdToUse = patientId;
      console.log('Initial patientIdToUse:', patientIdToUse);
      console.log('patientId state:', patientId);
      console.log('patientName:', patientName);

      if (!patientIdToUse) {
        console.log('Creating new walk-in patient...');
        // Create a walk-in patient first
        const patientData = {
          first_name: patientName.split(' ')[0] || 'Walk-in',
          last_name: patientName.split(' ').slice(1).join(' ') || 'Customer',
          phone: creditApprovalData.phone,
          address: creditApprovalData.address,
          patient_type: 'outpatient',
          gender: patientGender || 'other',
          date_of_birth: new Date().toISOString().split('T')[0],
          city: 'Unknown',
          state: 'Nepal',
          country: 'Nepal',
          organization_id: currentUser?.organization_id,
          branch_id: userBranchId
        };

        console.log('Patient data to create:', patientData);

        const patientResponse = await fetch(`${API_BASE_URL}/patients/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(patientData)
        });

        console.log('Patient creation response status:', patientResponse.status);

        if (patientResponse.ok) {
          const newPatient = await patientResponse.json();
          console.log('Raw patient response:', newPatient);
          
          // Backend now returns full patient data with id field
          patientIdToUse = newPatient.id;
          setPatientId(newPatient.patient_id);
          
          console.log('Final patientIdToUse:', patientIdToUse);

          // Use requestAnimationFrame instead of setTimeout to prevent forced reflow
          await new Promise(resolve => requestAnimationFrame(() => {
            setTimeout(resolve, 100); // Reduced delay
          }));
          console.log('After delay, patientIdToUse is:', patientIdToUse);
        } else {
          const errorData = await patientResponse.json();
          console.error('Patient creation failed:', errorData);
          throw new Error('Failed to create patient');
        }
      }

      // Validate patientIdToUse before making API call
      if (!patientIdToUse) {
        throw new Error('Patient ID is required but not available');
      }

      // Now approve credit for the patient or update existing credit limit
      console.log('About to call credit-status API with patientIdToUse:', patientIdToUse);
      console.log('Credit limit:', creditLimit);
      console.log('Phone:', creditApprovalData.phone);
      console.log('Address:', creditApprovalData.address);

      const response = await fetch(`${API_BASE_URL}/patients/${patientIdToUse}/credit-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credit_allowed: true,
          credit_limit: creditLimit,
          phone: creditApprovalData.phone,
          address: creditApprovalData.address
        })
      });

      console.log('Credit-status API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        const action = isExistingPatientWithCredit ? 'increased' : 'approved';
        toast({
          title: `Credit ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: `Credit limit has been ${action} to NPR ${creditLimit.toLocaleString()}`,
        });

        // Update patient credit info
        setPatientCreditInfo({
          credit_allowed: true,
          credit_limit: creditLimit,
          current_credit_balance: result.current_credit_balance
        });

        setShowCreditApprovalDialog(false);

        // Instead of proceeding directly to checkout, show the sale preview
        await showSalePreview();
      } else {
        const errorData = await response.json();
        toast({
          title: "Credit Approval Failed",
          description: errorData.error || "Failed to approve credit",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving credit:', error);
      toast({
        title: "Error",
        description: "Failed to approve credit",
        variant: "destructive"
      });
    } finally {
      setIsProcessingCreditApproval(false);
    }
  };

  const handleSkipCreditApproval = () => {
    setShowCreditApprovalDialog(false);
    // Adjust payment to full amount
    setPaidAmount(total.toString());
    toast({
      title: "Credit Skipped",
      description: "Payment adjusted to full amount. No credit will be given.",
    });
  };

  const handleViewBill = async (bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
    
    // Generate receipt data for viewing
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/${bill.id}/receipt/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const receiptData = await response.json();
        setReceiptData(receiptData);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };

  const handleDeleteBill = async (billId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/${billId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        setCompletedBills(prev => prev.filter(b => b.id !== billId));
        toast({ title: "Bill Deleted", description: "Bill deleted successfully" });
        fetchInventory(); // Refresh inventory to show restored stock
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Delete Error", 
          description: errorData.error || "Failed to delete bill",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({ 
        title: "Delete Error", 
        description: "Failed to delete bill",
        variant: "destructive"
      });
    }
  };

  const filteredBills = completedBills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(billSearch.toLowerCase()) ||
                         bill.id.toLowerCase().includes(billSearch.toLowerCase()) ||
                         bill.patientPhone.includes(billSearch);
    const matchesFilter = billFilter === "all" || bill.status === billFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-gray-50 p-2 space-y-4">
      <div className="flex flex-col gap-2">
        {/* Top Section: Customer Details, Medicine Search, and Cart */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Left Section: Customer Details and Medicine Search */}
          <div className="lg:w-2/3 bg-white rounded-md shadow p-2 flex flex-col gap-2">
            {/* Customer Details */}
            <div className="grid grid-cols-6 gap-2">
              <div className="relative col-span-2">
                <Label htmlFor="patientId" className="text-xs">Patient ID</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={14} />
                  <Input
                    id="patientId"
                    value={patientSearchTerm || patientId || ''}
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        handlePatientSearch(e.target.value);
                      } else {
                        setPatientId('');
                        setPatientSearchTerm('');
                        setShowPatientSearchResults(false);
                      }
                    }}
                    placeholder="Search Patient ID, Name or Phone"
                    className="h-8 text-sm pl-7"
                  />
                  {showPatientSearchResults && patientSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-20 max-h-32 overflow-y-auto">
                      {patientSearchResults.map((patient, index) => (
                        <div
                          key={patient.id || `patient-${index}`}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-medium text-xs">{patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim()}</div>
                          <div className="text-xs text-gray-500">{patient.patient_id} • {patient.phone || 'No phone'} • {patient.age}Y/{patient.gender}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="patientName" className="text-xs">Name</Label>
                <Input
                  id="patientName"
                  value={patientName || ''}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setCustomerInfo({ ...customerInfo, name: e.target.value });
                  }}
                  placeholder="Patient Name"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientAge" className="text-xs">Age</Label>
                <Input
                  id="patientAge"
                  value={patientAge || ''}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Age"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientPhone" className="text-xs">Phone</Label>
                <Input
                  id="patientPhone"
                  value={patientPhone || ''}
                  onChange={(e) => {
                    setPatientPhone(e.target.value);
                    setCustomerInfo({ ...customerInfo, phone: e.target.value });
                  }}
                  placeholder="Phone"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="patientGender" className="text-xs">Gender</Label>
                <Select value={patientGender || ''} onValueChange={setPatientGender}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Saved Bills */}
            {savedBills.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-1">
                <h3 className="text-xs font-semibold mb-1">Pending Bills ({savedBills.length})</h3>
                <div className="grid grid-cols-4 gap-1 max-h-16 overflow-y-auto">
                  {savedBills.map((bill, index) => (
                    <div key={bill.id || `saved-bill-${index}`} className="relative bg-white border rounded p-1 text-xs hover:bg-gray-50 h-8 flex flex-col justify-center">
                      <div 
                        className="cursor-pointer text-center"
                        onClick={() => handleLoadBill(bill)}
                      >
                        <div className="font-medium text-xs leading-tight">{String(bill.id).split('_')[1]?.slice(-3) || String(bill.id).slice(-3)}</div>
                        <div className="text-gray-500 text-xs truncate leading-tight">{bill.patientName.slice(0,4)}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSavedBill(bill.id)}
                      >
                        <X size={6} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div>
              <Input
                type="text"
                placeholder="Search medicine, barcode, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs"
              />
            </div>

            {/* Inventory Table */}
            <div className="flex-1 overflow-y-auto border rounded">
              {loading ? (
                <div className="text-center py-2 text-xs">Loading...</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0 text-left">
                      <th className="p-1 font-medium">Medicine</th>
                      <th className="p-1 font-medium">Batch</th>
                      <th className="p-1 font-medium">Strength</th>
                      <th className="p-1 font-medium">Stock</th>
                      <th className="p-1 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <tr
                          key={product.id || `product-${index}`}
                          className={`border-b hover:bg-gray-50 cursor-pointer ${
                            getAvailableStock(product.medicine_id) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => getAvailableStock(product.medicine_id) > 0 && addToCart(product)}
                        >
                          <td className="p-1">{product.name}</td>
                          <td className="p-1">{product.batch}</td>
                          <td className="p-1">{product.strength}</td>
                          <td className="p-1">
                            {(() => {
                              const availableStock = getAvailableStock(product.medicine_id);
                              return (
                                <Badge variant={availableStock === 0 ? "secondary" : availableStock < 10 ? "destructive" : "default"} className="text-xs">
                                  {availableStock}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="p-1">NPR {product.price.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Section: Cart and Billing */}
          <div className="lg:w-1/3 bg-white rounded-md shadow p-2 flex flex-col h-full">
            <h2 className="text-sm font-semibold mb-2">Cart</h2>
            <div className="flex-1 max-h-[200px] overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={item.cart_key || `cart-item-${index}`} className="flex justify-between items-center py-1 border-b text-xs">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">
                        {item.batch} | NPR {item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input for editing, don't remove from cart
                          if (value === '') {
                            setCartItems(prevItems => prevItems.map(cartItem =>
                              cartItem.cart_key === item.cart_key ? { ...cartItem, quantity: '' } : cartItem
                            ));
                            return;
                          }
                          const newQty = parseInt(value);
                          if (!isNaN(newQty) && newQty > 0) {
                            setCartItems(prevItems => prevItems.map(cartItem =>
                              cartItem.cart_key === item.cart_key ? { ...cartItem, quantity: newQty } : cartItem
                            ));
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            removeFromCart(item.cart_key);
                            return;
                          }
                          const newQty = parseInt(value) || 1;

                          // Find the product to check total stock
                          const product = inventory.find(p => p.medicine_id === item.medicine_id);
                          if (product) {
                            // Check if new quantity exceeds available stock
                            const otherCartQty = cartItems
                              .filter(cartItem => cartItem.medicine_id === item.medicine_id && cartItem.cart_key !== item.cart_key)
                              .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

                            const totalRequested = otherCartQty + newQty;
                            const maxAllowed = product.total_stock;

                            if (totalRequested > maxAllowed) {
                              // Auto-adjust to maximum allowed quantity
                              const adjustedQty = Math.max(1, maxAllowed - otherCartQty);
                              setCartItems(prevItems => prevItems.map(cartItem =>
                                cartItem.cart_key === item.cart_key ? { ...cartItem, quantity: adjustedQty } : cartItem
                              ));
                              toast({
                                title: "Quantity Adjusted",
                                description: `Maximum available stock: ${maxAllowed}. Adjusted to ${adjustedQty}.`,
                                variant: "default",
                              });
                              return;
                            }
                          }

                          // Only update if quantity actually changed
                          if (newQty !== item.quantity) {
                            updateQuantity(item.cart_key, newQty);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur(); // Trigger onBlur
                          }
                        }}
                        className="w-12 h-5 text-xs text-center"
                        min="1"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-5 w-5"
                        onClick={() => removeFromCart(item.cart_key)}
                      >
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-xs py-4">Cart is empty</p>
              )}
            </div>

            {/* Cart Total Display */}
            {cartItems.length > 0 && (
              <div className="bg-blue-50 p-2 rounded text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Cart Total:</span>
                  <span>NPR {subtotal.toFixed(2)}</span>
                </div>
                {shouldShowTax && (
                  <div className="flex justify-between text-orange-700">
                    <span>Tax ({posSettings.tax_rate}%):</span>
                    <span>NPR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Subtotal:</span>
                  <span>NPR {subtotalWithTax.toFixed(2)}</span>
                </div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>Less: Discount</span>
                    <span>-NPR {calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* 1. Input Fields Section */}
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-700 mb-1">📝 Discount</div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="h-8 text-sm bg-orange-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Amount (NPR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="number"
                    value={discountType === "percent" ? (customerInfo.discount || '') : (discountAmount || '')}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                      if (discountType === "percent") {
                        setCustomerInfo({ ...customerInfo, discount: value });
                      } else {
                        setDiscountAmount(value);
                      }
                    }}
                    placeholder={discountType === "percent" ? "Enter %" : "Enter NPR"}
                    className="h-8 text-sm bg-orange-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">📝 Payment Mode</div>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {posSettings.payment_methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === "online" && (
                  <div>
                    <Input
                      type="text"
                      placeholder="Transaction ID"
                      className="h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-1" />

            {/* 2. Summary Section */}
            <div className="space-y-1">
              <div className="bg-gray-800 text-white p-1 rounded text-sm">
                <div className="flex justify-between">
                  <span>Total to Pay:</span>
                  <span className="font-bold">NPR {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            {/* 3. Payment & Return/Due Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-gray-700">💵 Payment</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSplitPaymentModal(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Split className="w-3 h-3 mr-1" />
                  Split
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <Input
                    type="number"
                    value={paidAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : e.target.value;
                      setPaidAmount(value);
                    }}
                    placeholder={`NPR ${total.toFixed(2)}`}
                    className="h-8 text-sm font-medium bg-green-50"
                  />
                </div>
                <div>
                  {paidAmount !== "" && parseFloat(paidAmount) > 0 ? (
                    <div className={`p-1 rounded text-sm ${parseFloat(paidAmount) > total ? 'bg-green-100 text-green-800' : parseFloat(paidAmount) < total ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      <div className="flex justify-between">
                        <span>{parseFloat(paidAmount) > total ? 'Return:' : parseFloat(paidAmount) < total ? 'Due:' : 'Exact:'}</span>
                        <span className="font-bold">
                          {parseFloat(paidAmount) === total ? 'NPR 0.00' : `NPR ${Math.abs(total - parseFloat(paidAmount || '0')).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-1 rounded text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Enter payment</span>
                        <span>NPR 0.00</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-1" />

            {/* 4. Action Buttons */}
            <div className="grid grid-cols-3 gap-1">
              <Button 
                className="h-6 text-sm bg-gray-500 hover:bg-gray-600 text-white"
                onClick={handleSaveBill}
              >
                💾 Save
              </Button>
              <Button className={`col-span-2 h-6 text-sm ${parseFloat(paidAmount) < total && paidAmount !== "" ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'}`} onClick={showSalePreview}>
                {parseFloat(paidAmount) < total && paidAmount !== "" ? '🏦 Credit Sale' : '💳 Complete Sale'} - NPR {total.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {/* Bills History Section */}
        <div className="w-full bg-white rounded-md shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Completed Bills</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search bills..."
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={billFilter} onValueChange={setBillFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Bill ID</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Payment Method</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((bill, index) => (
                  <tr key={bill.id || `bill-${index}`} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{bill.id}</td>
                    <td className="p-2">
                      <span
                        className={bill.patientId ? "text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" : ""}
                        onClick={bill.patientId ? () => {
                          // The patientId in the bill response is the formatted patient_id string
                          // We need to find the actual database ID by looking it up
                          // For now, let's try to extract the numeric part or use the patientId as-is
                          // The backend should handle both formatted and numeric IDs
                          navigate(`/patients/detail/${bill.patientId}`);
                        } : undefined}
                        title={bill.patientId ? "Click to view patient details" : ""}
                      >
                        {bill.patientName}
                      </span>
                    </td>
                    <td className="p-2">{bill.patientPhone}</td>
                    <td className="p-2">NPR {bill.total.toFixed(2)}</td>
                    <td className="p-2">
                      {bill.isSplitPayment ? (
                        <div className="space-y-1">
                          {bill.paymentBreakdown.map((payment, idx) => (
                            <div key={idx}>
                              <Badge variant="outline" className="text-xs">
                                {payment}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="default" className="text-xs">
                            {bill.paymentMethod.charAt(0).toUpperCase() + bill.paymentMethod.slice(1)}: NPR {bill.paidAmount.toFixed(2)}
                          </Badge>
                          {bill.creditAmount > 0 && (
                            <div>
                              <Badge variant="destructive" className="text-xs">
                                Credit: NPR {bill.creditAmount.toFixed(2)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant={bill.status === "completed" ? "default" : "secondary"}>
                        {bill.status}
                      </Badge>
                    </td>
                    <td className="p-2">{bill.completedAt}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewBill(bill)}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                            const response = await fetch(`${API_BASE_URL}/pos/sales/${bill.id}/receipt/`, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });

                            if (response.ok) {
                              const receiptData = await response.json();
                              setReceiptData(receiptData);
                              setShowReceiptModal(true);
                            } else {
                              toast({
                                title: "Receipt Error",
                                description: "Failed to generate receipt",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('Error generating receipt:', error);
                            toast({
                              title: "Receipt Error",
                              description: "Failed to generate receipt",
                              variant: "destructive",
                            });
                          }
                        }}>
                          <Printer size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-700"
                          onClick={() => {
                            // Navigate to returns page with bill data
                            navigate('/returns', {
                              state: {
                                saleId: bill.id,
                                patientName: bill.patientName,
                                patientId: bill.patientId,
                                totalAmount: bill.total,
                                saleDate: bill.completedAt
                              }
                            });
                          }}
                          title="Process Return"
                        >
                          ↩️ Return
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBill(bill.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">{currentPage} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Details Modal */}
      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details - {selectedBill?.id}</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <p><strong>Name:</strong> {selectedBill.patientName}</p>
                  <p><strong>ID:</strong> {selectedBill.patientId}</p>
                  <p><strong>Age:</strong> {selectedBill.patientAge}</p>
                  <p><strong>Phone:</strong> {selectedBill.patientPhone}</p>
                  <p><strong>Gender:</strong> {selectedBill.patientGender}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bill Summary</h3>
                  <p><strong>Subtotal:</strong> NPR {selectedBill.subtotal.toFixed(2)}</p>
                  <p><strong>Discount:</strong> NPR {selectedBill.discountAmount.toFixed(2)}</p>
                  <p><strong>Tax:</strong> NPR {selectedBill.taxAmount.toFixed(2)}</p>
                  <p><strong>Total:</strong> NPR {selectedBill.total.toFixed(2)}</p>
                  <p><strong>Paid:</strong> NPR {selectedBill.paidAmount.toFixed(2)}</p>
                  <p><strong>Credit:</strong> NPR {selectedBill.creditAmount.toFixed(2)}</p>
                  
                  {selectedBill.isSplitPayment && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-1">Payment Breakdown:</h4>
                      <div className="space-y-1">
                        {selectedBill.paymentBreakdown.map((payment, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2">
                            {payment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Medicine</th>
                      <th className="p-2 text-left">Batch</th>
                      <th className="p-2 text-left">Qty</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={item.id || `item-${index}`} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.batch}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">NPR {item.price.toFixed(2)}</td>
                        <td className="p-2">NPR {(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedBill.payments && selectedBill.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Method</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Reference</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Received By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.payments.map((payment, index) => (
                        <tr key={payment.id || `payment-${index}`} className="border-b">
                          <td className="p-2">
                            <Badge variant="outline">
                              {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-2">NPR {payment.amount.toFixed(2)}</td>
                          <td className="p-2">{payment.reference || '-'}</td>
                          <td className="p-2">{payment.date}</td>
                          <td className="p-2">{payment.receivedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Returns Section */}
              {selectedBill.returns && selectedBill.returns.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Returns</h3>
                  <div className="space-y-2">
                    {selectedBill.returns.map((returnItem, index) => (
                      <div key={returnItem.id || `return-${index}`} className="p-3 border border-orange-200 rounded bg-orange-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">Return #{returnItem.return_number}</p>
                            <p className="text-xs text-gray-600">
                              Date: {returnItem.return_date ? new Date(returnItem.return_date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Status: <Badge variant={returnItem.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {returnItem.status}
                              </Badge>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">Refund: NPR {returnItem.refund_amount?.toFixed(2)}</p>
                          </div>
                        </div>

                        {returnItem.return_items && returnItem.return_items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Returned Items:</p>
                            <div className="space-y-1">
                              {returnItem.return_items.map((item, itemIndex) => (
                                <div key={itemIndex} className="text-xs bg-white p-2 rounded border">
                                  <span className="font-medium">{item.product_name || item.quantity} x {item.product_name}</span>
                                  <span className="ml-2 text-gray-600">({item.reason || 'No reason provided'})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {returnItem.notes && (
                          <div className="mt-2 p-2 bg-white rounded text-xs">
                            <p className="text-gray-700">{returnItem.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2" size={18} />
              Sale Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Patient Info */}
            {(patientName || patientPhone) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Patient Information</h4>
                {patientName && <p className="text-sm">Name: {patientName}</p>}
                {patientPhone && <p className="text-sm">Phone: {patientPhone}</p>}
                {patientAge && <p className="text-sm">Age: {patientAge}</p>}
                {patientGender && <p className="text-sm">Gender: {patientGender}</p>}
              </div>
            )}
            
            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items ({cartItems.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item.cart_key || `preview-item-${index}`} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">{item.batch} • NPR {item.price} × {item.quantity}</p>
                    </div>
                    <p className="font-medium">NPR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>NPR {subtotal.toFixed(2)}</span>
                </div>
                {shouldShowTax && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({posSettings.tax_rate}%):</span>
                    <span>NPR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-NPR {calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>NPR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Payment Method:</span>
                  <Badge variant="outline">
                    {splitPayments.some(p => p.amount && parseFloat(p.amount) > 0) ? 'Split Payment' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid Amount:</span>
                  <span>NPR {(parseFloat(paidAmount) || 0).toFixed(2)}</span>
                </div>
                {splitPayments.some(p => p.amount && parseFloat(p.amount) > 0) && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Split Details:</div>
                    {splitPayments.filter(p => p.amount && parseFloat(p.amount) > 0).map((payment, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-600">
                        <span>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}:</span>
                        <span>NPR {parseFloat(payment.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {creditAmount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Credit Amount:</span>
                    <span>NPR {creditAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowPreviewModal(false);
                  handleCheckout();
                }} 
                className={`flex-1 ${parseFloat(paidAmount) < total && paidAmount !== "" ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'}`}
              >
                Confirm Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Split Payment Modal */}
      <Dialog open={showSplitPaymentModal} onOpenChange={setShowSplitPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Split className="mr-2" size={18} />
              Split Payment
            </DialogTitle>
            <DialogDescription>
              Split the total amount across multiple payment methods
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg">NPR {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {splitPayments.map((payment, index) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Select
                      value={payment.method}
                      onValueChange={(value) => {
                        const newPayments = [...splitPayments];
                        newPayments[index].method = value;
                        setSplitPayments(newPayments);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>

                    {splitPayments.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPayments = splitPayments.filter((_, i) => i !== index);
                          setSplitPayments(newPayments);
                        }}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={payment.amount}
                        onChange={(e) => {
                          const newPayments = [...splitPayments];
                          newPayments[index].amount = e.target.value;
                          setSplitPayments(newPayments);
                        }}
                        placeholder="0.00"
                        className="h-8 text-sm"
                      />
                    </div>
                    {payment.method !== 'cash' && (
                      <div>
                        <Label className="text-xs">Transaction ID</Label>
                        <Input
                          value={payment.transaction_id}
                          onChange={(e) => {
                            const newPayments = [...splitPayments];
                            newPayments[index].transaction_id = e.target.value;
                            setSplitPayments(newPayments);
                          }}
                          placeholder="TXN123"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {splitPayments.length < 4 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSplitPayments([...splitPayments, { method: 'cash', amount: '', transaction_id: '' }]);
                  }}
                  className="w-full"
                >
                  <Plus size={14} className="mr-2" />
                  Add Payment Method
                </Button>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Split Amount:</span>
                  <span className="font-medium">
                    NPR {splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className={`font-medium ${total - splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    NPR {Math.max(0, total - splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSplitPaymentModal(false);
                  setSplitPayments([
                    { method: 'cash', amount: '', transaction_id: '' },
                    { method: 'online', amount: '', transaction_id: '' }
                  ]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const totalSplit = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                  if (totalSplit > 0) {
                    setPaidAmount(totalSplit.toString());
                    setPaymentMethod('split');
                  }
                  setShowSplitPaymentModal(false);
                }}
                className="flex-1"
                disabled={splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) === 0}
              >
                Apply Split
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Approval Dialog */}
      <Dialog open={showCreditApprovalDialog} onOpenChange={setShowCreditApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {patientCreditInfo && patientCreditInfo.credit_allowed ? 'Credit Limit Adjustment Required' : 'Credit Approval Required'}
            </DialogTitle>
            <DialogDescription>
              {patientCreditInfo && patientCreditInfo.credit_allowed
                ? 'The credit amount exceeds the available limit. Please adjust the credit limit to complete this sale.'
                : 'This patient doesn\'t have credit approval. Would you like to approve credit to complete this sale?'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${patientCreditInfo && patientCreditInfo.credit_allowed ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="text-sm text-muted-foreground">Sale Summary</div>
              <div className="font-medium">{patientName}</div>
              <div className="text-sm">Total: NPR {total.toFixed(2)}</div>
              <div className="text-sm">Credit Required: NPR {creditAmount.toFixed(2)}</div>
              {patientCreditInfo && patientCreditInfo.credit_allowed && (
                <div className="text-sm mt-2">
                  <div>Current Credit Balance: NPR {patientCreditInfo.current_credit_balance?.toLocaleString() || '0'}</div>
                  <div>Current Credit Limit: NPR {patientCreditInfo.credit_limit?.toLocaleString() || '0'}</div>
                  <div>Available Credit: NPR {(patientCreditInfo.credit_limit - (patientCreditInfo.current_credit_balance || 0)).toLocaleString()}</div>
                  <div className="text-red-600 font-medium mt-1">
                    Additional Credit Needed: NPR {(creditAmount - (patientCreditInfo.credit_limit - (patientCreditInfo.current_credit_balance || 0))).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="credit-limit">Credit Limit (NPR)</Label>
                <Input
                  id="credit-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditApprovalData.credit_limit}
                  onChange={(e) => setCreditApprovalData(prev => ({ ...prev, credit_limit: e.target.value }))}
                  placeholder="Enter credit limit"
                />
              </div>

              <div>
                <Label htmlFor="patient-phone">Phone Number</Label>
                <Input
                  id="patient-phone"
                  value={creditApprovalData.phone}
                  onChange={(e) => setCreditApprovalData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number is required"
                />
                {!creditApprovalData.phone.trim() && (
                  <div className="text-sm text-red-600 mt-1">Phone number is required for credit approval</div>
                )}
              </div>

              <div>
                <Label htmlFor="patient-address">Address</Label>
                <Input
                  id="patient-address"
                  value={creditApprovalData.address}
                  onChange={(e) => setCreditApprovalData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Address is required for credit approval"
                />
                {!creditApprovalData.address.trim() && (
                  <div className="text-sm text-red-600 mt-1">Address is required for credit approval</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleSkipCreditApproval}
                className="flex-1"
              >
                Skip & Pay Full
              </Button>
              <Button
                onClick={handleCreditApprovalSubmit}
                disabled={isProcessingCreditApproval}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessingCreditApproval ? 'Processing...' : (patientCreditInfo && patientCreditInfo.credit_allowed ? 'Increase Limit' : 'Approve Credit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptData={receiptData}
      />
    </div>
  );
}