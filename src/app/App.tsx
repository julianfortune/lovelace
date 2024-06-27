import { Ref, useRef, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { ScheduleData, SchedulerResult, generateSchedule } from './core/scheduler';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { EvaluationDashboard } from "./components/EvaluationDashboard";


function App() {
  const inputElement: Ref<HTMLInputElement> = useRef(null)

  const [scheduleData, setScheduleData] = useState<ScheduleData | undefined>(undefined);

  const onClickGenerate = () => {
    const file = inputElement.current?.files?.item(0)

    // TODO: Connect to interface
    let inputs = {
      constraintParameters: {
        backupWorkerCost: 5,
        overlappingShiftsCost: 100,
        insufficientRestCost: 50,
      },
      optimizationParameters: {
        maxSteps: 4000
      }
    }

    generateSchedule(file, inputs, (result) => {
      if (!result.success) {
        alert(result.errorMessage)
      } else {
        setScheduleData(result.data)
      }
    })
  }

  return (
    <html className="bg-neutral-100">
      <body className="overflow-hidden flex h-screen">

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
                className="w-64
                  block border border-neutral-300 rounded-md shadow-smoverflow-clip
                  file:border-none file:px-2 file:py-1 file:cursor-pointer file:font-medium
                "
              />
              <p className="text-sm">File must be in YAML format</p>
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
                {/* TODO(..?): Tab component ? */}
                <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center">Schedule</Tab>
                <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center ">Evaluation</Tab>
                <Tab className="flex-grow-0 h-full px-4 pb-1 font-medium hover:cursor-pointer flex items-center ">Workers</Tab>

                <div className="flex-grow "></div>
                {/* Action buttons */}
                <div className="pl-4 text-end text-neutral-600 border-neutral-200 border-l-2 space-x-4 flex items-baseline">
                  <p>Export</p>
                  <button className="px-4 py-1 border rounded-full font-medium hover:cursor-pointer ">ICS</button>
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
                  {scheduleData?.evaluation ? (
                    <EvaluationDashboard evaluation={scheduleData?.evaluation} />
                  ) : (
                    <div className="p-12">
                      <p>No problems</p>
                    </div>
                  )}
                </TabPanel>

                <TabPanel>
                  {/* TODO: Component */}
                  <div className="p-12">
                    <p>Nothing to evaluate</p>
                  </div>
                </TabPanel>
              </main>
            </div>
          </Tabs>
        </div >
      </body >
    </html>
  )
}

export default App
