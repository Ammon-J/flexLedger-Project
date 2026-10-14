# FlexLedger

FlexLedger helps delivery drivers keep track of delivery blocks, mileage, and fuel costs.

## Stack

- Astro provides the pages and shared HTML layout.
- Svelte components provide the interface; interactive components are hydrated with Astro's `client:load` directive.
- Express provides the API, with MongoDB as the data store.

## Project structure

```text
src/
├── components/
│   ├── BlocksHome.svelte
│   ├── Login.svelte
│   ├── Register.svelte
│   └── Welcome.svelte
├── layouts/
│   └── Layout.astro
└── pages/
    ├── blocks.astro
    ├── index.astro
    └── login.astro
server/
└── ...
```

Svelte is enabled by `@astrojs/svelte` in `astro.config.mjs`. Keep route and document structure in Astro, and build UI components in `src/components` as `.svelte` files.

## Commands

Run these commands from the `flexledger` directory:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development environment |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build |
| `npm run test:api` | Run API tests |
