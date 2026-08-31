import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  isPositive = true,
  icon,
  iconBgColor = 'bg-emerald-50 text-emerald-600',
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-[11px] font-semibold mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className={`p-2.5 rounded-xl ${iconBgColor}`}>
          {icon}
        </div>
      )}
    </div>
  );
};