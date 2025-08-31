import React from 'react';
import { CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'em_dia' | 'atrasado' | 'inadimplente' | 'atencao';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'em_dia':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-800',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          text: 'Em dia'
        };
      case 'atencao':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          icon: Clock,
          text: 'Atenção'
        };
      case 'atrasado':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-800',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          text: 'Atrasado'
        };
      case 'inadimplente':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-800',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          icon: AlertCircle,
          text: 'Inadimplente'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-800',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          icon: Clock,
          text: 'Desconhecido'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      dot: 'w-3 h-3',
      badge: 'px-2.5 py-1 text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      dot: 'w-4 h-4',
      badge: 'px-3 py-1.5 text-base',
      icon: 'w-5 h-5'
    }
  };

  if (!showText) {
    // Apenas bolinha colorida
    return (
      <div 
        className={`${sizeClasses[size].dot} ${config.color} rounded-full`}
        title={config.text}
      />
    );
  }

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium border
      ${sizeClasses[size].badge}
      ${config.textColor}
      ${config.bgColor}
      ${config.borderColor}
    `}>
      {showIcon && (
        <Icon className={`${sizeClasses[size].icon} mr-1`} />
      )}
      {config.text}
    </span>
  );
}