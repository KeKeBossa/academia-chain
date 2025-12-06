# Repository Guidelines

## Project Structure & Module Organization
- Next.js source lives in `src/app`; `layout.tsx` wires shared providers, `page.tsx` holds the RainbowKit-powered landing page, and `globals.css` configures Tailwind utility layers.
- Smart contracts reside in `contracts/`, with deployment recipes in `ignition/` and integration helpers under `scripts/`.
- Hardhat-generated files (`artifacts/`, `cache/`) appear after compiling; leave them untracked when possible.
- Static assets sit in `public/`, while shared config (TypeScript, ESLint, Tailwind, Hardhat) is defined at the repository root.

## Build, Test, and Development Commands
- `npm run dev` — Start the Next.js app with Turbopack for local development.
- `npm run build` / `npm run start` — Produce a production build and serve it for smoke testing.
- `npm run lint` — Run the Next.js ESLint suite; address all errors before opening a PR.
- `npx hardhat compile` — Regenerate Solidity artifacts and type bindings.
- `npx hardhat test` — Execute the Hardhat Mocha/Chai suite located in `test/`.
- `npx hardhat run scripts/send-op-tx.ts --network sepolia` — Example script invocation; set RPC credentials beforehand.

## Coding Style & Naming Conventions
- TypeScript across app and tests; favor explicit types when inference is unclear.
- Follow the project’s 2-space indentation, single quotes in TS/TSX, and Tailwind utility classes for styling.
- Components and contracts use PascalCase (e.g., `PaperRepository.sol`, `PaperList.tsx`), hooks and utility functions camelCase.
- Keep React components client-safe by annotating with `'use client'` only when React hooks are required.

## Testing Guidelines
- Tests live in `test/` beside the contract they exercise; mirror the contract name (`PaperRepository.ts`) for clarity.
- Mocha is the default runner with Chai/Viem assertions; structure suites using `describe` blocks per feature and clean fixtures between cases.
- Prior to merging, run both `npx hardhat test` and `npm run lint`; add new tests whenever contract storage layout or public APIs change.

## Commit & Pull Request Guidelines
- History currently uses short, lowercase messages; continue with concise, imperative summaries (e.g., `add paper mint flow`), optionally prefixed with a Conventional Commit type.
- Scope each commit to one logical change and include affected areas in the body when not obvious.
- For pull requests, provide: purpose summary, testing proof (commands run + output), linked issues or deployment IDs, and UI screenshots when the Next.js front end changes.

## Security & Configuration Notes
- Load secrets through environment variables (`SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`) and keep `.env*` files out of version control.
- Review `hardhat.config.ts` when touching network settings; production builds rely on the `production` Solidity profile with optimizer enabled.
- If you add new deployment scripts, document required params in `README.md` and reference them from the PR description.
