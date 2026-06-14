# PJM Sync Model

The `pjm-sync` module owns local storage of PJM product categories, price groups, price engines, options and option choices.

Sprint 1 does not connect to the PJM API. It only defines module boundaries and Prisma models so later sprints can add mocked or seeded synchronization first, then a real connector once the structure is stable.
