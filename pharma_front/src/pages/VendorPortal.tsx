import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Eye,
  Edit,
  Download,
  Send,
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  BarChart3
} from "lucide-react";
import { 
  mockVendorOrders, 
  mockVendorProducts, 
  mockVendorInvoices, 
  mockVendorPerformance,
  mockVendorCommunications,
  getTotalVendorRevenue,
  getVendorOrdersByStatus,
  getVendorInvoicesByStatus,
  getUnreadCommunications
} from "@/data/vendorMockData";

export default function VendorPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Calculate metrics
  const totalOrders = mockVendorOrders.length;
  const pendingOrders = getVendorOrdersByStatus('pending').length;
  const confirmedOrders = getVendorOrdersByStatus('confirmed').length;
  const totalRevenue = getTotalVendorRevenue();
  const pendingInvoices = getVendorInvoicesByStatus('pending').length;
  const unreadMessages = getUnreadCommunications().length;
  const currentMonthPerformance = mockVendorPerformance[0];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Vendor Portal</h1>
          <p className="text-sm text-muted-foreground">Supplier self-service platform</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="w-3 h-3 mr-1" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="w-3 h-3 mr-1" />
            New Product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-card border border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-lg font-semibold text-foreground">{totalOrders}</p>
                    <p className="text-xs text-success">+12% this month</p>
                  </div>
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-semibold text-foreground">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-success">+8.5% growth</p>
                  </div>
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Orders</p>
                    <p className="text-lg font-semibold text-foreground">{pendingOrders}</p>
                    <p className="text-xs text-warning">Needs attention</p>
                  </div>
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                    <p className="text-lg font-semibold text-foreground">{currentMonthPerformance.onTimeDelivery}%</p>
                    <p className="text-xs text-success">Excellent rating</p>
                  </div>
                  <Truck className="w-6 h-6 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-card border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-card-foreground">Pending Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="text-xs">Orders pending confirmation</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{pendingOrders}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs">Invoices pending payment</span>
                  </div>
                  <Badge variant="default" className="text-xs">{pendingInvoices}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-success" />
                    <span className="text-xs">Unread messages</span>
                  </div>
                  <Badge variant="success" className="text-xs">{unreadMessages}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-card-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockVendorOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-2 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{order.orderNumber}</span>
                      <Badge 
                        variant={
                          order.status === 'confirmed' ? 'default' : 
                          order.status === 'delivered' ? 'success' : 'warning'
                        } 
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{order.pharmacyName}</div>
                    <div className="text-xs text-muted-foreground">₹{order.total.toLocaleString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-card-foreground">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Quality Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-current" />
                    <span className="text-xs font-medium">{currentMonthPerformance.qualityRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Orders Delivered</span>
                  <span className="text-xs font-medium">{currentMonthPerformance.ordersDelivered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Disputes Resolved</span>
                  <span className="text-xs font-medium">{currentMonthPerformance.disputesResolved}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {/* Orders Management */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Order Management</CardTitle>
              <CardDescription className="text-xs">View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Order</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Customer</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Items</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVendorOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">
                          <div className="font-medium text-foreground">{order.orderNumber}</div>
                          {order.deliveryDate && (
                            <div className="text-xs text-muted-foreground">
                              Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="text-foreground">{order.pharmacyName}</div>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {order.items.length} items
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-foreground">₹{order.total.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            Payment: {order.paymentStatus}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              order.status === 'confirmed' ? 'default' : 
                              order.status === 'delivered' ? 'success' : 
                              order.status === 'cancelled' ? 'destructive' : 'warning'
                            }
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {/* Product Catalog */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-card-foreground">Product Catalog</CardTitle>
                  <CardDescription className="text-xs">Manage your product listings</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input placeholder="Search products..." className="pl-7 h-8" />
                </div>
                <Button size="sm" variant="outline">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockVendorProducts.map((product) => (
                  <Card key={product.id} className="bg-muted border border-border">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                          <Badge 
                            variant={
                              product.availability === 'in-stock' ? 'success' :
                              product.availability === 'low-stock' ? 'warning' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {product.availability}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Price:</span>
                            <span className="text-sm font-medium text-foreground">₹{product.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Min Order:</span>
                            <span className="text-xs text-muted-foreground">{product.minimumOrder}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Lead Time:</span>
                            <span className="text-xs text-muted-foreground">{product.leadTime} days</span>
                          </div>
                        </div>

                        <div className="flex gap-1 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {/* Invoice Management */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Invoice Management</CardTitle>
              <CardDescription className="text-xs">Track payments and invoice status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Invoice</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Issue Date</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Due Date</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVendorInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">
                          <div className="font-medium text-foreground">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            Orders: {invoice.orderIds.length}
                          </div>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-foreground">₹{invoice.amount.toLocaleString()}</div>
                          {invoice.paidDate && (
                            <div className="text-xs text-muted-foreground">
                              Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'success' : 
                              invoice.status === 'overdue' ? 'destructive' : 'warning'
                            }
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Communication Center */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-card-foreground">Communication Center</CardTitle>
                  <CardDescription className="text-xs">Messages from customers and system notifications</CardDescription>
                </div>
                <Button size="sm">
                  <Send className="w-3 h-3 mr-1" />
                  New Message
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVendorCommunications.map((message) => (
                <Card key={message.id} className={`bg-muted border ${message.status === 'unread' ? 'border-primary' : 'border-border'}`}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground">{message.subject}</h4>
                            <Badge 
                              variant={
                                message.priority === 'high' ? 'destructive' :
                                message.priority === 'medium' ? 'warning' : 'default'
                              }
                              className="text-xs"
                            >
                              {message.priority}
                            </Badge>
                            {message.status === 'unread' && (
                              <Badge variant="primary" className="text-xs">New</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">From: {message.from}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            message.status === 'replied' ? 'success' : 
                            message.status === 'read' ? 'default' : 'warning'
                          }
                          className="text-xs"
                        >
                          {message.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-foreground">{message.message}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {message.attachments.length} attachment(s)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Send className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3 mr-1" />
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Analytics */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Performance Analytics</CardTitle>
              <CardDescription className="text-xs">Track your performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Period</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Orders Received</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Orders Delivered</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">On-Time Delivery</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Quality Rating</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Revenue</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Disputes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVendorPerformance.map((performance, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 font-medium text-foreground">{performance.period}</td>
                        <td className="p-2 text-muted-foreground">{performance.ordersReceived}</td>
                        <td className="p-2 text-muted-foreground">{performance.ordersDelivered}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span className={`${performance.onTimeDelivery >= 95 ? 'text-success' : performance.onTimeDelivery >= 90 ? 'text-warning' : 'text-destructive'}`}>
                              {performance.onTimeDelivery}%
                            </span>
                            {performance.onTimeDelivery >= 95 && <CheckCircle className="w-3 h-3 text-success" />}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span className="text-foreground">{performance.qualityRating}</span>
                          </div>
                        </td>
                        <td className="p-2 font-medium text-foreground">₹{performance.revenue.toLocaleString()}</td>
                        <td className="p-2">
                          <Badge 
                            variant={performance.disputesResolved === 0 ? 'success' : 'warning'}
                            className="text-xs"
                          >
                            {performance.disputesResolved}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}