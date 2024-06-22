# Scheduler

## TODO

- [ ] Experiment with simulated annealing (try single month, measure runtime, etc.)
- [ ] Refactor evaluation to separate gathering problems from reducing to single score
- [ ] Implement the remaining evaluation rules (target workload, cooldown between shifts, etc.)
- [ ] Add output rendering (csv? gcal csv?)
- [ ] Finish front-end MVP

*Later*
- [ ] Try to add support for scheduling no one ?
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
