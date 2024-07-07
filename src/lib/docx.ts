import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, WidthType, AlignmentType, PageOrientation } from "docx"
import { eachDayOfInterval, getDay, format, endOfWeek, startOfWeek, isWeekend, isSameDay, formatDate } from "date-fns"


export function downloadDocx(events: CalendarEvent[], start: Date, end: Date, fileName: string): void {
    // Helper function to create a table cell
    const createHeaderCell = (text: string) => {
        return new TableCell({
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun(text + "\n")]
                })
            ],
        })
    }

    const createCalendarCell = (date: Date, lines: string[]) => {
        const dateString = formatDate(date, "MMMM dd")
        const dateParagraph = new Paragraph({
            alignment: AlignmentType.RIGHT, // Right justify
            children: [new TextRun({ text: dateString + "\n", bold: true })]
        })

        return new TableCell({
            children: [dateParagraph].concat(lines.map((line) => {
                return new Paragraph({ children: [new TextRun(line + "\n")] })
            })),
        })
    }

    // Generate the calendar for the given month
    const firstDate = startOfWeek(start)
    const lastDate = endOfWeek(end)

    const days = eachDayOfInterval({ start: firstDate, end: lastDate })

    // Weekday headers
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const headerRow = new TableRow({
        children: weekdays.map(day => createHeaderCell(day)),
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
            const cellText = eventsOnThisDay.map(event => event.title)

            currentRow.push(createCalendarCell(date, cellText))
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
                    columnWidths: [4000, 4000, 4000, 4000, 4000],
                    rows: rows,
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
