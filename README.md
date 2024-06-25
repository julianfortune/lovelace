# Scheduler

## TODO

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


### Approaches

- Genetic algorithms may be a good first place to start
  - https://timjohns.ca/implementing-a-genetic-algorithm-in-typescript.html

- Other 'Local' search
    - Simulated annealing
    - [Tabu search](https://en.wikipedia.org/wiki/Tabu_search)
    - (Late acceptance) hill climbing
