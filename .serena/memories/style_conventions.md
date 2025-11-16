# Style and conventions
- Language: TypeScript (Next.js 14 frontend, LangGraph backend). Use TypeScript typings; explicit anys allowed (rule off).
- ESLint (web): extends `next/core-web-vitals` + `@typescript-eslint/recommended`; enforces no unused vars/imports (allow names starting with `_`), other strict TS rules relaxed (no-explicit-any off, no-empty-object-type off). Agents ESLint similar via @typescript-eslint and unused-imports.
- Prettier: printWidth 80, 2-space indent, semicolons true, double quotes default, trailing commas es5, LF endings. Apply via project `.prettierrc` (per app).
- UI libraries: Radix UI, Tailwind; state via Zustand; markdown via @uiw/react-md-editor; follow existing component patterns.
- Turborepo: tasks propagate to packages; prefer running lint/format/build via root scripts unless targeting a package.