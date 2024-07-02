import { Evaluation } from '../core/scheduler';

export type EvaluationProps = {
  evaluation: Evaluation
}

export function EvaluationDashboard({ evaluation: { totalCost, constraintViolations } }: EvaluationProps) {

  return (
    <div className='p-12 space-y-2 flex-col max-w-4xl m-auto'>
      <div className='flex space-x-2 text-xl'>
        <div className='flex-1 border rounded shadow-sm bg-neutral-50 text-center font-bold p-8'>
          Total Cost: {totalCost}
        </div>
        <div className='flex-1 border rounded shadow-sm bg-neutral-50 text-center font-bold p-8'>
          Total Constraints Broken: {constraintViolations.length}
        </div>
      </div>

      <h2 className='text-xl pt-4 text-neutral-600'>Broken Constraints</h2>

      {constraintViolations.sort((a, b) => b.penalty - a.penalty).map((entry, index) => (
        <div key={index} className={`flex-1 border rounded shadow-sm bg-neutral-50 p-4 flex space-x-4 items-baseline place-content-between`}>
          <div>{entry.hard && ('‼️    ')}{entry.message}</div>
          <div className='text-xl'>{entry.penalty}</div>
        </div>
      ))}
    </div>
  )
}
