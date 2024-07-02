

function formatDate(date: Date): string {
    const pad = (num: number): string => num.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function createICS(events: CalendarEvent[]): string {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Your Product//EN
`;

    events.forEach(event => {
        const startDate = formatDate(event.date);

        icsContent += `BEGIN:VEVENT
UID:${new Date().getTime()}
DTSTAMP:${startDate}T000000Z
DTSTART;VALUE=DATE:${startDate}
SUMMARY:${event.title}
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
}

export function downloadICS(events: CalendarEvent[], fileName: string): void {
    const icsContent = createICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
