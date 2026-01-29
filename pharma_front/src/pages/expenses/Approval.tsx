import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSearch } from "@/hooks/useSearch";
import { 
  Search, CheckCircle, XCircle, Clock, 
  DollarSign, Calendar, FileText, Eye
} from "lucide-react";

const pendingExpenses = [
  {
    id: "EXP-001",
    submittedBy: "John Doe",
    category: "Office Supplies",
    amount: 450.75,
    description: "Monthly office supplies - paper, pens, folders",
    date: "2024-01-13",
    receipt: "receipt_001.pdf",
    status: "pending",
    urgency: "normal",
    submittedDate: "2024-01-13",
  },
  {
    id: "EXP-002", 
    submittedBy: "Jane Smith",
    category: "Medical Equipment",
    amount: 1250.00,
    description: "New blood pressure monitor for patient care",
    date: "2024-01-12",
    receipt: "receipt_002.pdf",
    status: "pending",
    urgency: "high",
    submittedDate: "2024-01-12",
  },
  {
    id: "EXP-003",
    submittedBy: "Mike Wilson",
    category: "Marketing", 
    amount: 320.50,
    description: "Social media advertising campaign",
    date: "2024-01-11",
    receipt: "receipt_003.pdf",
    status: "pending",
    urgency: "low",
    submittedDate: "2024-01-11",
  },
];

export default function ExpenseApproval() {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredData: filteredExpenses 
  } = useSearch({
    data: pendingExpenses,
    searchFields: ["id", "submittedBy", "category", "description"],
  });

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      high: "destructive",
      normal: "default",
      low: "outline",
    } as const;
    return <Badge variant={variants[urgency as keyof typeof variants]}>{urgency.toUpperCase()}</Badge>;
  };

  const handleApproval = (expenseId: string, action: "approve" | "reject") => {
    console.log(`${action} expense ${expenseId} with notes: ${approvalNotes}`);
    setSelectedExpense(null);
    setApprovalNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Approval</h2>
          <p className="text-muted-foreground">Review and approve pending expense claims</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-warning">{pendingExpenses.length}</p>
              </div>
              <Clock className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ${pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">
                  {pendingExpenses.filter(exp => exp.urgency === "high").length}
                </p>
              </div>
              <CheckCircle className="text-destructive" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Amount</p>
                <p className="text-2xl font-bold text-primary">
                  ${Math.round(pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0) / pendingExpenses.length)}
                </p>
              </div>
              <DollarSign className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-card-foreground">Pending Expenses</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="p-4 border border-border rounded-lg hover:bg-panel cursor-pointer transition-colors"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground">{expense.id}</h4>
                          {getUrgencyBadge(expense.urgency)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="text-foreground font-medium">{expense.description}</p>
                          <div className="flex items-center">
                            <span>By: {expense.submittedBy}</span>
                            <span className="mx-2">•</span>
                            <span>{expense.category}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span>Submitted: {expense.submittedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">${expense.amount.toFixed(2)}</p>
                        <div className="flex space-x-1 mt-2">
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success-hover"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproval(expense.id, "approve");
                            }}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproval(expense.id, "reject");
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Details */}
        <div className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                {selectedExpense ? "Expense Details" : "Select Expense"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExpense ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">{selectedExpense.id}</h3>
                      {getUrgencyBadge(selectedExpense.urgency)}
                    </div>
                    <div className="p-3 bg-panel rounded">
                      <p className="font-medium text-panel-foreground">${selectedExpense.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{selectedExpense.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-panel rounded">
                      {selectedExpense.description}
                    </p>
                  </div>

                  {/* Submitter Info */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Submitted By</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground">{selectedExpense.submittedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-foreground">{selectedExpense.submittedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Receipt:</span>
                        <Button variant="outline" size="sm">
                          <Eye size={12} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Approval Notes */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Approval Notes</h4>
                    <Textarea
                      placeholder="Add notes for approval/rejection..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Button 
                      className="w-full bg-success hover:bg-success-hover"
                      onClick={() => handleApproval(selectedExpense.id, "approve")}
                    >
                      <CheckCircle size={14} className="mr-2" />
                      Approve Expense
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleApproval(selectedExpense.id, "reject")}
                    >
                      <XCircle size={14} className="mr-2" />
                      Reject Expense
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText size={14} className="mr-2" />
                      Request More Info
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Select an expense to view details and take action.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}