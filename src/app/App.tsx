import { Ref, useRef, useState } from "react"
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { ScheduleData, generateSchedule } from './core/scheduler'
import { ScheduleGrid } from './components/schedule/ScheduleGrid'
import { EvaluationDashboard } from "./components/EvaluationDashboard"
import { WorkersTable } from "./components/WorkersTable"
import { concatenateSet } from "../lib/util"
import { downloadICS } from "../lib/ics"
import { downloadDocx } from "../lib/docx"

function App() {
  const inputElement: Ref<HTMLInputElement> = useRef(null)

  const [scheduleData, setScheduleData] = useState<ScheduleData | undefined>(undefined)

  const [backupWorkerCost, setBackupWorkerCost] = useState(10)
  const [overlappingShiftsCost, setOverlappingShiftsCost] = useState(200)
  const [insufficientRestCost, setInsufficientRestCost] = useState(100)
  const [weeklyWorkloadEnabled, setWeeklyWorkloadEnabled] = useState(false)
  const [evenShiftDistributionEnabled, setEvenShiftDistributionEnabled] = useState(true)
  const [maxSteps, setMaxSteps] = useState(4000)

  const onClickGenerate = () => {
    const file = inputElement.current?.files?.item(0)

    let parameters = {
      constraintParameters: {
        backupWorkerCost,
        overlappingShiftsCost,
        insufficientRestCost,
        weeklyWorkloadEnabled,
        evenShiftDistributionEnabled
      },
      optimizationParameters: {
        maxSteps
      }
    }

    generateSchedule(file, parameters, (result) => {
      if (!result.success) {
        alert(result.errorMessage)
      } else {
        setScheduleData(result.data)
      }
    })
  }

  const onClickExportDocx = () => {
    if (scheduleData === undefined) {
      alert("No schedule available")
      return
    }

    const calendarEvents = scheduleData?.schedule.entries.map((e) => {
      const title = `${e.shift}: ${concatenateSet(e.workers)}`
      return { title, dateString: e.date, date: new Date(e.date) }
    })

    downloadDocx(
      calendarEvents,
      scheduleData.schedule.start,
      scheduleData.schedule.end,
      `${scheduleData.title}.docx`
    )
  }

  const onClickExportIcs = () => {
    if (scheduleData === undefined) {
      alert("No schedule available")
      return
    }

    const calendarEvents = scheduleData?.schedule.entries.map((e) => {
      const title = `${e.shift}: ${concatenateSet(e.workers)}`
      return { title, dateString: e.date, date: new Date(e.date) }
    })

    downloadICS(calendarEvents, `${scheduleData.title}.ics`)
  }

  return (
    <div className="bg-neutral-100 overflow-hidden flex h-screen">
      <div className="h-full border-r-2 border-neutral-200 bg-neutral-50">
        <header className="h-16 w-full flex items-center px-4 border-b-2">
          <h1 className="font-bold text-2xl ">Lovelace Scheduler</h1>
        </header>

        <aside className="p-4 space-y-4">
          <h2 className="text-lg font-bold">Input file</h2>
          <div className="">
            <input
              type="file"
              name="file"
              ref={inputElement}
              accept=".yaml"
              className="w-64 block border border-neutral-300 rounded-md shadow-smoverflow-clip file:border-none file:px-2 file:py-1 file:cursor-pointer file:font-medium"
            />
            <p className="text-sm">File must be in YAML format, demonstrated in this <a href="/example.yaml" className="underline text-blue-400">example</a>.</p>
          </div>

          <h2 className="text-lg font-bold">Constraint Parameters</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Backup Worker Cost</label>
              <input
                type="number"
                value={backupWorkerCost}
                onChange={(e) => setBackupWorkerCost(parseInt(e.target.value))}
                className="w-full border border-neutral-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Overlapping Shifts Cost</label>
              <input
                type="number"
                value={overlappingShiftsCost}
                onChange={(e) => setOverlappingShiftsCost(parseInt(e.target.value))}
                className="w-full border border-neutral-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Insufficient Rest Cost</label>
              <input
                type="number"
                value={insufficientRestCost}
                onChange={(e) => setInsufficientRestCost(parseInt(e.target.value))}
                className="w-full border border-neutral-300 rounded-md px-2 py-1"
              />
            </div>
            {/* Feature not yet implemented */}
            {/* <div>
                <label className="block text-sm font-medium">Weekly Workload</label>
                <input
                  type="checkbox"
                  checked={weeklyWorkloadEnabled}
                  onChange={(e) => setWeeklyWorkloadEnabled(e.target.checked)}
                  className="w-full"
                />
              </div> */}
            <div>
              <label className="block text-sm font-medium">Even Shift Distribution</label>
              <input
                type="checkbox"
                checked={evenShiftDistributionEnabled}
                onChange={(e) => setEvenShiftDistributionEnabled(e.target.checked)}
                className="w-full"
              />
            </div>
          </div>

          <h2 className="text-lg font-bold">Optimization Parameters</h2>
          <div>
            <label className="block text-sm font-medium">Max Steps</label>
            <input
              type="number"
              value={maxSteps}
              onChange={(e) => setMaxSteps(parseInt(e.target.value))}
              className="w-full border border-neutral-300 rounded-md px-2 py-1"
            />
          </div>

          <button
            onClick={onClickGenerate}
            className="px-4 py-2 border rounded hover:bg-neutral-300 border-neutral-300"
          >
            Generate
          </button>
        </aside>
      </div>

      <div className="flex w-full">
        <Tabs
          className="flex flex-col w-full"
          selectedTabClassName="text-neutral-800 border-blue-300 border-b-4 !pb-0"
        >
          <TabList className="">
            <div className="bg-neutral-50 h-16 px-4 border-b-2 border-neutral-200 flex text-neutral-400 items-center">
              <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center">Schedule</Tab>
              <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center ">Workers</Tab>
              <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center ">Evaluation</Tab>

              <div className="flex-grow "></div>
              {/* Action buttons */}
              <div className="pl-4 text-end text-neutral-600 border-neutral-200 border-l-2 space-x-4 flex items-baseline">
                <p>Export</p>
                <button
                  className="px-4 py-1 border rounded-full font-medium hover:cursor-pointer"
                  onClick={onClickExportDocx}
                >docx</button>
                <button
                  className="px-4 py-1 border rounded-full font-medium hover:cursor-pointer"
                  onClick={onClickExportIcs}
                >ICS</button>
              </div>
            </div>
          </TabList>

          <div className="w-full overflow-auto bg-neutral-100">
            <main>
              <TabPanel>
                {scheduleData?.schedule ? (
                  <ScheduleGrid schedule={scheduleData.schedule} />
                ) : (
                  <div className="p-12">No schedule available</div>
                )}
              </TabPanel>

              <TabPanel>
                {scheduleData?.workloadEvaluations ? (
                  <WorkersTable evaluations={scheduleData?.workloadEvaluations} />
                ) : (
                  <div className="p-12">
                    <p>No workload data available</p>
                  </div>
                )}
              </TabPanel>

              <TabPanel>
                {scheduleData?.evaluation ? (
                  <EvaluationDashboard evaluation={scheduleData?.evaluation} />
                ) : (
                  <div className="p-12">
                    <p>No problems</p>
                  </div>
                )}
              </TabPanel>
            </main>
          </div>
        </Tabs>
      </div >
    </div >
  )
}

export default App
