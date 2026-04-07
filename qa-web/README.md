# QA React App

React split of `crane_qa.html`.

## Run

```bash
cd qa-web
npm install
npm run dev
```

## Structure

- `src/config.ts` suite + constants
- `src/types.ts` shared types
- `src/services/api.ts` request wrapper + failure audit
- `src/services/tests.ts` test implementations
- `src/components/*` UI sections
- `src/App.tsx` runner orchestration
