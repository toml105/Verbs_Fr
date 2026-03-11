import type { DailyActivity } from '../../types';

interface HeatMapProps {
  activityHistory: DailyActivity[];
  weeks?: number;
}

function getIntensity(reviews: number): string {
  if (reviews === 0) return 'bg-warm-100 dark:bg-warm-700';
  if (reviews < 5) return 'bg-emerald-200 dark:bg-emerald-800';
  if (reviews < 15) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-emerald-600 dark:bg-emerald-400';
}

export default function HeatMap({ activityHistory, weeks = 13 }: HeatMapProps) {
  // Build a map of date -> activity
  const activityMap = new Map<string, DailyActivity>();
  for (const a of activityHistory) {
    activityMap.set(a.date, a);
  }

  // Generate grid of dates (last N weeks)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const totalDays = weeks * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + (6 - dayOfWeek));

  const grid: { date: string; reviews: number; accuracy: number }[][] = [];
  let currentWeek: { date: string; reviews: number; accuracy: number }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const activity = activityMap.get(dateStr);

    currentWeek.push({
      date: dateStr,
      reviews: activity?.reviews ?? 0,
      accuracy: activity && activity.reviews > 0
        ? Math.round((activity.correct / activity.reviews) * 100)
        : 0,
    });

    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) grid.push(currentWeek);

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className="flex gap-0.5">
      {/* Day labels */}
      <div className="flex flex-col gap-0.5 mr-1">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className="w-3 h-3 flex items-center justify-center text-[8px] text-warm-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      {grid.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((day) => (
            <div
              key={day.date}
              className={`w-3 h-3 rounded-[2px] ${getIntensity(day.reviews)} transition-colors`}
              title={`${day.date}: ${day.reviews} reviews${day.reviews > 0 ? `, ${day.accuracy}% accuracy` : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
