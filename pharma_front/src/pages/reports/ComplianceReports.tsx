import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Download, Filter, Calendar,
  Shield, AlertTriangle, CheckCircle, Clock,
  FileText, Users, Eye, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const complianceMetrics = [
  { label: "Overall Compliance", value: "94.2%", status: "good", icon: Shield },
  { label: "Active Violations", value: "3", status: "warning", icon: AlertTriangle },
  { label: "Upcoming Audits", value: "2", status: "info", icon: Calendar },
  { label: "License Renewals", value: "1", status: "warning", icon: FileText }
];

const auditHistory = [
  { date: "2024-05-15", type: "DEA Inspection", status: "Passed", score: 96, inspector: "John Smith", findings: 2 },
  { date: "2024-03-22", type: "State Board Review", status: "Passed", score: 94, inspector: "Sarah Johnson", findings: 3 },
  { date: "2024-01-18", type: "Internal Audit", status: "Passed", score: 98, inspector: "Internal Team", findings: 1 },
  { date: "2023-11-10", type: "FDA Inspection", status: "Passed", score: 92, inspector: "Michael Brown", findings: 4 },
  { date: "2023-09-05", type: "Insurance Audit", status: "Passed", score: 97, inspector: "Lisa Wilson", findings: 2 }
];

const violations = [
  { id: "V001", type: "Documentation", description: "Missing prescription logs for controlled substances", severity: "Medium", date: "2024-06-10", status: "In Progress" },
  { id: "V002", type: "Storage", description: "Temperature logging gap in refrigerated section", severity: "Low", date: "2024-06-08", status: "Resolved" },
  { id: "V003", type: "Staff Training", description: "Annual HIPAA training overdue for 2 staff members", severity: "Medium", date: "2024-06-05", status: "Open" }
];

const licenses = [
  { name: "Pharmacy License", number: "PH-2024-001", expiry: "2024-12-31", status: "Active", authority: "State Board" },
  { name: "DEA Registration", number: "DEA-123456", expiry: "2024-09-15", status: "Expiring Soon", authority: "DEA" },
  { name: "Controlled Substance License", number: "CS-789", expiry: "2025-03-20", status: "Active", authority: "State" },
  { name: "Medicare Provider", number: "MP-456789", expiry: "2025-01-10", status: "Active", authority: "CMS" }
];

const trainingRecords = [
  { employee: "Dr. Sarah Chen", course: "HIPAA Compliance", completion: "2024-05-20", expiry: "2025-05-20", status: "Current" },
  { employee: "Mike Johnson", course: "Controlled Substances", completion: "2024-04-15", expiry: "2025-04-15", status: "Current" },
  { employee: "Lisa Williams", course: "FDA Regulations", completion: "2024-02-10", expiry: "2025-02-10", status: "Current" },
  { employee: "John Davis", course: "HIPAA Compliance", completion: "2023-06-01", expiry: "2024-06-01", status: "Overdue" },
  { employee: "Emily Brown", course: "Safety Protocols", completion: "2024-03-25", expiry: "2025-03-25", status: "Current" }
];

export default function ComplianceReports() {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': case 'active': case 'current': return 'text-success';
      case 'warning': case 'expiring soon': case 'overdue': return 'text-warning';
      case 'failed': case 'expired': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': case 'active': case 'current': case 'resolved': return 'default';
      case 'warning': case 'expiring soon': case 'overdue': case 'in progress': return 'secondary';
      case 'failed': case 'expired': case 'open': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Compliance Reports</h2>
            <p className="text-muted-foreground">Regulatory compliance and audit documentation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Schedule Audit
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {complianceMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className={`text-xs mt-1 ${getStatusColor(metric.status)}`}>
                    {metric.status === 'good' ? 'Excellent compliance' : 
                     metric.status === 'warning' ? 'Needs attention' : 'Monitor closely'}
                  </p>
                </div>
                <metric.icon className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Compliance Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">DEA Compliance</span>
                    <span className="font-medium text-success">97%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">FDA Regulations</span>
                    <span className="font-medium text-success">94%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">HIPAA Compliance</span>
                    <span className="font-medium text-warning">89%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">State Regulations</span>
                    <span className="font-medium text-success">96%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Compliance Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="text-success mt-1" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">DEA Inspection Completed</p>
                      <p className="text-xs text-muted-foreground">Passed with 96% compliance score</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-warning/10 rounded-lg">
                    <Clock className="text-warning mt-1" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">License Renewal Due</p>
                      <p className="text-xs text-muted-foreground">DEA Registration expires in 3 months</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-primary/10 rounded-lg">
                    <Users className="text-primary mt-1" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Staff Training Updated</p>
                      <p className="text-xs text-muted-foreground">3 employees completed HIPAA training</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Requirements */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Upcoming Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="text-warning" size={20} />
                    <Badge variant="secondary">30 days</Badge>
                  </div>
                  <h4 className="font-medium text-foreground">Annual DEA Inventory</h4>
                  <p className="text-sm text-muted-foreground">Complete controlled substance inventory count</p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="text-primary" size={20} />
                    <Badge variant="secondary">45 days</Badge>
                  </div>
                  <h4 className="font-medium text-foreground">Staff Training Review</h4>
                  <p className="text-sm text-muted-foreground">Annual compliance training assessment</p>
                </div>

                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="text-destructive" size={20} />
                    <Badge variant="destructive">15 days</Badge>
                  </div>
                  <h4 className="font-medium text-foreground">License Renewal</h4>
                  <p className="text-sm text-muted-foreground">DEA registration renewal application</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Inspector</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Findings</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditHistory.map((audit, index) => (
                      <tr key={index} className="border-b border-border hover:bg-panel transition-colors">
                        <td className="py-3 px-4 text-foreground">{audit.date}</td>
                        <td className="py-3 px-4 font-medium text-foreground">{audit.type}</td>
                        <td className="py-3 px-4 text-foreground">{audit.inspector}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium text-foreground">{audit.score}%</span>
                            <div className="ml-2 w-16 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-success h-2 rounded-full" 
                                style={{ width: `${audit.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{audit.findings}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(audit.status)}>
                            {audit.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <AlertTriangle className="mr-2 text-warning" size={20} />
                Compliance Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div key={violation.id} className="p-4 bg-panel rounded-lg border-l-4 border-warning">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-panel-foreground">#{violation.id}</span>
                          <Badge variant="outline">{violation.type}</Badge>
                          <Badge variant={violation.severity === 'High' ? 'destructive' : violation.severity === 'Medium' ? 'secondary' : 'default'}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-panel-foreground mb-2">{violation.description}</p>
                        <p className="text-xs text-muted-foreground">Reported: {violation.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(violation.status)}>
                          {violation.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">License Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">License Name</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Number</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Authority</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Expiry Date</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license, index) => (
                      <tr key={index} className="border-b border-border hover:bg-panel transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{license.name}</td>
                        <td className="py-3 px-4 text-foreground">{license.number}</td>
                        <td className="py-3 px-4 text-foreground">{license.authority}</td>
                        <td className="py-3 px-4 text-foreground">{license.expiry}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(license.status)}>
                            {license.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            {license.status === 'Expiring Soon' ? 'Renew' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Staff Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Completion Date</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Expiry Date</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingRecords.map((record, index) => (
                      <tr key={index} className="border-b border-border hover:bg-panel transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{record.employee}</td>
                        <td className="py-3 px-4 text-foreground">{record.course}</td>
                        <td className="py-3 px-4 text-foreground">{record.completion}</td>
                        <td className="py-3 px-4 text-foreground">{record.expiry}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            {record.status === 'Overdue' ? 'Schedule' : 'View Certificate'}
                          </Button>
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