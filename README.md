# Scheduler

## TODO

- [ ] Implement evaluation rule to prefer primary over backup workers (Look for: `TODO(backup)`)
- [ ] Implement evaluation rule to try to encourage spreading out shifts as evenly as possible
  - E.g., Variance of rest days?, workload per week?, ... ?

- [ ] Add feature to output 'Workload metrics' for each worker by month
- [ ] Add proper output rendering (csv and gcal csv)
- [ ] Finish front-end MVP

*Later*
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
