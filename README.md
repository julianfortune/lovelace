# Scheduler

## TODO

- [ ] Create `OptimizationParameters` to allow configuring the various constraint penalties
- [ ] Create a 'submit' driver function that takes input from frontend and returns all data needed for rendering once optimization complete
- [ ] Add feature to output 'Workload metrics' for each worker and each month
- [ ] Finish front-end MVP
- [ ] Add ability to export in CSV and .ICS (https://github.com/nwcell/ics.js)

*Later*
- [ ] Implement evaluation rule to try to encourage spreading out shifts as evenly as possible
  - Note: Needs to take into account gaps between beginning of schedule period and first assignment, and last assignment and end of schedule period
  - E.g., Variance of rest days?, workload per week?, ... ?

*Distant*
- [ ] Add support for taking workers away from shift ? (pay some cost)
- [ ] Implement genetic programming optimization


## Notes

- [Nurse scheduling problem](https://en.wikipedia.org/wiki/Nurse_scheduling_problem)

- This is a non-trivial problem to solve
- We have an enormous solution space
- We have 'binding' (also 'hard') constraints that *must* be met
- We have 'preferences' (also 'soft constraints') that we want to optimize
  - Idea: When hard constraints are not met evaluation is negative; when hard constraints are met, fitness is positive
- The problem is more complex than Knapsack, but is somewhat related


### Approaches

- Genetic algorithms may be a good first place to start
  - https://timjohns.ca/implementing-a-genetic-algorithm-in-typescript.html

- Other 'Local' search
    - Simulated annealing
    - [Tabu search](https://en.wikipedia.org/wiki/Tabu_search)
    - (Late acceptance) hill climbing

- It may not be worth trying a naive brute-force approach
