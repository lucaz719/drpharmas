import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, AlertTriangle, CheckCircle, Clock, 
  FileText, Calendar, Award, Building,
  TrendingUp, Users, Eye, ExternalLink
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Mock data for compliance dashboard
const complianceStats = {
  activeLicenses: 8,
  expiringLicenses: 2,
  pendingReports: 3,
  overdueTasks: 1,
  inspectionsPassed: 12,
  complianceScore: 92
};

const urgentTasks = [
  { id: 1, task: "Renew Pharmacy License", dueDate: "2024-02-15", priority: "high", type: "license" },
  { id: 2, task: "Submit Monthly DDA Report", dueDate: "2024-02-10", priority: "high", type: "report" },
  { id: 3, task: "Update Drug Register", dueDate: "2024-02-05", priority: "medium", type: "register" },
  { id: 4, task: "Prepare for DDA Inspection", dueDate: "2024-02-20", priority: "medium", type: "inspection" }
];

const recentActivity = [
  { id: 1, activity: "Pharmacy License renewed", date: "2024-01-15", status: "completed", type: "license" },
  { id: 2, activity: "DDA inspection completed", date: "2024-01-12", status: "passed", type: "inspection" },
  { id: 3, activity: "Monthly report submitted", date: "2024-01-10", status: "submitted", type: "report" },
  { id: 4, activity: "Drug register updated", date: "2024-01-08", status: "completed", type: "register" }
];

const licenseStatus = [
  { id: "LIC-001", name: "Pharmacy Operating License", issuer: "DDA Nepal", status: "active", expiryDate: "2024-12-31", daysLeft: 340 },
  { id: "LIC-002", name: "Drug Store License", issuer: "DDA Nepal", status: "active", expiryDate: "2024-06-30", daysLeft: 155 },
  { id: "LIC-003", name: "Narcotic License", issuer: "DDA Nepal", status: "expiring", expiryDate: "2024-02-28", daysLeft: 15 },
  { id: "LIC-004", name: "Ayurvedic License", issuer: "DAV Nepal", status: "active", expiryDate: "2024-09-15", daysLeft: 233 }
];

export default function ComplianceDashboard() {
  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline"
    };
    return <Badge variant={variants[priority] as any}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default", label: "Active" },
      expiring: { variant: "secondary", label: "Expiring Soon" },
      expired: { variant: "destructive", label: "Expired" },
      pending: { variant: "outline", label: "Pending" },
      completed: { variant: "default", label: "Completed" },
      passed: { variant: "default", label: "Passed" },
      submitted: { variant: "default", label: "Submitted" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Nepal Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor DDA compliance, licenses, and regulatory requirements</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <NavLink to="/compliance/licenses">
              <Award size={16} className="mr-2" />
              Manage Licenses
            </NavLink>
          </Button>
          <Button variant="outline" asChild>
            <NavLink to="/compliance/dda-reporting">
              <FileText size={16} className="mr-2" />
              DDA Reports
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Licenses</p>
                <p className="text-2xl font-bold text-green-600">{complianceStats.activeLicenses}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{complianceStats.expiringLicenses}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold text-blue-600">{complianceStats.pendingReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{complianceStats.overdueTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inspections Passed</p>
                <p className="text-2xl font-bold text-green-600">{complianceStats.inspectionsPassed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className={`text-2xl font-bold ${getComplianceColor(complianceStats.complianceScore)}`}>
                  {complianceStats.complianceScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/compliance/licenses" className="block">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">License Management</p>
                <p className="text-sm text-muted-foreground">Track renewal dates</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/compliance/dda-reporting" className="block">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">DDA Reporting</p>
                <p className="text-sm text-muted-foreground">Submit reports</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/compliance/inspections" className="block">
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">Inspection Records</p>
                <p className="text-sm text-muted-foreground">Track inspections</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/compliance/drug-registers" className="block">
              <div className="text-center">
                <Building className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="font-medium">Drug Registers</p>
                <p className="text-sm text-muted-foreground">Maintain registers</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-orange-600" size={20} />
              Urgent Compliance Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {task.dueDate} • Type: {task.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    <Button size="sm">Action</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* License Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 text-blue-600" size={20} />
              License Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {licenseStatus.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{license.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {license.issuer} • Expires: {license.expiryDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {license.daysLeft} days remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(license.status)}
                    {license.daysLeft < 30 && (
                      <AlertTriangle size={16} className="text-orange-600" />
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <NavLink to="/compliance/licenses">Manage All Licenses</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Compliance Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">{activity.activity}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.date} • {activity.type}
                    </p>
                  </div>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DDA Links & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="mr-2 text-blue-600" size={20} />
            DDA Resources & Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink size={16} />
                <span className="font-medium">DDA Official Portal</span>
              </div>
              <p className="text-sm text-muted-foreground">Access official DDA website</p>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} />
                <span className="font-medium">Online License Renewal</span>
              </div>
              <p className="text-sm text-muted-foreground">Renew licenses online</p>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Building size={16} />
                <span className="font-medium">Compliance Guidelines</span>
              </div>
              <p className="text-sm text-muted-foreground">Latest regulations</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}