interface StatusDotProps {
  status: 'online' | 'offline' | 'error';
  label?: string;
}

const colors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  error: 'bg-red-500',
};

export function StatusDot({ status, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]} ${
          status === 'online' ? 'animate-pulse' : ''
        }`}
      />
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </span>
  );
}
