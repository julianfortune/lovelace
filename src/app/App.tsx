import { eachDayOfInterval, endOfWeek, format, isWeekend, startOfWeek } from 'date-fns';
import { Ref, useRef } from "react";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { SchedulerParameters, findSchedule } from './core/scheduler';


function App() {
  const inputElement: Ref<HTMLInputElement> = useRef(null)

  // TODO: Use some sort of form framework ..?

  const onSubmit = () => {
    const file = inputElement.current?.files?.item(0)

    // TODO: Gather inputs from interface/react values
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

    findSchedule(file, inputs, (result) => {
      if (!result.success) {
        alert(result.errorMessage)
      } else {
        // TODO: Plug results into interface/react value
        // ...
      }
    })
  }

  const startOfSchedule = new Date("2024-05-01")
  const endOfSchedule = new Date("2024-05-31")
  const startDate = startOfWeek(startOfSchedule);
  const endDate = endOfWeek(endOfSchedule);
  const startWeek = startOfWeek(startDate, { weekStartsOn: 0 }); // Start week on Monday
  const days = eachDayOfInterval({ start: startWeek, end: endDate });

  const renderDays = () => {
    return days.map(day => {
      const isWorkday = !isWeekend(day);
      const isInSchedule = false // isAfter(day, startOfSchedule) && isBefore(day, endOfSchedule)
      if (isWorkday) {
        return (
          <div
            key={day.toISOString()}
            className={
              `p-4 border rounded flex h-32
              ${isInSchedule ? 'bg-neutral-50' : 'bg-neutral-100'}
              ${!isInSchedule ? 'text-neutral-400' : ''}`
            }
          >
            <div>{format(day, 'd')}</div>
          </div>
        );
      }
    });
  };

  return (
    <html className="bg-neutral-100">
      <body className="bg-neutral-100 overflow-hidden flex h-screen">

        <div className="h-full border-r-2 border-neutral-200">
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
              onClick={onSubmit}
              className="px-4 py-2 border rounded hover:bg-neutral-300 border-neutral-300"
            >
              Submit
            </button>
          </aside>
        </div>

        <div className="flex w-full">
          <Tabs
            className="flex flex-col w-full"
            selectedTabClassName="text-neutral-800"
          >
            <TabList className="">
              <div className="h-16 border-b-2 border-neutral-200 flex text-neutral-400 items-center">
                {/* TODO(..?): Tab component ? */}
                <Tab className="p-4 flex-grow-0 font-medium hover:cursor-pointer">Schedule</Tab>
                <Tab className="p-4 flex-grow-0 font-medium hover:cursor-pointer">Problems</Tab>
                <Tab className="p-4 flex-grow-0 font-medium hover:cursor-pointer">Evaluation</Tab>
                {/* Action buttons */}
                <div className="flex-grow flex-col-reverse text-end">
                  <button className="p-4 flex-grow-0 font-medium hover:cursor-pointer ">Export</button>
                </div>
              </div>
            </TabList>

            <div className="w-full overflow-auto bg-neutral-100">
              <main>
                <TabPanel>
                  {/* TODO: Component */}
                  <div className="p-12 grid xl:grid-cols-5 gap-2">
                    {renderDays()}
                  </div>
                </TabPanel>

                <TabPanel>
                  {/* TODO: Component */}
                  <div className="p-12">
                    <p>No problems</p>
                  </div>
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
