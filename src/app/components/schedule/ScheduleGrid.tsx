import { eachDayOfInterval, endOfWeek, format, isAfter, isBefore, isSameDay, startOfWeek } from 'date-fns';
import { Day } from './Day';
import { Schedule } from '../../core/scheduler';

export type ScheduleProps = {
  schedule: Schedule
}

export function ScheduleGrid({ schedule: { start, end, holidays, entries } }: ScheduleProps) {

  const firstDate = startOfWeek(start)
  const lastDate = endOfWeek(end)
  const days = eachDayOfInterval({ start: firstDate, end: lastDate });
  
  const renderDays = () => {
    return days.map(day => {
      const isInSchedule = isSameDay(day, start) || (isAfter(day, start) && isBefore(day, end)) || isSameDay(day, end)
      const isHoliday = holidays.map((holiday) => isSameDay(day, holiday)).includes(true)
      const formattedDay = format(day, 'yyyy-MM-dd');

      // Filter the entries for the current day
      const dayEntries = entries.filter(e => e.date === formattedDay);

      return (
        <Day
          date={day}
          isDisabled={!isInSchedule}
          entries={dayEntries}
          isHoliday={isHoliday}
        />
      )
    });
  };

  return (
    <div className="p-12 grid xl:grid-cols-5 gap-2" >
      {renderDays()}
    </div>
  )
}
