# Scheduler

## TODO

- [ ] Finish example YAML file and ensure viewable on deployed site.
- [ ] Finish DOCX export
- [ ] Send Ada invoice

*Stretch*
- [ ] Add documentation
- [ ] Fix UI freezing and add some sort of visual loading indicator
- [ ] Add support for taking workers away from shift ? (pay some cost)
- [ ] Implement genetic programming optimization
- [ ] Implement workload per week variance evaluation rule (try to encourage spreading out shifts as evenly as possible)


### Approaches

- Genetic algorithms may be a good first place to start
  - https://timjohns.ca/implementing-a-genetic-algorithm-in-typescript.html

- Other 'Local' search
    - Simulated annealing
    - [Tabu search](https://en.wikipedia.org/wiki/Tabu_search)
    - (Late acceptance) hill climbing
