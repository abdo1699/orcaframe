"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { StatisticCard, TotalProjectsCard } from "@/components/ui/statistic-card";
import { InteractiveMap } from "@/components/maps/interactive-map";
import Sidebar from "@/components/layout/sidebar";
import { Plus, LogOut, Briefcase, DollarSign, Home, Users } from 'lucide-react';
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
import { Label } from "@/components/ui/label";
import Image from 'next/image';

// Helper: group data by month; if valueKey is 'count' we count items, else sum and avg
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
      if (valueKey === 'count') {
        result[monthIndex].value += 1;
      } else {
        result[monthIndex].value += parseFloat(item[valueKey] || 0);
      }
      result[monthIndex].count += 1;
    }
  });

  if (valueKey === 'count') return result; // already counts per month
  return result.map(item => ({ ...item, value: Math.round(item.value / (item.count || 1)) }));
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

// Calculate new KPI stats and growth vs last month
const calculateKpis = (data) => {
  const totalProjects = data.length;
  const totalValue = data.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
  const avgSize = totalProjects ? (data.reduce((s, d) => s + (Number(d.size) || 0), 0) / totalProjects) : 0;

  // Status breakdown
  const onTrack = data.filter(d => (d.status || '').toLowerCase() === 'in progress').length;
  const completed = data.filter(d => (d.status || '').toLowerCase() === 'finished').length;
  const delayed = data.filter(d => (d.status || '').toLowerCase() === 'under construction').length;

  // Growth vs last month
  const byMonthCount = groupByMonth(data, 'count');
  const now = new Date();
  const thisM = now.getMonth();
  const lastM = (thisM - 1 + 12) % 12;
  const thisMonthCount = byMonthCount[thisM]?.value || 0;
  const lastMonthCount = byMonthCount[lastM]?.value || 0;
  const projectsGrowth = lastMonthCount === 0 ? (thisMonthCount > 0 ? 100 : 0) : ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

  // Value growth (sum of price per month)
  const byMonthValueRaw = data.reduce((acc, d) => {
    if (!d.ts) return acc;
    const m = new Date(d.ts).getMonth();
    acc[m] = (acc[m] || 0) + (Number(d.price) || 0);
    return acc;
  }, {});
  const thisMonthValue = byMonthValueRaw[thisM] || 0;
  const lastMonthValue = byMonthValueRaw[lastM] || 0;
  const valueGrowth = lastMonthValue === 0 ? (thisMonthValue > 0 ? 100 : 0) : ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100;

  // Avg size growth
  const byMonthSizeAgg = data.reduce((acc, d) => {
    if (!d.ts) return acc;
    const m = new Date(d.ts).getMonth();
    acc[m] = acc[m] || { sum: 0, c: 0 };
    acc[m].sum += (Number(d.size) || 0);
    acc[m].c += 1;
    return acc;
  }, {});
  const thisMonthAvgSize = byMonthSizeAgg[thisM] ? (byMonthSizeAgg[thisM].sum / byMonthSizeAgg[thisM].c) : 0;
  const lastMonthAvgSize = byMonthSizeAgg[lastM] ? (byMonthSizeAgg[lastM].sum / byMonthSizeAgg[lastM].c) : 0;
  const avgSizeGrowth = lastMonthAvgSize === 0 ? (thisMonthAvgSize > 0 ? 100 : 0) : ((thisMonthAvgSize - lastMonthAvgSize) / lastMonthAvgSize) * 100;

  return {
    totalProjects: { total: totalProjects, growth: projectsGrowth, onTrack, delayed, completed },
    totalValue: { total: totalValue, growth: valueGrowth },
    avgSize: { value: avgSize, growth: avgSizeGrowth },
  };
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

  // Pie distribution with corrected apartment detection and consistent colors
  const propertyTypeData = [
    { name: 'Villa', value: filteredData.filter(item => (item.propertyType || '').toLowerCase() === 'villa').length },
    { name: 'Apartment', value: filteredData.filter(item => (item.propertyType || '').toLowerCase().includes('apart')).length },
    { name: 'Other', value: filteredData.filter(item => {
      const type = (item.propertyType || '').toLowerCase();
      return type !== 'villa' && !type.includes('apart');
    }).length },
  ];

  // Projects per month (count)
  const projectsPerMonth = groupByMonth(filteredData, 'count');

  // Market size by location ($)
  const marketByLocation = Object.values(
    filteredData.reduce((acc, d) => {
      const key = (d.city || 'Other');
      acc[key] = acc[key] || { name: key, value: 0 };
      acc[key].value += Number(d.price) || 0;
      return acc;
    }, {})
  ).sort((a,b) => b.value - a.value).slice(0, 8);

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

  const kpis = calculateKpis(filteredData);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative h-12 w-40">
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
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Monitor your construction projects across Egypt</p>
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
        
        {/* Statistic Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* KPI 1: Total Projects with Status Breakdown */}
          <TotalProjectsCard 
            totalProjects={kpis.totalProjects.total}
            change={`+${kpis.totalProjects.growth.toFixed(1)}% vs last month`}
            changeType={kpis.totalProjects.growth >= 0 ? 'positive' : 'negative'}
            onTrack={kpis.totalProjects.onTrack}
            delayed={kpis.totalProjects.delayed}
            completed={kpis.totalProjects.completed}
            dateRange="From Jan 01 - Jul 30, 2024"
          />
          
          {/* KPI 2: Total Estimated Construction Value */}
          <StatisticCard 
            title="Total Estimated Construction Value"
            value={`$${kpis.totalValue.total.toLocaleString(undefined,{maximumFractionDigits:0})}`}
            change={`+${kpis.totalValue.growth.toFixed(1)}% Growth`}
            changeType={kpis.totalValue.growth >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            dateRange="From Jan 01 - Jul 30, 2024"
          />
          
          {/* KPI 3: Average Project Size */}
          <StatisticCard 
            title="Average Project Size (m²)"
            value={Math.round(kpis.avgSize.value).toLocaleString()}
            change={`+${kpis.avgSize.growth.toFixed(1)}%`}
            changeType={kpis.avgSize.growth >= 0 ? 'positive' : 'negative'}
            icon={Home}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            dateRange="From Jan 01 - Jul 30, 2024"
          />
        </div>

        {/* Main Charts */}
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BarChartComponent 
              data={projectsPerMonth}
              title="Projects Added Per Month"
              dataKey="value"
              valueSuffix=""
            />
            <BarChartComponent 
              data={marketByLocation}
              title="Market Size by Location ($)"
              dataKey="value"
              valueSuffix="$"
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity kept */}
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
            {/* Real Egypt Map with Project Bubbles */}
            <Card className="p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Projects Map</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>High Value</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Medium Value</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Low Value</span>
                  </div>
                </div>
              </div>
              <InteractiveMap data={filteredData} />
            </Card>
          </div>
        </div>

        {/* Distribution Section */}
        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <PieChartComponent 
            data={propertyTypeData} 
            title="Property Type Distribution" 
          />
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
                  <TableHead></TableHead>
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
                      <TableCell>
                        <button className="text-blue-600 hover:underline text-sm">Edit</button>
                      </TableCell>
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
        </div>
      </div>
    </div>
  );
}
