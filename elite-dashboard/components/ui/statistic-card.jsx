'use client';

import { TrendingUp, TrendingDown, Briefcase, DollarSign, Home, Users } from 'lucide-react';

export function StatisticCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  dateRange = "From Jan 01 - Jul 30, 2024",
  iconColor = "text-green-600",
  bgColor = "bg-green-50"
}) {
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 relative">
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bgColor} mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      
      {/* Value */}
      <div className="text-3xl font-bold text-gray-900 mb-4">{value}</div>
      
      {/* Date Range */}
      <p className="text-xs text-gray-400 mb-4">{dateRange}</p>
      
      {/* Change Indicator */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${changeBgColor} ${changeColor}`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        {change}
      </div>
    </div>
  );
}

// Special Total Projects Card Component for the first KPI with status breakdown
export function TotalProjectsCard({ 
  totalProjects, 
  change, 
  changeType = 'positive',
  onTrack,
  delayed,
  completed,
  dateRange = "From Jan 01 - Jul 30, 2024"
}) {
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-white rounded-lg p-6 text-gray-900 relative border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">Total Projects</h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {change}
        </div>
      </div>
      
      {/* Total Projects */}
      <div className="flex items-baseline gap-3 mb-6">
        <div className="text-4xl font-bold text-gray-900">{totalProjects}</div>
        <div className={`text-lg font-medium ${changeColor}`}>{change}</div>
      </div>
      
      {/* Status Breakdown Bar */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-green-500" style={{width: `${(onTrack / totalProjects) * 100}%`}}></div>
          <div className="bg-yellow-500" style={{width: `${(delayed / totalProjects) * 100}%`}}></div>
          <div className="bg-emerald-600" style={{width: `${(completed / totalProjects) * 100}%`}}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>On Track: {onTrack}</span>
          <span>Delayed: {delayed}</span>
          <span>Completed: {completed}</span>
        </div>
      </div>
      
      {/* Date Range */}
      <p className="text-xs text-gray-400">{dateRange}</p>
    </div>
  );
}
