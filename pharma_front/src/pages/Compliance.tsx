import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, FileText, Shield, Eye, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const complianceMetrics = [
  { name: "Overall Compliance", score: 98, target: 95, status: "excellent" },
  { name: "DEA Compliance", score: 100, target: 100, status: "excellent" },
  { name: "FDA Regulations", score: 96, target: 95, status: "good" },
  { name: "State Requirements", score: 94, target: 90, status: "good" },
  { name: "Internal Policies", score: 99, target: 95, status: "excellent" }
];

const auditTrail = [
  {
    id: "AT001",
    action: "Controlled Substance Dispensed",
    user: "Dr. Smith",
    timestamp: "2024-01-15 14:30:25",
    details: "Oxycodone 10mg - Patient ID: P1001",
    status: "compliant"
  },
  {
    id: "AT002", 
    action: "Prescription Override",
    user: "Pharmacist Jones",
    timestamp: "2024-01-15 13:45:12",
    details: "Quantity adjustment approved for insurance coverage",
    status: "reviewed"
  },
  {
    id: "AT003",
    action: "Expired Medication Disposal",
    user: "Tech Wilson",
    timestamp: "2024-01-15 12:15:08",
    details: "Batch EXP-001 properly disposed per DEA guidelines",
    status: "compliant"
  }
];

const inspectionHistory = [
  {
    id: "INS001",
    type: "DEA Inspection",
    date: "2023-12-15",
    inspector: "Agent Johnson",
    findings: 0,
    status: "passed",
    nextDue: "2024-12-15",
    report: "Full compliance with controlled substance regulations"
  },
  {
    id: "INS002",
    type: "State Board Review", 
    date: "2023-11-20",
    inspector: "Inspector Davis",
    findings: 2,
    status: "passed_with_notes",
    nextDue: "2024-11-20",
    report: "Minor documentation improvements recommended"
  }
];

const alerts = [
  {
    id: "AL001",
    type: "DEA License Renewal",
    priority: "high",
    dueDate: "2024-03-15",
    description: "DEA registration expires in 60 days",
    action: "Submit renewal application"
  },
  {
    id: "AL002",
    type: "Staff Training",
    priority: "medium", 
    dueDate: "2024-02-28",
    description: "Annual controlled substance training due",
    action: "Schedule training sessions"
  },
  {
    id: "AL003",
    type: "Policy Update",
    priority: "low",
    dueDate: "2024-02-15", 
    description: "HIPAA policy review recommended",
    action: "Review and update documentation"
  }
];

export default function Compliance() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getProgressColor = (score: number, target: number) => {
    if (score >= target) return "bg-green-500";
    if (score >= target * 0.8) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary", 
      low: "outline"
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">Regulatory compliance monitoring and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Audit
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {complianceMetrics.map((metric) => (
          <Card key={metric.name} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{metric.score}%</div>
              <Progress value={metric.score} className="mb-2" />
              <p className={`text-xs ${getStatusColor(metric.status)}`}>
                Target: {metric.target}% • {metric.status.toUpperCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activity</CardTitle>
                <CardDescription>Latest compliance-related actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditTrail.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">{entry.user} • {entry.timestamp}</p>
                        <p className="text-xs text-muted-foreground">{entry.details}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Requirements</CardTitle>
                <CardDescription>Important deadlines and renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{alert.type}</p>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">Due: {alert.dueDate}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete record of compliance-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{entry.action}</h4>
                        <p className="text-sm text-muted-foreground">
                          {entry.user} • {entry.timestamp}
                        </p>
                      </div>
                      <Badge variant={entry.status === "compliant" ? "secondary" : "outline"}>
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{entry.details}</p>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>Past inspections and upcoming reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionHistory.map((inspection) => (
                  <div key={inspection.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{inspection.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {inspection.inspector} • {inspection.date}
                        </p>
                      </div>
                      <Badge variant={inspection.status === "passed" ? "secondary" : "outline"}>
                        {inspection.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm"><strong>Findings:</strong> {inspection.findings}</p>
                        <p className="text-sm"><strong>Next Due:</strong> {inspection.nextDue}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>Report:</strong> {inspection.report}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>Active alerts and required actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{alert.type}</h4>
                        <p className="text-sm text-muted-foreground">Due: {alert.dueDate}</p>
                      </div>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Action Required:</strong> {alert.action}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Snooze
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}