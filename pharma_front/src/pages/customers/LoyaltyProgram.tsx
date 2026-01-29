import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Gift, Star, TrendingUp, Crown, Award, Users, CreditCard, Plus, Search, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockLoyaltyMembers = [
  {
    id: "C001",
    customerId: "C001",
    customerName: "Ram Sharma",
    email: "ram.sharma@email.com",
    phone: "+977-9841234567",
    currentTier: "Gold",
    totalPoints: 2450,
    usedPoints: 200,
    availablePoints: 2250,
    totalSpent: 25000,
    joinDate: "2023-01-15",
    lastActivity: "2024-01-10",
    tierProgress: 75,
    nextTierRequired: 3000,
    rewardsEarned: 12,
    rewardsRedeemed: 3,
    avatar: ""
  },
  {
    id: "C002",
    customerId: "C002",
    customerName: "Sita Gurung",
    email: "sita.gurung@email.com",
    phone: "+977-9856789012",
    currentTier: "Silver",
    totalPoints: 1850,
    usedPoints: 150,
    availablePoints: 1700,
    totalSpent: 18500,
    joinDate: "2023-03-20",
    lastActivity: "2024-01-12",
    tierProgress: 62,
    nextTierRequired: 2500,
    rewardsEarned: 8,
    rewardsRedeemed: 2,
    avatar: ""
  },
  {
    id: "C003",
    customerId: "C003",
    customerName: "Hari Thapa",
    email: "hari.thapa@email.com",
    phone: "+977-9812345678",
    currentTier: "Platinum",
    totalPoints: 4500,
    usedPoints: 500,
    availablePoints: 4000,
    totalSpent: 45000,
    joinDate: "2022-11-10",
    lastActivity: "2024-01-08",
    tierProgress: 100,
    nextTierRequired: 5000,
    rewardsEarned: 25,
    rewardsRedeemed: 8,
    avatar: ""
  },
  {
    id: "C004",
    customerId: "C004",
    customerName: "Maya Shrestha",
    email: "maya.shrestha@email.com",
    phone: "+977-9823456789",
    currentTier: "Bronze",
    totalPoints: 1200,
    usedPoints: 50,
    availablePoints: 1150,
    totalSpent: 12000,
    joinDate: "2023-06-05",
    lastActivity: "2024-01-05",
    tierProgress: 48,
    nextTierRequired: 1500,
    rewardsEarned: 5,
    rewardsRedeemed: 1,
    avatar: ""
  }
];

const mockRewards = [
  {
    id: "R001",
    name: "10% Discount Voucher",
    description: "Get 10% off on your next purchase",
    pointsCost: 500,
    category: "discount",
    validityDays: 30,
    usageLimit: 1,
    isActive: true,
    totalRedeemed: 125
  },
  {
    id: "R002",
    name: "Free Health Checkup",
    description: "Complimentary basic health checkup",
    pointsCost: 1000,
    category: "service",
    validityDays: 60,
    usageLimit: 1,
    isActive: true,
    totalRedeemed: 45
  },
  {
    id: "R003",
    name: "Vitamin Supplement Pack",
    description: "Free vitamin supplement pack worth Rs. 1500",
    pointsCost: 1500,
    category: "product",
    validityDays: 90,
    usageLimit: 1,
    isActive: true,
    totalRedeemed: 28
  },
  {
    id: "R004",
    name: "Free Prescription Delivery",
    description: "Complimentary home delivery for 3 orders",
    pointsCost: 300,
    category: "service",
    validityDays: 180,
    usageLimit: 3,
    isActive: true,
    totalRedeemed: 89
  }
];

const mockTransactions = [
  {
    id: "T001",
    customerId: "C001",
    customerName: "Ram Sharma",
    type: "earned",
    points: 250,
    description: "Purchase - Invoice #INV-001",
    date: "2024-01-10",
    orderAmount: 2500
  },
  {
    id: "T002",
    customerId: "C001",
    customerName: "Ram Sharma",
    type: "redeemed",
    points: -500,
    description: "10% Discount Voucher",
    date: "2024-01-08",
    orderAmount: 0
  },
  {
    id: "T003",
    customerId: "C002",
    customerName: "Sita Gurung",
    type: "earned",
    points: 185,
    description: "Purchase - Invoice #INV-002",
    date: "2024-01-12",
    orderAmount: 1850
  }
];

const loyaltyTiers = ["Bronze", "Silver", "Gold", "Platinum"];
const rewardCategories = ["discount", "service", "product"];

export default function LoyaltyProgram() {
  const [activeTab, setActiveTab] = useState("members");
  const [loyaltyMembers] = useState(mockLoyaltyMembers);
  const [rewards] = useState(mockRewards);
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const { toast } = useToast();

  const filteredMembers = loyaltyMembers.filter(member => {
    const matchesSearch = member.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || member.currentTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: string) => {
    const styles = {
      Platinum: "bg-purple-100 text-purple-800 border-purple-200",
      Gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Silver: "bg-gray-100 text-gray-800 border-gray-200",
      Bronze: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return <Badge className={styles[tier] || styles.Bronze}>{tier}</Badge>;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum": return <Crown className="h-4 w-4 text-purple-600" />;
      case "Gold": return <Award className="h-4 w-4 text-yellow-600" />;
      case "Silver": return <Star className="h-4 w-4 text-gray-600" />;
      default: return <Gift className="h-4 w-4 text-orange-600" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      discount: "bg-green-100 text-green-800 border-green-200",
      service: "bg-blue-100 text-blue-800 border-blue-200",
      product: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return <Badge className={styles[category] || styles.discount}>{category}</Badge>;
  };

  const handleRedeemReward = (memberId: string, rewardId: string) => {
    toast({
      title: "Reward Redeemed",
      description: "Points have been deducted and reward has been issued"
    });
  };

  const totalMembers = loyaltyMembers.length;
  const totalPointsIssued = loyaltyMembers.reduce((sum, m) => sum + m.totalPoints, 0);
  const totalPointsRedeemed = loyaltyMembers.reduce((sum, m) => sum + m.usedPoints, 0);
  const totalRewardsRedeemed = rewards.reduce((sum, r) => sum + r.totalRedeemed, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage customer loyalty points and rewards</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Reward
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button>
            <Gift className="mr-2 h-4 w-4" />
            Program Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active loyalty members</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Points used for rewards</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewardsRedeemed}</div>
            <p className="text-xs text-muted-foreground">Total reward redemptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="members" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Tiers</SelectItem>
                  {loyaltyTiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Current Tier</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Tier Progress</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="animate-fade-in">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.customerName}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTierIcon(member.currentTier)}
                          {getTierBadge(member.currentTier)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.availablePoints.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.usedPoints} used | {member.totalPoints} total
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">Rs. {member.totalSpent.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{member.tierProgress}%</span>
                            <span>Next: {member.nextTierRequired}</span>
                          </div>
                          <Progress value={member.tierProgress} className="w-full" />
                        </div>
                      </TableCell>
                      <TableCell>{member.lastActivity}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowMemberDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      {getCategoryBadge(reward.category)}
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-lg">{reward.pointsCost} points</span>
                        </div>
                        <Badge variant={reward.isActive ? "default" : "secondary"}>
                          {reward.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Validity:</span>
                          <div className="font-medium">{reward.validityDays} days</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Usage:</span>
                          <div className="font-medium">{reward.usageLimit}x</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Redeemed:</span>
                          <div className="font-medium">{reward.totalRedeemed}</div>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Reward
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Order Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="animate-fade-in">
                      <TableCell>
                        <div className="font-medium">{transaction.customerName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.customerId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={transaction.type === "earned" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${transaction.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "earned" ? "+" : ""}{transaction.points}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        {transaction.orderAmount > 0 ? `Rs. ${transaction.orderAmount.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tier Distribution</CardTitle>
                  <CardDescription>Member distribution across loyalty tiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loyaltyTiers.map((tier) => {
                      const count = loyaltyMembers.filter(m => m.currentTier === tier).length;
                      const percentage = (count / totalMembers) * 100;
                      return (
                        <div key={tier} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTierIcon(tier)}
                              <span className="font-medium">{tier}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {count} members ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                          <Progress value={percentage} className="w-full" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Points Analytics</CardTitle>
                  <CardDescription>Point earning and redemption overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totalPointsIssued.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Points Issued</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{totalPointsRedeemed.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Points Redeemed</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Redemption Rate</span>
                        <span>{((totalPointsRedeemed / totalPointsIssued) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(totalPointsRedeemed / totalPointsIssued) * 100} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loyalty Member Details</DialogTitle>
            <DialogDescription>Complete loyalty program information</DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback className="text-xl">
                    {selectedMember.customerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Member Name</Label>
                      <div className="text-lg font-medium">{selectedMember.customerName}</div>
                    </div>
                    <div>
                      <Label>Current Tier</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTierIcon(selectedMember.currentTier)}
                        {getTierBadge(selectedMember.currentTier)}
                      </div>
                    </div>
                    <div>
                      <Label>Available Points</Label>
                      <div className="text-lg font-medium text-green-600">{selectedMember.availablePoints.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label>Total Earned</Label>
                      <div className="text-lg font-medium">{selectedMember.totalPoints.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tier Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Progress to {selectedMember.currentTier === "Platinum" ? "Platinum Max" : "Next Tier"}</span>
                        <span>{selectedMember.tierProgress}%</span>
                      </div>
                      <Progress value={selectedMember.tierProgress} className="w-full" />
                      <div className="text-sm text-muted-foreground">
                        {selectedMember.nextTierRequired - selectedMember.totalPoints} more points needed
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rewards Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedMember.rewardsEarned}</div>
                        <div className="text-sm text-muted-foreground">Rewards Earned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedMember.rewardsRedeemed}</div>
                        <div className="text-sm text-muted-foreground">Rewards Used</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Rewards</CardTitle>
                  <CardDescription>Rewards this member can redeem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards
                      .filter(reward => reward.pointsCost <= selectedMember.availablePoints && reward.isActive)
                      .map((reward) => (
                        <div key={reward.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{reward.name}</div>
                            {getCategoryBadge(reward.category)}
                          </div>
                          <div className="text-sm text-muted-foreground">{reward.description}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{reward.pointsCost} points</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleRedeemReward(selectedMember.id, reward.id)}
                            >
                              Redeem
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}