# When finishing a task
- Run formatting check: `yarn format:check` (or package-level variant).
- Run linters: `yarn lint` (or package-level) and fix issues with `yarn lint:fix` if needed.
- For frontend changes, consider `apps/web` vitest evals (`yarn eval`) if affected.
- Build verification if changes impact build/deploy: `yarn build` (turbo across workspaces).
- Ensure env files `.env` (root) and `apps/web/.env` populated if running locally; Supabase/LLM keys required for runtime.
- Update relevant docs/README if UX or scripts change.