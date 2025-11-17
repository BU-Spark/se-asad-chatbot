
# CI Assignment README

## CI Tool Used

Our project uses **ESLint** for code linting, **Jest** for unit testing, and **npm** for build automation. These tools are integrated into a GitHub Actions workflow so they run automatically during development.

## Tasks Implemented

* ESLint runs to check formatting and code quality.
* Jest is included for unit testing.
* npm handles build automation.

## How to Trigger the Pipeline

The CI pipeline runs automatically in two cases:

1. **When committing or pushing** to the repository.
2. **When creating a pull request.**

## Challenges Faced

We still have unit tests for some of the functionality in our current app. Additionally, we encountered an issue where the linter failed on GitHub even though it passed locally, which required configuration adjustments.

---
