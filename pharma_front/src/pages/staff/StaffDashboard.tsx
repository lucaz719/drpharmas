import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  Truck, 
  Clock, 
  TrendingUp,
  UserPlus,
  CalendarPlus,
  FileText
} from "lucide-react";
import { staffStats, mockEmployees, mockShifts, mockCommissions, mockDeliveries } from "@/data/staffMockData";

export default function StaffDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="destructive">{status}</Badge>;
      case 'On Leave':
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="default">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="primary">{status}</Badge>;
      case 'Completed':
        return <Badge variant="success">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCommissionStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success">{status}</Badge>;
      case 'Approved':
        return <Badge variant="primary">{status}</Badge>;
      case 'Pending':
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <Badge variant="success">{status}</Badge>;
      case 'In Transit':
        return <Badge variant="primary">{status}</Badge>;
      case 'Assigned':
        return <Badge variant="default">{status}</Badge>;
      case 'Pending':
        return <Badge variant="warning">{status}</Badge>;
      case 'Failed':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage employees, shifts, performance, and delivery operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button variant="outline">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule Shift
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {staffStats.activeEmployees} active, {staffStats.onLeave} on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.totalShiftsToday}</div>
            <p className="text-xs text-muted-foreground">
              {staffStats.inProgressShifts} currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${staffStats.totalCommissionsPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {staffStats.pendingCommissions} employees awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.pendingDeliveries + staffStats.inTransitDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {staffStats.inTransitDeliveries} in transit, {staffStats.pendingDeliveries} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="shifts">Shift Management</TabsTrigger>
          <TabsTrigger value="commissions">Commission Tracking</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Management</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Overview</CardTitle>
              <CardDescription>Current staff members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{employee.employeeId}</p>
                        <p className="text-xs text-muted-foreground">{employee.department}</p>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Shifts</CardTitle>
              <CardDescription>Current shift schedule and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{shift.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{shift.role}</p>
                        <p className="text-xs text-muted-foreground">{shift.branch}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{shift.startTime} - {shift.endTime}</p>
                        <p className="text-xs text-muted-foreground">{shift.date}</p>
                      </div>
                      {getShiftStatusBadge(shift.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Tracking</CardTitle>
              <CardDescription>Sales-based incentive management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCommissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{commission.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{commission.period}</p>
                        <p className="text-xs text-muted-foreground">
                          Sales: ${commission.salesAmount.toLocaleString()} | Rate: {(commission.commissionRate * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">${commission.commissionAmount.toLocaleString()}</p>
                        {commission.paidDate && (
                          <p className="text-xs text-muted-foreground">Paid: {commission.paidDate}</p>
                        )}
                      </div>
                      {getCommissionStatusBadge(commission.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Employee evaluation and development tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Mike Thompson</p>
                      <p className="text-sm text-muted-foreground">Q4 2023 Review</p>
                      <p className="text-xs text-muted-foreground">Reviewed by: Dr. Sarah Johnson</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Overall Rating: 4.2/5.0</p>
                      <p className="text-xs text-muted-foreground">Completed: 2024-01-10</p>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Customer Service</p>
                    <Progress value={90} className="h-2" />
                    <p className="text-xs text-muted-foreground">4.5/5.0</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Teamwork</p>
                    <Progress value={80} className="h-2" />
                    <p className="text-xs text-muted-foreground">4.0/5.0</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Productivity</p>
                    <Progress value={86} className="h-2" />
                    <p className="text-xs text-muted-foreground">4.3/5.0</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Punctuality</p>
                    <Progress value={96} className="h-2" />
                    <p className="text-xs text-muted-foreground">4.8/5.0</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Knowledge</p>
                    <Progress value={76} className="h-2" />
                    <p className="text-xs text-muted-foreground">3.8/5.0</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Achievements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Completed Advanced Pharmacy Technician Certification</li>
                      <li>• Reduced prescription processing time by 15%</li>
                      <li>• Zero medication errors for 6 months</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Expand knowledge of new drug interactions</li>
                      <li>• Improve inventory management skills</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Goals</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Complete specialized training in compounding</li>
                      <li>• Mentor new pharmacy technicians</li>
                      <li>• Achieve 98% customer satisfaction rating</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
                <CardDescription>Current delivery status and tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{delivery.customerName}</p>
                          <p className="text-sm text-muted-foreground">{delivery.driverName}</p>
                          <p className="text-xs text-muted-foreground">
                            ${delivery.totalAmount.toFixed(2)} | {delivery.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{delivery.route}</p>
                          <p className="text-xs text-muted-foreground">{delivery.orderId}</p>
                        </div>
                        {getDeliveryStatusBadge(delivery.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Routes</CardTitle>
                <CardDescription>Route optimization and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Route A - Downtown</p>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Central business district and nearby residential areas</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>25 miles</span>
                      <span>4-6 hours</span>
                      <span>8 deliveries</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Route B - Suburbs North</p>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Northern suburban areas and residential neighborhoods</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>35 miles</span>
                      <span>5-7 hours</span>
                      <span>12 deliveries</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Route C - Industrial</p>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Industrial district and commercial areas</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>20 miles</span>
                      <span>3-5 hours</span>
                      <span>6 deliveries</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}