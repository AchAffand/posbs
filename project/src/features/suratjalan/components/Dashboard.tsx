import React from 'react';
import { DeliveryStats } from '../types';
import { formatWeight } from '../utils/format';
import { Truck, Package, CheckCircle, Clock, Scale, TrendingUp } from 'lucide-react';

interface DashboardProps {
  stats: DeliveryStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Pengiriman',
      value: stats.total,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      change: '+12%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Menunggu',
      value: stats.menunggu,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500',
      change: '-5%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Dalam Perjalanan',
      value: stats.dalamPerjalanan,
      icon: Truck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      change: '+8%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Selesai',
      value: stats.selesai,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      change: '+15%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Berat Bersih',
      value: stats.totalWeight > 0 ? formatWeight(stats.totalWeight) : '0 kg',
      icon: Scale,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      span: 'sm:col-span-2 lg:col-span-1',
      change: '+22%',
      changeColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.span || ''} ${stat.bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className={`${stat.iconBg} p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg`}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className={`text-xs sm:text-sm font-medium ${stat.changeColor}`}>
                {stat.change}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {stat.title}
            </p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};