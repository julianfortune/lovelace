# Scheduler

## TODO

- [] Figure out how to organize `src/`
- [] Add testing scaffold
- [] Create library

## Libraries

### Functional Programming

[fp-ts](https://gcanti.github.io/fp-ts/)
[futil](https://smartprocure.github.io/futil-js/)
[lodash](https://lodash.com/docs/latest)

## Notes

- [Nurse scheduling problem](https://en.wikipedia.org/wiki/Nurse_scheduling_problem)

- This is a non-trivial problem to solve
- We have an enormous solution space
- We have 'binding' (also 'hard') constraints that *must* be met
- We have 'preferences' (also 'soft constraints') that we want to optimize
  - Idea: When hard constraints are not met evaluation is negative; when hard constraints are met, fitness is positive
- The problem is more complex than Knapsack, but is somewhat related


### Functional programming in TS

https://gcanti.github.io/fp-ts/learning-resources/
https://paulgray.net/typeclasses-in-typescript/


### Approaches

- Genetic algorithms may be a good first place to start
  - https://timjohns.ca/implementing-a-genetic-algorithm-in-typescript.html

- Other 'Local' search
    - Simulated annealing
    - [Tabu search](https://en.wikipedia.org/wiki/Tabu_search)
    - (Late acceptance) hill climbing

- It may not be worth trying a naive brute-force approach

### Prior Art

[OptaPlanner](https://docs.optaplanner.org/8.33.0.Final/optaplanner-docs/html_single/index.html)
