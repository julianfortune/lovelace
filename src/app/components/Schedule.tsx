import { eachDayOfInterval, endOfWeek, format, isAfter, isBefore, isWeekend, startOfWeek } from 'date-fns';
import { Schedule as LibSchedule } from '../../lib/types/schedule';

export type ScheduleProps = {
  start: Date
  end: Date
  entries: LibSchedule
}

export function Schedule({ start, end, entries }: ScheduleProps) {

  const firstDate = startOfWeek(start)
  const lastDate = endOfWeek(end)
  const days = eachDayOfInterval({ start: firstDate, end: lastDate });

  const renderDays = () => {
    return days.map(day => {
      const isInSchedule = isAfter(day, start) && isBefore(day, end)

      return (
        <div
          key={day.toISOString()}
          className={
            `p-4 border rounded flex h-32
              ${isInSchedule ? 'bg-neutral-50' : 'bg-neutral-100'}
              ${!isInSchedule ? 'text-neutral-400' : ''}`
          }
        >
          <div>{format(day, 'd')} </div>
        </div>
      );
    });
  };

  return (
    <div className="p-12 grid xl:grid-cols-7 gap-2" >
      {renderDays()}
    </div>
  )
}
