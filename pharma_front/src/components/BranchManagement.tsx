import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, MapPin, Users, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { organizationsAPI, usersAPI, Branch, User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function BranchManagement() {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getBranches();
      
      if (response.success && response.data) {
        setBranches(response.data);
      } else if (Array.isArray(response)) {
        setBranches(response);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranches([]);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsersByBranch = async (branch: Branch) => {
    try {
      setUsersLoading(true);
      const response = await usersAPI.getUsers();
      
      let allUsers: User[] = [];
      if (response.success && response.data) {
        allUsers = response.data;
      } else if (Array.isArray(response)) {
        allUsers = response;
      }

      // Filter users by selected branch
      const branchUsers = allUsers.filter(user => 
        user.branch_id === branch.id || user.branch_name === branch.name
      );
      
      setUsers(branchUsers);
      setSelectedBranch(branch);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      toast({
        title: 'Error',
        description: 'Failed to load users for this branch',
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      pending: { variant: 'outline' as const, icon: Loader2, color: 'text-yellow-600' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleBackToBranches = () => {
    setSelectedBranch(null);
    setUsers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground">
            {selectedBranch 
              ? `Users in ${selectedBranch.name} branch`
              : 'Manage pharmacy organizations and their branches'
            }
          </p>
        </div>
        {selectedBranch && (
          <Button variant="outline" onClick={handleBackToBranches}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Branches
          </Button>
        )}
      </div>

      {!selectedBranch ? (
        // Branch List View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Branches ({branches.length})
            </CardTitle>
            <CardDescription>
              Click on a branch to view its users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch, index) => (
                    <TableRow 
                      key={branch.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => loadUsersByBranch(branch)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium text-blue-600 hover:text-blue-800">
                        {branch.name}
                      </TableCell>
                      <TableCell>{branch.code}</TableCell>
                      <TableCell>{branch.organization_name}</TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>{branch.manager_name || 'Not assigned'}</TableCell>
                      <TableCell>{branch.total_users || 0}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {branch.city && branch.state ? `${branch.city}, ${branch.state}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        // Users by Branch View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users in {selectedBranch.name} ({users.length})
            </CardTitle>
            <CardDescription>
              Branch: {selectedBranch.name} | Organization: {selectedBranch.organization_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found in this branch
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}