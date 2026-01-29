import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  topMedications: {
    name: string;
    prescriptions: number;
    patients: number;
  }[];
  monthlyVisits: {
    month: string;
    visits: number;
    newPatients: number;
  }[];
}

const mockStats: PatientStats = {
  totalPatients: 1247,
  activePatients: 892,
  newPatientsThisMonth: 45,
  averageAge: 42.5,
  genderDistribution: {
    male: 567,
    female: 634,
    other: 46
  },
  topMedications: [
    { name: "Metformin", prescriptions: 234, patients: 189 },
    { name: "Amlodipine", prescriptions: 198, patients: 156 },
    { name: "Losartan", prescriptions: 167, patients: 134 },
    { name: "Atorvastatin", prescriptions: 145, patients: 112 },
    { name: "Omeprazole", prescriptions: 123, patients: 98 }
  ],
  monthlyVisits: [
    { month: "Jan", visits: 456, newPatients: 23 },
    { month: "Feb", visits: 523, newPatients: 31 },
    { month: "Mar", visits: 489, newPatients: 28 },
    { month: "Apr", visits: 567, newPatients: 35 },
    { month: "May", visits: 612, newPatients: 42 },
    { month: "Jun", visits: 578, newPatients: 38 }
  ]
};

export default function PatientReports() {
  const [stats] = useState<PatientStats>(mockStats);
  const [reportType, setReportType] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Patient Reports</h1>
          <p className="text-muted-foreground">Analytics and insights about patient data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview Report</SelectItem>
                <SelectItem value="demographics">Demographics</SelectItem>
                <SelectItem value="medications">Medication Analysis</SelectItem>
                <SelectItem value="visits">Visit Patterns</SelectItem>
                <SelectItem value="revenue">Revenue by Patient</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Custom Range:</span>
              {/* <DatePickerWithRange /> */}
              <Button variant="outline" size="sm">Select Dates</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% from last month</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">{stats.activePatients.toLocaleString()}</p>
                <p className="text-xs text-green-600">+8.3% from last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{stats.newPatientsThisMonth}</p>
                <p className="text-xs text-blue-600">+15.2% from last month</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Age</p>
                <p className="text-2xl font-bold">{stats.averageAge} years</p>
                <p className="text-xs text-gray-600">Stable</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Male</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.genderDistribution.male}</span>
                  <Badge variant="outline">
                    {((stats.genderDistribution.male / stats.totalPatients) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Female</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.genderDistribution.female}</span>
                  <Badge variant="outline">
                    {((stats.genderDistribution.female / stats.totalPatients) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Other</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.genderDistribution.other}</span>
                  <Badge variant="outline">
                    {((stats.genderDistribution.other / stats.totalPatients) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Prescribed Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topMedications.map((med, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.patients} patients</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{med.prescriptions}</p>
                    <p className="text-xs text-muted-foreground">prescriptions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Visits Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Visit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4">
              {stats.monthlyVisits.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-2">
                    <div className="text-2xl font-bold text-blue-600">{month.visits}</div>
                    <div className="text-xs text-muted-foreground">visits</div>
                  </div>
                  <div className="text-sm font-medium">{month.month}</div>
                  <div className="text-xs text-green-600">+{month.newPatients} new</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}