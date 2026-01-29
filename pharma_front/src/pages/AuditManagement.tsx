import { useState, useEffect } from "react";
import { auditAPI } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Calendar,
  FileText,
  Database,
  Lock,
  Search,
  Download
} from "lucide-react";
import {
  mockAuditLogs,
  mockComplianceAudits,
  mockSecurityEvents,
  mockDataIntegrityChecks,
  getAuditLogsBySeverity,
  getComplianceAuditsByStatus,
  getSecurityEventsByStatus,
  getOpenAuditFindings
} from "@/data/auditMockData";

export default function AuditManagement() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await auditAPI.getLogs();
        if (response.data && response.data.success) {
          setLogs(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const logsToDisplay = logs.length > 0 ? logs : mockAuditLogs;
  const totalLogs = logs.length || mockAuditLogs.length;
  const criticalEvents = getAuditLogsBySeverity('critical').length;
  const activeAudits = getComplianceAuditsByStatus('in_progress').length;
  const openFindings = getOpenAuditFindings().length;
  const securityAlerts = getSecurityEventsByStatus('open').length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit Management</h1>
          <p className="text-sm text-muted-foreground">Complete audit trail and compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="w-3 h-3 mr-1" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Logs</p>
                <p className="text-lg font-semibold text-foreground">{totalLogs}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Security Alerts</p>
                <p className="text-lg font-semibold text-foreground">{securityAlerts}</p>
                <p className="text-xs text-destructive">Open alerts</p>
              </div>
              <Shield className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Audits</p>
                <p className="text-lg font-semibold text-foreground">{activeAudits}</p>
                <p className="text-xs text-primary">In progress</p>
              </div>
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Open Findings</p>
                <p className="text-lg font-semibold text-foreground">{openFindings}</p>
                <p className="text-xs text-secondary">Needs action</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical Events</p>
                <p className="text-lg font-semibold text-foreground">{criticalEvents}</p>
                <p className="text-xs text-destructive">High priority</p>
              </div>
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">System Audit Logs</CardTitle>
              <CardDescription className="text-xs">Complete system activity trail</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Timestamp</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">User</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Action</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Description</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">IP Address</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Severity</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsToDisplay.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium text-foreground">{log.user_name || log.userName}</div>
                            <div className="text-xs text-muted-foreground">{log.userRole || 'System'}</div>
                          </div>
                        </td>
                        <td className="p-2 text-foreground">{log.action}</td>
                        <td className="p-2 text-muted-foreground max-w-[200px] truncate">{log.description || log.module}</td>
                        <td className="p-2 text-muted-foreground">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              log.severity === 'critical' ? 'destructive' :
                                log.severity === 'high' ? 'destructive' :
                                  log.severity === 'medium' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {log.severity || 'info'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Eye className="w-3 h-3" />
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

        <TabsContent value="compliance" className="space-y-4">
          <div className="space-y-3">
            {mockComplianceAudits.map((audit) => (
              <Card key={audit.id} className="bg-card border border-border">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{audit.title}</h3>
                        <p className="text-xs text-muted-foreground">{audit.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {audit.auditType.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {audit.complianceScore}%
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          audit.status === 'completed' ? 'default' :
                            audit.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {audit.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Auditor:</span>
                        <span className="ml-1 text-foreground">{audit.auditor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-1 text-foreground">
                          {audit.startDate} - {audit.endDate}
                        </span>
                      </div>
                    </div>

                    {audit.findings.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-foreground mb-2">Findings ({audit.findings.length})</h4>
                        {audit.findings.slice(0, 2).map((finding) => (
                          <div key={finding.id} className="p-2 bg-muted rounded mb-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{finding.title}</span>
                              <Badge
                                variant={
                                  finding.severity === 'critical' ? 'destructive' :
                                    finding.severity === 'high' ? 'destructive' :
                                      finding.severity === 'medium' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {finding.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="space-y-3">
            {mockSecurityEvents.map((event) => (
              <Card key={event.id} className="bg-card border border-border">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{event.title}</h3>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>IP: {event.ipAddress}</span>
                          <span>•</span>
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            event.severity === 'critical' ? 'destructive' :
                              event.severity === 'high' ? 'destructive' :
                                event.severity === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {event.severity}
                        </Badge>
                        <div className="mt-1">
                          <Badge
                            variant={
                              event.status === 'resolved' ? 'default' :
                                event.status === 'investigating' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {event.actions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-foreground">Actions Taken:</h4>
                        {event.actions.map((action) => (
                          <div key={action.id} className="text-xs text-muted-foreground">
                            • {action.description} ({new Date(action.takenAt).toLocaleString()})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Data Integrity Checks</CardTitle>
              <CardDescription className="text-xs">Database consistency and backup verification</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Check Type</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Table/Resource</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Records Checked</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Issues Found</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDataIntegrityChecks.map((check) => (
                      <tr key={check.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 text-foreground">
                          {check.checkType.replace('_', ' ')}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {check.tableName || 'System-wide'}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              check.status === 'passed' ? 'default' :
                                check.status === 'failed' ? 'destructive' :
                                  check.status === 'warning' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {check.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {check.recordsChecked.toLocaleString()}
                        </td>
                        <td className="p-2">
                          <span className={check.issuesFound > 0 ? 'text-destructive' : 'text-success'}>
                            {check.issuesFound}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {check.endTime ?
                            `${Math.round((new Date(check.endTime).getTime() - new Date(check.startTime).getTime()) / 60000)} m`
                            : 'Running...'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Audit Reports</CardTitle>
              <CardDescription className="text-xs">Generate comprehensive audit reports</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-xs">Compliance Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Shield className="w-6 h-6 mb-2" />
                <span className="text-xs">Security Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Activity className="w-6 h-6 mb-2" />
                <span className="text-xs">Activity Report</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}