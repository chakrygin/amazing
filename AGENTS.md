# amazing

A GitHub Action that scrapes .NET / DevOps / Frontend blogs and posts digests to Telegram channels. Its state lives in committed `data/` files that the workflow commits back.

## Commands

- `npm run build` — rollup into the minified ESM bundle `dist/index.js`, the Action's entrypoint. Committed to git.
- `npm test` — jest. Live tests with real side effects, see below.
- `npm run clean` — Windows cmd syntax (`if exist dist rd /s /q dist`); it does not work in bash. The repo is developed on Windows.
- There are no `lint` / `typecheck` scripts: use `npx tsc --noEmit` and `npx eslint .`.
- `npx eslint .` is not green today: one pre-existing error in `core/scrapers/helpers/NuxtDataHelper.ts` (`no-unnecessary-type-parameters`). Do not attribute it to your change.

Verification order: `npx tsc --noEmit` → `npx eslint .` → `npm run build`.

## `dist/index.js` is a committed build artifact

- The workflow runs the Action from `dist/index.js`, and triggers on any push that touches `dist/index.js` or `data/errors.json`.
- Such a push immediately runs a real scrape in CI. On `main` it posts to the public channels and commits `data`; on any other branch it posts to the private chat. Treat a `dist` commit as a deploy.
- `.githooks/pre-commit` rebuilds and stages it, but `core.hooksPath=.githooks` is set in the **global** git config, not in the repo, so a fresh clone has no hook. After touching `core/`, `src/`, or `action.yml`, run `npm run build` and stage `dist/index.js` yourself — otherwise the Action keeps running stale code and the workflow never triggers.

## Tests scrape the live web and send real Telegram messages

Every test is a live integration test, not a unit test: `tests/utils/testScraper.ts` builds a real Telegram client from `AMAZING_TOKEN` and scrapes the real site.

- `debug.env` (gitignored) is loaded by `tests/setup.ts`. Without it the tests throw `Value is missing in environment variables: AMAZING_TOKEN`.
- A test only sends the posts that are absent from `data/<category>/`. A **new** scraper has no storage yet, so its first test run posts every found article to the private chat. Get the user's OK before running tests for a new or rewritten scraper.
- Storage is the real committed `data/<category>/` tree under `process.cwd()`, and `TEST_CATEGORY` is derived from the test file's directory name (`tests/environment.ts`). A test therefore has to live in `tests/<category>/`, matching the category key in `src/main.ts`.
- `@actions/core` and `@actions/github` are replaced by mocks through `moduleNameMapper`, so no GitHub env is read.
- One file: `npx jest tests/dotnet/HabrScraper.test.ts` — still live, still sends.

## A local run is a debug run

`createConfig()` sets `debug = github.context.ref !== 'refs/heads/main'`, and `App.run()` routes every post to `AMAZING_PRIVATE_CHAT_ID` while debug is on. Outside CI that is always the case, so a local run never reaches the public channels.

- Run from the repo root: the data path is `process.cwd()/data`.
- Put the `debug.env` variables in the environment and run `src/main.ts` through `tsx`; the VS Code "Launch" configuration does exactly this.
- `manual = github.context.eventName !== 'schedule'`, so locally the error circuit breaker is bypassed.

## Wiring a new scraper

1. Add `src/<category>/<Name>Scraper.ts` extending `ScraperBase` and declaring `name` and `path`. `path` is the subdirectory under `data/<category>/` that receives the scraped hrefs (a host, or `host/subpath`). `name` is the key in `data/errors.json` and `data/updates.json`, so renaming it orphans the stored counter and timestamp.
2. Register the instance in the matching array in `src/main.ts`. The object key is the category: it selects `data/<category>/` and `AMAZING_<CATEGORY>_CHAT_ID` (falling back to `AMAZING_PRIVATE_CHAT_ID`).
3. A new category also needs an input in `action.yml`, a `with:` entry in `.github/workflows/scrape.yml`, and a matching repository variable.
4. Add `tests/<category>/<Name>Scraper.test.ts` (mind the test caveats above).
5. Shared scrapers take an id from an options map: the ids of `HabrScraper` and `DevBlogsScraper` are keys of `Options` in `src/shared/HabrScraperOptions.ts` and `src/shared/DevBlogsScraperOptions.ts`, so a new id needs a new entry there.

`ScraperBase` strategies: the default `BreakIfPostExists` stops at the first href already in storage, `ContinueIfPostExists` (used by Habr) walks the whole feed. `enrich()` is detected by identity comparison against the base implementation, so override it only to patch individual posts.

## `data/` is machine-written state, committed to git

The Action appends scraped hrefs to `data/<category>/<path>/YYYY-MM.txt` and touches `timestamp`; the workflow commits `data` back. Do not hand-edit those files. The one manual edit worth making is dropping a scraper's entry from `data/errors.json`.

`data/errors.json` is the circuit breaker, keyed by scraper `name`: `counter >= 10` disables the scraper permanently, and a second failure less than a day old skips it for a day. Both persist in git, so a scraper can look broken after a bad week — reset the entry to re-enable it. A post rejected by `ValidateSender` throws out of `scrape()` and counts as a failure, so validation errors and network errors land in the same counter.

## Conventions

- 2-space indent in `.ts` files (`.editorconfig`), single quotes, semicolons (eslint `@stylistic`).
- No trailing commas in TypeScript, even though `tsconfig.json` has one.
- `readonly` fields, `#private` fields, constructor parameter properties, `protected override fetch()` and `protected override enrich()`.
- Import groups are separated by a blank line, in this order: `@actions/*`, other packages, `@core/*` and `@src/*`, `./…`, `../…`.
- The path aliases `@core/*` and `@src/*` are declared twice, in `tsconfig.json` `paths` and `jest.config.ts` `moduleNameMapper`. Keep both in sync.
- Write code, comments, and commit messages in English. Commit messages are short and imperative ("Fix logging", "Add KubernetesScraper"); `Scraped: …` commits come from the workflow, not from you.

## Agent skills

### Issue tracker

Issues are tracked on GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
