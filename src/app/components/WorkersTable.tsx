import { format } from "date-fns";
import { WorkloadEvaluation } from "../../lib/types/common"

export type WorkersProps = {
  evaluations: WorkloadEvaluation[]
}

export function WorkersTable({ evaluations }: WorkersProps) {
  // Extract unique workers and months
  const workers = Array.from(new Set(evaluations.map(e => e.worker))).sort();
  const months = Array.from(new Set(evaluations.map(e => e.month)));

  // Create a mapping of workers to their workload evaluations by month
  const workerMonthMap: { [key: string]: { [key: string]: number } } = {};
  evaluations.forEach(evaluation => {
    if (!workerMonthMap[evaluation.worker]) {
      workerMonthMap[evaluation.worker] = {};
    }
    workerMonthMap[evaluation.worker][evaluation.month] = evaluation.workload;
  });

  return (
    <div className="p-12 m-auto max-w-full overflow-x-auto">
      <div className="inline-block min-w-full overflow-hidden rounded-lg border border-neutral-200 shadow">
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-neutral-100 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Worker</th>
              {months.map((month, index) => (
                <th key={month} className={`px-4 py-3 text-center font-semibold text-neutral-700`}>
                  {format(new Date(`${month}-01`), "MMMM")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.map((worker, workerIdx) => (
              <tr
                key={worker}
                className="border-b border-neutral-200 odd:bg-white even:bg-neutral-50 last:border-b-0"
              >
                <td className="px-4 py-2 text-neutral-800">{worker}</td>
                {months.map(month => (
                  <td key={month} className="px-4 py-2 text-center text-neutral-800">
                    {workerMonthMap[worker][month] !== undefined
                      ? workerMonthMap[worker][month]
                      : 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
