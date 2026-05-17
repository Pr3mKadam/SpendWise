import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function getServiceColor(name: string): string {
  const SERVICE_COLORS: Record<string, string> = {
    netflix: '#e50914', spotify: '#1db954', notion: '#000000',
    amazon:  '#ff9900', apple:   '#555555', youtube: '#ff0000',
    gym:     '#6366f1', jio:     '#0052cc', airtel:  '#e40000',
    phone:   '#64748b', adobe:   '#ff0000', canva:   '#00c4cc',
  };
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#6366f1';
}

function getServiceInitials(name: string): string {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function SubscriptionCalendar({ subscriptions, currency }: {
  subscriptions: Array<{ merchant: string; frequency: string; nextExpected: string; avgAmount: number }>;
  currency: string;
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today       = new Date();
  const isCurrentMonth = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth();

  const getDaySubs = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    return subscriptions.filter(s => {
      if (!s.nextExpected) return false;
      const [,, sd] = s.nextExpected.split('-');
      if (s.frequency === 'monthly') return Number(sd) === day;
      return s.nextExpected === dateStr;
    });
  };

  return (
    <div className="card p-5 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] flex items-center gap-2">
          <Calendar size={18} style={{ color: 'var(--teal)' }} />
          Bills Calendar
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-sm w-32 text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[length:var(--fs-overline)] sm:text-xs font-semibold text-gray-400 py-1 uppercase">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 sm:h-20 bg-transparent rounded-lg" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1;
          const subs = getDaySubs(day);
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={`day-${day}`}
              className={`h-14 sm:h-20 rounded-lg p-1 sm:p-2 flex flex-col items-center border transition-all ${
                isToday
                  ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800'
                  : 'bg-white border-gray-100 dark:bg-[#1a2235] dark:border-[#2d3748] hover:border-teal-100'
              }`}
            >
              <span className={`text-[length:var(--fs-caption)] sm:text-xs font-semibold ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'}`}>
                {day}
              </span>
              <div className="flex-1 w-full flex flex-col items-center justify-center gap-0.5 mt-1 overflow-hidden">
                {subs.slice(0, 2).map((s, idx) => (
                  <div
                    key={idx}
                    className="w-full text-[length:var(--fs-overline)] sm:text-[length:var(--fs-overline)] truncate text-center font-medium rounded px-1"
                    style={{ backgroundColor: getServiceColor(s.merchant) + '20', color: getServiceColor(s.merchant) }}
                    title={`${s.merchant}: ${currency}${s.avgAmount}`}
                  >
                    {getServiceInitials(s.merchant)}
                  </div>
                ))}
                {subs.length > 2 && (
                  <div className="w-full text-[length:var(--fs-overline)] text-center font-bold text-gray-400">+{subs.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
