import { IconCheck, IconClock, IconX, IconAlertCircle, IconPlayerPause } from '@tabler/icons-react';

const StatusBadge = ({ 
  status, 
  type = 'invoice',
  size = 'sm',
  icon = false,
  dot = false,
  uppercase = true
}) => {
  const statusConfig = {
    invoice: {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', icon: IconClock },
      SENT: { bg: 'bg-blue-100', text: 'text-blue-800', icon: IconCheck },
      PARTIAL: { bg: 'bg-orange-100', text: 'text-orange-800', icon: IconAlertCircle },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', icon: IconCheck },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-800', icon: IconAlertCircle },
      CANCELLED: { bg: 'bg-gray-200', text: 'text-gray-500', icon: IconX, strikethrough: true }
    },
    payment: {
      SUCCESS: { bg: 'bg-green-100', text: 'text-green-800', icon: IconCheck },
      VOIDED: { bg: 'bg-red-100', text: 'text-red-800', icon: IconX, strikethrough: true }
    },
    schedule: {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: IconCheck },
      PAUSED: { bg: 'bg-orange-100', text: 'text-orange-800', icon: IconPlayerPause },
      TERMINATED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: IconX }
    },
    reminder: {
      SCHEDULED: { bg: 'bg-gray-100', text: 'text-gray-600', icon: IconClock },
      SENT: { bg: 'bg-green-100', text: 'text-green-800', icon: IconCheck },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: IconX }
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  const config = statusConfig[type]?.[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]} ${config.strikethrough ? 'line-through' : ''}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
      {icon && Icon && <Icon size={iconSizes[size]} />}
      <span className={uppercase ? 'uppercase' : ''}>{status}</span>
    </span>
  );
};

export default StatusBadge;