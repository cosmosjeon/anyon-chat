# Suggested commands
- Install deps (root): `yarn install`
- Format (root via turbo): `yarn format` (write), check with `yarn format:check`
- Lint (root via turbo): `yarn lint`; fix with `yarn lint:fix`
- Build all (root): `yarn build`
- Frontend dev: from `apps/web`, `yarn dev`; production build/start: `yarn build`, `yarn start`; lint/format specific to web: `yarn lint`, `yarn lint:fix`, `yarn format`, `yarn format:check`; eval scripts: `yarn eval`, `yarn eval:highlights`
- Agents dev server: from `apps/agents`, `yarn dev` (LangGraph CLI, port 54367, config ../../langgraph.json); build agents: `yarn build`; clean: `yarn clean`
- Package-specific formatting/linting mirror root scripts; prefer running from root unless debugging a single package.