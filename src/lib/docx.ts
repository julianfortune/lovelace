import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, WidthType } from "docx"
import { eachDayOfInterval, getDay, format, endOfWeek, startOfWeek, isWeekend, isSameDay, formatDate } from "date-fns"


export function downloadDocx(events: CalendarEvent[], start: Date, end: Date, fileName: string): void {
    // Helper function to create a table cell
    const createCell = (text: string) => {
        return new TableCell({
            children: [new Paragraph({ children: [new TextRun(text)] })],
        })
    }

    // Generate the calendar for the given month
    const firstDate = startOfWeek(start)
    const lastDate = endOfWeek(end)

    const days = eachDayOfInterval({ start: firstDate, end: lastDate })

    // Weekday headers
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const headerRow = new TableRow({
        children: weekdays.map(day => createCell(day)),
        tableHeader: true,
    })

    // Generate the calendar rows
    const rows: TableRow[] = [headerRow]
    let currentRow: TableCell[] = []

    days.forEach((date) => {
        if (!isWeekend(date)) {
            // Filter the entries for the current day
            const formattedDay = format(date, 'yyyy-MM-dd');
            const eventsOnThisDay = events.filter(e => formattedDay === e.dateString)
            const cellText = `${formatDate(date, "MMMM dd")}\n${eventsOnThisDay.map(event => event.title).join("\n")}`

            currentRow.push(createCell(cellText))
        }

        if (getDay(date) === 6 || date.getDate() === days.length) {
            rows.push(new TableRow({ children: currentRow }))
            currentRow = []
        }
    })

    // Create a new Document
    const doc = new Document({
        sections: [{
            children: [
                new Table({
                    columnWidths: [2000, 2000, 2000, 2000, 2000],
                    rows: rows,
                    // width: {
                    //     size: 4000,
                    //     type: WidthType.DXA,
                    // }
                }),
            ],
        }]
    })

    // Generate the DOCX file and trigger download
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    })
}
