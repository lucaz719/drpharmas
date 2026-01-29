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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, DollarSign, TrendingUp, Calendar, Upload, Package, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI, ExpenseCategory, Expense, InventoryLoss } from "@/services/expensesAPI";

const lossReasons = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'theft', label: 'Theft' },
  { value: 'breakage', label: 'Breakage' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'other', label: 'Other' },
];

export default function ExpenseTracking() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventoryLosses, setInventoryLosses] = useState<InventoryLoss[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    description: ""
  });
  const [newInventoryExpense, setNewInventoryExpense] = useState({
    item_id: "",
    item_name: "",
    batch_no: "",
    quantity: "",
    unit_cost: "",
    reason: "",
    available_stock: 0
  });

  // Get current user's branch info
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userBranch = currentUser?.branch_name || 'Main Store';
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, expensesRes, lossesRes] = await Promise.all([
        expensesAPI.getCategories(),
        expensesAPI.getExpenses(),
        expensesAPI.getInventoryLosses()
      ]);
      setCategories(categoriesRes.data?.results || categoriesRes.data || []);
      setExpenses(expensesRes.data?.results || expensesRes.data || []);
      const lossesData = lossesRes.data?.results || lossesRes.data || [];
      console.log('Inventory Losses Data:', lossesData);
      setInventoryLosses(lossesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.category_name && expense.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || expense.category.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  const filteredInventoryExpenses = Array.isArray(inventoryLosses) ? inventoryLosses.filter(loss => {
    const matchesSearch = loss.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loss.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

  const getReasonBadge = (reason: string) => {
    const reasonObj = lossReasons.find(r => r.value === reason);
    const label = reasonObj?.label || reason;
    
    switch (reason) {
      case "expired":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle size={12} className="mr-1" />{label}</Badge>;
      case "damaged":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><AlertTriangle size={12} className="mr-1" />{label}</Badge>;
      case "theft":
        return <Badge variant="destructive"><AlertTriangle size={12} className="mr-1" />{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewDialogOpen(true);
  };

  const searchInventoryItems = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setInventoryItems([]);
      return;
    }
    try {
      const branchId = currentUser?.branch_id || 11;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/inventory-items/?branch_id=${branchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      const filteredItems = (data || []).filter((item: any) => 
        item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setInventoryItems(filteredItems);
    } catch (error) {
      console.error('Error searching inventory:', error);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setNewInventoryExpense({
      ...newInventoryExpense,
      item_id: item.id,
      item_name: item.medicine.name,
      batch_no: item.batch_number || "",
      unit_cost: item.cost_price?.toString() || "0",
      available_stock: item.current_stock || 0
    });
    setItemSearchTerm(item.medicine.name);
    setShowItemDropdown(false);
  };

  const handleItemSearchChange = (value: string) => {
    setItemSearchTerm(value);
    setShowItemDropdown(true);
    searchInventoryItems(value);
    if (!value) {
      setSelectedItem(null);
      setNewInventoryExpense({
        ...newInventoryExpense,
        item_id: "",
        item_name: "",
        batch_no: "",
        unit_cost: "",
        available_stock: 0
      });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('category', newExpense.category);
      formData.append('amount', newExpense.amount);
      formData.append('description', newExpense.description);
      formData.append('pharmacy', userBranch);
      if (selectedFile) {
        formData.append('receipt', selectedFile);
      }

      await expensesAPI.createExpense(formData);
      toast({
        title: "Expense Added",
        description: "New expense has been recorded successfully",
      });

      setNewExpense({ category: "", amount: "", description: "" });
      setSelectedFile(null);
      setIsExpenseDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleAddInventoryExpense = async () => {
    if (!newInventoryExpense.item_id || !newInventoryExpense.quantity || !newInventoryExpense.unit_cost || !newInventoryExpense.reason) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(newInventoryExpense.quantity);
    if (quantity > newInventoryExpense.available_stock) {
      toast({
        title: "Error",
        description: `Quantity cannot exceed available stock (${newInventoryExpense.available_stock})`,
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        item_name: newInventoryExpense.item_name,
        batch_no: newInventoryExpense.batch_no,
        quantity: quantity,
        unit_cost: parseFloat(newInventoryExpense.unit_cost),
        reason: newInventoryExpense.reason,
        pharmacy: userBranch,
        item_id: newInventoryExpense.item_id
      };

      await expensesAPI.createInventoryLoss(data);
      toast({
        title: "Inventory Loss Recorded",
        description: "Inventory expense has been recorded successfully",
      });

      setNewInventoryExpense({ item_id: "", item_name: "", batch_no: "", quantity: "", unit_cost: "", reason: "", available_stock: 0 });
      setSelectedItem(null);
      setItemSearchTerm("");
      setIsInventoryDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record inventory loss",
        variant: "destructive",
      });
    }
  };

  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0) : 0;
  const totalInventoryLoss = Array.isArray(inventoryLosses) ? inventoryLosses.reduce((sum, loss) => sum + (parseFloat(loss.total_loss) || 0), 0) : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = Array.isArray(expenses) ? expenses.filter(expense => expense.created_at?.startsWith(currentMonth)).reduce((sum, expense) => sum + (expense.amount || 0), 0) : 0;
  const thisMonthInventoryLoss = Array.isArray(inventoryLosses) ? inventoryLosses.filter(loss => loss.created_at?.startsWith(currentMonth)).reduce((sum, loss) => sum + (parseFloat(loss.total_loss) || 0), 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <div className="flex gap-2">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={20} className="mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Record a new expense with optional receipt upload
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expenseType">Expense Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id!.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (NPR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Branch</Label>
                  <Input value={userBranch} disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="receipt">Receipt (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="receipt"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <Upload size={16} className="text-muted-foreground" />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package size={20} className="mr-2" />
                Record Inventory Loss
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Inventory Loss</DialogTitle>
                <DialogDescription>
                  Record expired, damaged, or lost inventory items
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="Search inventory items..."
                    value={itemSearchTerm}
                    onChange={(e) => handleItemSearchChange(e.target.value)}
                    onFocus={() => setShowItemDropdown(true)}
                  />
                  {showItemDropdown && inventoryItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {inventoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => handleItemSelect(item)}
                        >
                          <div className="font-medium">{item.medicine.name}</div>
                          <div className="text-sm text-gray-500">
                            Stock: {item.current_stock} | Cost: NPR {item.cost_price} | Batch: {item.batch_number}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="batchNo">Batch Number</Label>
                  <Input
                    id="batchNo"
                    value={newInventoryExpense.batch_no}
                    disabled
                    className="bg-muted"
                  />
                </div>
                {selectedItem && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-blue-800">Available Stock: {newInventoryExpense.available_stock}</div>
                    <div className="text-sm text-blue-600">Cost Price: NPR {newInventoryExpense.unit_cost}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity Lost</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      max={newInventoryExpense.available_stock}
                      value={newInventoryExpense.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value <= newInventoryExpense.available_stock) {
                          setNewInventoryExpense({...newInventoryExpense, quantity: e.target.value});
                        }
                      }}
                    />
                    {parseInt(newInventoryExpense.quantity) > newInventoryExpense.available_stock && (
                      <p className="text-sm text-red-600 mt-1">
                        Quantity cannot exceed available stock ({newInventoryExpense.available_stock})
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost (NPR)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      value={newInventoryExpense.unit_cost}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Loss</Label>
                  <Select value={newInventoryExpense.reason} onValueChange={(value) => setNewInventoryExpense({...newInventoryExpense, reason: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {lossReasons.map(reason => (
                        <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Branch</Label>
                  <Input value={userBranch} disabled className="bg-muted" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInventoryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddInventoryExpense}>Record Loss</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">NPR {totalExpenses > 0 ? totalExpenses.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">NPR {totalInventoryLoss > 0 ? totalInventoryLoss.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">Inventory Loss</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">NPR {thisMonthExpenses > 0 ? thisMonthExpenses.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">This Month Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">NPR {thisMonthInventoryLoss > 0 ? thisMonthInventoryLoss.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">This Month Loss</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">General Expenses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Losses</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
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
                      <SelectItem key={category.id} value={category.id!.toString()}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.created_at!).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category_name}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                        <TableCell className="font-medium">NPR {expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{expense.pharmacy}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleViewExpense(expense)}>
                            <FileText size={12} className="mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {/* Inventory Loss Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory losses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Loss Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Loss Records ({filteredInventoryExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Batch No.</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Loss</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Pharmacy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventoryExpenses.length > 0 ? filteredInventoryExpenses.map((loss) => (
                      <TableRow key={loss.id}>
                        <TableCell>{new Date(loss.created_at!).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{loss.item_name}</TableCell>
                        <TableCell>{loss.batch_no || '-'}</TableCell>
                        <TableCell>{loss.quantity}</TableCell>
                        <TableCell>NPR {parseFloat(loss.unit_cost || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-red-600">NPR {parseFloat(loss.total_loss || 0).toLocaleString()}</TableCell>
                        <TableCell>{getReasonBadge(loss.reason)}</TableCell>
                        <TableCell>{loss.pharmacy}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No inventory losses recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedExpense.category_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="text-sm font-medium">NPR {selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm">{new Date(selectedExpense.created_at!).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                  <p className="text-sm">{selectedExpense.pharmacy}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedExpense.description}</p>
              </div>
              {selectedExpense.receipt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Receipt</Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedExpense.receipt as string, '_blank')}>
                      <FileText size={16} className="mr-2" />
                      View Receipt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}