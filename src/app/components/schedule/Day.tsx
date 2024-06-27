import { format, formatDate, getMonth, isSameDay, isToday, isWeekend } from 'date-fns';
import { ScheduleEntry } from '../../../lib/types/schedule';

export type DayProps = {
    date: Date
    entries?: ScheduleEntry[]
    isDisabled?: boolean
    isHoliday?: boolean
}

export function Day({
    date,
    entries = [],
    isDisabled = false,
    isHoliday = false
}: DayProps) {
    const dateIsToday = isToday(date)

    return (
        <div
            key={date.toISOString()}
            className={
                `flex flex-col p-3 min-h-32
                 border rounded shadow-sm
                 ${dateIsToday ? 'border-red-400' : ''}
                 ${isHoliday ? '!bg-blue-100 !text-blue-600' : ''}
                 ${isDisabled ? 'text-neutral-400 !bg-neutral-100' : ''}
                 ${isWeekend(date) ? 'bg-neutral-200' : 'bg-neutral-50'}`
            }
        >
            <div className="flex flex-row space-x-1 items-baseline pb-2">
                <div className={`
                    flex-grow text-end
                    ${isHoliday ? 'text-blue-400' : 'text-neutral-400'}`}>
                    {formatDate(date, "MMMM")}
                </div>
                <div className={`px-2 text-lg rounded-full ${dateIsToday ? 'bg-red-400' : ''}`}>
                    {format(date, 'd')}
                </div>
            </div>

            {entries.length > 0 && !isDisabled && (
                <div className="flex-row space-y-1">
                    {entries.map((entry, index) => (
                        <div key={index} className="flex space-x-2">
                            <div className="font-bold">{entry.shift}</div>
                            <div>
                                {Array.from(entry.workers).map(worker => (
                                    <div key={worker}>{worker}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
