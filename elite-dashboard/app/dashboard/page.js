"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { RadarChartComponent } from "@/components/charts/radar-chart";
import { StatsCard } from "@/components/stats-card";
import { Users, Home, DollarSign, ArrowRight, Plus, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

// Helper function to group data by month
const groupByMonth = (data, valueKey = 'price') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = months.map(month => ({
    name: month,
    value: 0,
    count: 0
  }));

  data.forEach(item => {
    if (!item.ts) return;
    const date = new Date(item.ts);
    const monthIndex = date.getMonth();
    if (monthIndex >= 0 && monthIndex < 12) {
      result[monthIndex].value += parseFloat(item[valueKey] || 0);
      result[monthIndex].count += 1;
    }
  });

  return result.map(item => ({
    ...item,
    value: Math.round(item.value / (item.count || 1))
  }));
};

// Helper function to group data by status
const groupByStatus = (data) => {
  const statuses = ['in progress', 'finished'];
  return statuses.map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: data.filter(item => 
      Array.isArray(item.status) 
        ? item.status.includes(status)
        : item.status === status
    ).length
  }));
};

// Calculate stats from filtered data
const calculateStats = (data) => {
  const totalProperties = data.length;
  const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const avgPrice = totalProperties > 0 ? totalRevenue / totalProperties : 0;
  const inProgress = data.filter(item => item.status === 'in progress').length;
  const finished = data.filter(item => item.status === 'finished').length;
  
  return [
    { 
      title: 'Total Properties', 
      value: totalProperties.toLocaleString(), 
      change: '', 
      isPositive: true, 
      icon: Home 
    },
    { 
      title: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
      change: '', 
      isPositive: true, 
      icon: DollarSign 
    },
    { 
      title: 'Avg. Price', 
      value: `$${avgPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
      change: '', 
      isPositive: true, 
      icon: DollarSign 
    },
    { 
      title: 'Status', 
      value: `${finished} / ${inProgress + finished}`, 
      change: '', 
      isPositive: true, 
      icon: Users,
      description: 'Finished / Total' 
    },
  ];
};

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return Number(num).toLocaleString();
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('viewer'); // 'viewer' or 'admin'
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'in progress', 'finished'
    minPrice: '',
    maxPrice: '',
    city: 'all',
  });

  const router = useRouter();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        // The API returns { ok: true, data: [...] }
        const apiData = result.ok ? result.data : [];
        setData(apiData);
        setFilteredData(apiData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let result = [...data];
    
    if (filters.status !== 'all') {
      result = result.filter(item => 
        Array.isArray(item.status) 
          ? item.status.includes(filters.status)
          : item.status === filters.status
      );
    }
    
    if (filters.minPrice) {
      result = result.filter(item => item.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      result = result.filter(item => item.price <= Number(filters.maxPrice));
    }
    
    if (filters.city !== 'all') {
      result = result.filter(item => item.city === filters.city);
    }
    
    setFilteredData(result);
  }, [data, filters]);

  // Get unique cities for filter
  const cities = [...new Set(data.map(item => item.city).filter(Boolean))];

  // Toggle user role (this would typically come from auth context in a real app)
  const toggleUserRole = () => {
    const newRole = userRole === 'viewer' ? 'admin' : 'viewer';
    setUserRole(newRole);
    // In a real app, you would update the user role in your auth context/state
    localStorage.setItem('userRole', newRole);
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, you would clear the auth token and user data
    localStorage.removeItem('userRole');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      
      // If no role found, redirect to login
      if (!role) {
        window.location.href = '/';
        return;
      }
      
      // Set the user role in state
      setUserRole(role);
      
      // If somehow we got here with an invalid role, redirect to login
      if (role !== 'admin' && role !== 'viewer') {
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    }
  }, []);

  // Sample data for the new charts
  const propertyTypeData = [
    { name: 'Villa', value: filteredData.filter(item => item.propertyType?.toLowerCase() === 'villa').length },
    { name: 'Apartment', value: filteredData.filter(item => item.propertyType?.toLowerCase().includes('apart')).length },
    { name: 'Other', value: filteredData.filter(item => !['villa', 'apartment', 'apart'].includes(item.propertyType?.toLowerCase())).length },
  ];

  const cityPerformanceData = [
    { subject: 'Cairo', A: filteredData.filter(item => item.city?.toLowerCase() === 'cairo').length * 10 || 0 },
    { subject: 'Alexandria', A: filteredData.filter(item => item.city?.toLowerCase() === 'alexandria').length * 8 || 0 },
    { subject: 'Mansoura', A: filteredData.filter(item => item.city?.toLowerCase() === 'mansoura').length * 6 || 0 },
    { subject: 'Dahab', A: filteredData.filter(item => item.city?.toLowerCase() === 'dahab').length * 4 || 0 },
    { subject: 'Other', A: filteredData.filter(item => !['cairo', 'alexandria', 'mansoura', 'dahab'].includes(item.city?.toLowerCase())).length * 2 || 0 },
  ];

  // Handle add data button click
  const handleAddData = () => {
    router.push('/add-data');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-32">
              <Image
                src="/orcaframe-logo.png"
                alt="OrcaFrame Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            {userRole === 'admin' && (
              <Button 
                onClick={handleAddData} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Data
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <Card className="p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
              <select
                id="status-filter"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="finished">Finished</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">City</Label>
              <select
                id="city-filter"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min Price</Label>
              <input
                type="number"
                id="min-price"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max Price</Label>
              <input
                type="number"
                id="max-price"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
          </div>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {calculateStats(filteredData).map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              change={stat.change}
              isPositive={stat.isPositive}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AreaChartComponent 
              data={groupByMonth(filteredData, 'price')} 
              title="Average Price by Month" 
              valueSuffix="$"
            />
            <BarChartComponent 
              data={groupByStatus(filteredData)} 
              title="Properties by Status" 
              dataKey="value"
              valueSuffix=""
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <LineChartComponent 
              data={groupByMonth(filteredData, 'size')} 
              title="Average Size by Month (sqm)" 
            />
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {filteredData
                  .sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0))
                  .slice(0, 4)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="text-sm font-medium">
                            {item.propertyType || 'Property'} in {item.city || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.ts ? new Date(item.ts).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-blue-500">View</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>

        {/* New Charts Section */}
        <div className="grid gap-6 mt-8">
          <div className="grid gap-6 md:grid-cols-2">
            <PieChartComponent 
              data={propertyTypeData} 
              title="Property Type Distribution" 
            />
            <RadarChartComponent 
              data={cityPerformanceData} 
              title="City Performance" 
            />
          </div>
        </div>

        {/* Data Table */}
        <Card className="mt-8">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Property Listings</h3>
              <p className="text-sm text-gray-500">Showing {filteredData.length} properties</p>
            </div>
            {userRole === 'admin' && (
              <Button onClick={handleAddData} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Property
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Size (sqm)</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Floors</TableHead>
                  <TableHead>Parking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.propertyType || 'N/A'}</TableCell>
                      <TableCell>{item.size ? formatNumber(item.size) : 'N/A'}</TableCell>
                      <TableCell>${item.price ? formatNumber(item.price) : 'N/A'}</TableCell>
                      <TableCell>{item.city || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status?.toLowerCase() === 'finished' ? 'bg-green-100 text-green-800' : 
                          item.status?.toLowerCase() === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{item.floors || 'N/A'}</TableCell>
                      <TableCell>{item.parking_spaces || '0'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No properties found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );

}
