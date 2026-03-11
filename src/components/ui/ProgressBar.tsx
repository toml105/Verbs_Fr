interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  progress,
  color = 'bg-coral-500',
  height = 'h-2',
  label,
  showPercent = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-warm-600 dark:text-warm-400">{label}</span>}
          {showPercent && (
            <span className="text-sm font-medium text-warm-700 dark:text-warm-300">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-warm-200 dark:bg-warm-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
