import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Share,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle,
  Folder,
  Star,
  Calendar,
  User,
  Shield,
  RotateCcw,
  MessageSquare,
  Activity,
  Archive,
  Plus,
  FolderPlus
} from "lucide-react";
import { 
  mockDocuments, 
  mockDocumentVersions, 
  mockDocumentWorkflows,
  mockDocumentFolders,
  mockDocumentAccess,
  getDocumentsByCategory,
  getDocumentsByStatus,
  getExpiringDocuments,
  getActiveWorkflows,
  getTotalDocumentSize
} from "@/data/documentMockData";

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState("documents");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Calculate metrics
  const totalDocuments = mockDocuments.length;
  const totalSize = getTotalDocumentSize();
  const expiringDocuments = getExpiringDocuments().length;
  const activeWorkflows = getActiveWorkflows().length;
  const pendingApprovals = getDocumentsByStatus('under_review').length;

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Document Management</h1>
          <p className="text-sm text-muted-foreground">Digital document storage and workflow system</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FolderPlus className="w-3 h-3 mr-1" />
            New Folder
          </Button>
          <Button size="sm">
            <Upload className="w-3 h-3 mr-1" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Documents</p>
                <p className="text-lg font-semibold text-foreground">{totalDocuments}</p>
                <p className="text-xs text-success">+15 this month</p>
              </div>
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Storage Used</p>
                <p className="text-lg font-semibold text-foreground">{formatFileSize(totalSize)}</p>
                <p className="text-xs text-muted-foreground">of 10 GB</p>
              </div>
              <Archive className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Approvals</p>
                <p className="text-lg font-semibold text-foreground">{pendingApprovals}</p>
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
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="text-lg font-semibold text-foreground">{expiringDocuments}</p>
                <p className="text-xs text-destructive">Within 30 days</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Workflows</p>
                <p className="text-lg font-semibold text-foreground">{activeWorkflows}</p>
                <p className="text-xs text-primary">In progress</p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Search and Filters */}
          <Card className="bg-card border border-border">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    placeholder="Search documents by name, category, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8"
                  />
                </div>
                <Button size="sm" variant="outline">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Document Library</CardTitle>
              <CardDescription className="text-xs">Manage your organization's documents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Document</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Category</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Size</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Version</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Access Level</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Modified</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => {
                      const isExpiring = document.expiryDate && 
                        new Date(document.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <tr key={document.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <div>
                                <div className="font-medium text-foreground">{document.name}</div>
                                <div className="text-xs text-muted-foreground">{document.description}</div>
                                <div className="flex gap-1 mt-1">
                                  {document.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="default" className="text-xs capitalize">
                              {document.category.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {formatFileSize(document.fileSize)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">v{document.version}</span>
                              <RotateCcw className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              <Badge 
                                variant={
                                  document.status === 'approved' ? 'success' :
                                  document.status === 'under_review' ? 'warning' :
                                  document.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {document.status.replace('_', ' ')}
                              </Badge>
                              {isExpiring && (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-destructive" />
                                  <span className="text-xs text-destructive">Expiring soon</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Shield className={`w-3 h-3 ${
                                document.accessLevel === 'confidential' ? 'text-destructive' :
                                document.accessLevel === 'restricted' ? 'text-warning' :
                                document.accessLevel === 'internal' ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                              <span className="text-xs capitalize">{document.accessLevel}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-xs text-muted-foreground">
                              {new Date(document.lastModified).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Downloads: {document.downloadCount}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Share className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          {/* Folder Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {mockDocumentFolders.map((folder) => (
              <Card key={folder.id} className="bg-card border border-border hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Folder className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">{folder.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {folder.documentCount} documents
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {new Date(folder.createdAt).toLocaleDateString()}</span>
                      <span>{folder.subfolderCount} subfolders</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {folder.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {/* Document Workflows */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Document Workflows</CardTitle>
              <CardDescription className="text-xs">Track approval and review processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDocumentWorkflows.map((workflow) => {
                const document = mockDocuments.find(doc => doc.id === workflow.documentId);
                
                return (
                  <Card key={workflow.id} className="bg-muted border border-border">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">{document?.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {workflow.workflowType.replace('_', ' ')} workflow
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(workflow.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              workflow.status === 'completed' ? 'success' :
                              workflow.status === 'in_progress' ? 'warning' :
                              workflow.status === 'cancelled' ? 'destructive' : 'default'
                            }
                            className="text-xs"
                          >
                            {workflow.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="text-foreground">
                              Step {workflow.currentStep} of {workflow.totalSteps}
                            </span>
                          </div>
                          
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {workflow.steps.map((step) => (
                            <div key={step.stepNumber} className="flex items-center gap-2 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                step.status === 'completed' ? 'bg-success text-success-foreground' :
                                step.status === 'in_progress' ? 'bg-warning text-warning-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {step.status === 'completed' ? (
                                  <CheckCircle className="w-2 h-2" />
                                ) : (
                                  <span>{step.stepNumber}</span>
                                )}
                              </div>
                              <span className="flex-1">{step.title}</span>
                              <span className="text-muted-foreground">{step.assignedTo}</span>
                            </div>
                          ))}
                        </div>
                        
                        {workflow.dueDate && (
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Due: {new Date(workflow.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {/* Document Versions */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Document Versions</CardTitle>
              <CardDescription className="text-xs">Track document version history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">Document</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Version</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">File Name</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Size</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Changes</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Uploaded By</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocumentVersions.map((version) => {
                      const document = mockDocuments.find(doc => doc.id === version.documentId);
                      
                      return (
                        <tr key={version.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-2">
                            <div className="font-medium text-foreground">{document?.name}</div>
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant={version.status === 'current' ? 'success' : 'default'}
                              className="text-xs"
                            >
                              v{version.version}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">{version.fileName}</td>
                          <td className="p-2 text-muted-foreground">{formatFileSize(version.fileSize)}</td>
                          <td className="p-2">
                            <div className="max-w-48 truncate text-muted-foreground">
                              {version.changes}
                            </div>
                          </td>
                          <td className="p-2 text-muted-foreground">{version.uploadedBy}</td>
                          <td className="p-2 text-muted-foreground">
                            {new Date(version.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant={version.status === 'current' ? 'success' : 'default'}
                              className="text-xs"
                            >
                              {version.status}
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
                              {version.status === 'archived' && (
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Document Activity */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">Document Activity</CardTitle>
              <CardDescription className="text-xs">Recent document access and modifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDocumentAccess.map((access) => {
                const document = mockDocuments.find(doc => doc.id === access.documentId);
                
                return (
                  <Card key={access.id} className="bg-muted border border-border">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {access.action === 'view' && <Eye className="w-4 h-4 text-primary" />}
                            {access.action === 'download' && <Download className="w-4 h-4 text-success" />}
                            {access.action === 'edit' && <Edit className="w-4 h-4 text-warning" />}
                            {access.action === 'delete' && <Trash2 className="w-4 h-4 text-destructive" />}
                            {access.action === 'share' && <Share className="w-4 h-4 text-primary" />}
                            
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {document?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {access.action.charAt(0).toUpperCase() + access.action.slice(1)} by {access.userId}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(access.accessedAt).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              IP: {access.ipAddress}
                            </div>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={
                            access.action === 'view' ? 'default' :
                            access.action === 'download' ? 'success' :
                            access.action === 'edit' ? 'warning' :
                            access.action === 'delete' ? 'destructive' : 'primary'
                          }
                          className="text-xs"
                        >
                          {access.action}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}