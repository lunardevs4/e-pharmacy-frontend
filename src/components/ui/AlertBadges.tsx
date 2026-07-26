import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
  lowStockThreshold?: number;
}

export const StockStatusBadge: React.FC<StockBadgeProps> = ({ 
  stock, 
  lowStockThreshold = 10 
}) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-100">
        <XCircle className="w-3 h-3" />
        Out of Stock
      </span>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        <AlertTriangle className="w-3 h-3" />
        Low Stock ({stock} left)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <CheckCircle2 className="w-3 h-3" />
      In Stock ({stock})
    </span>
  );
};

interface ExpiryBadgeProps {
  expiryDate: string; // ISO format or YYYY-MM-DD
}

export const ExpiryAlertBadge: React.FC<ExpiryBadgeProps> = ({ expiryDate }) => {
  const today = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (diffDays <= 60) { // Expires within 2 months
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3" />
        Expires soon ({diffDays}d)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
      Valid ({expiryDate})
    </span>
  );
};