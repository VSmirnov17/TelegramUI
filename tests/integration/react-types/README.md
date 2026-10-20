Run `npm run test:react-types` from the repository root. Node 18 or later and npm are required.

The check builds and packs the library, then installs that actual archive in two temporary consumers. Direct dependencies are pinned to React/React DOM 18.2.0 with their 18.3.0 types, and React/React DOM 19.2.9 with their 19.x types, using TypeScript 5.9.3. Ordinary npm peer resolution remains enabled.

Each consumer checks the public entry point, stylesheet import, the boolean `ignoreTelegramTheme` option (including nested false), nullable portal/target/input refs, Modal and Tabbar forwarded refs, controlled input events, compound navigation components, and a custom multiselect chip. Modal.Close accepts concrete button/SVG refs and a generic element callback with cleanup; negative cases reject non-element refs and assuming an arbitrary slotted element has button-only properties. `@ts-expect-error` cases ensure invalid props still fail. The compiler runs with `strict: true` and `skipLibCheck: false`.

Button consumers also compile with TypeScript **5.3.3**. The isolated consumers install React Router DOM **6.30.6** to check the actual Link's required `to`, anchor events and refs. Native and custom components retain contextual event/ref types, required props and Button's visual props; negative cases check missing/unknown props, wrong refs and event targets. The default `ButtonProps` describes a native button; `ButtonProps<typeof Link>` describes a Router override. Router is a test dependency of these temporary consumers only.

The README's font-family recipes compile under both TypeScript versions and React type sets, including the narrowly typed CSS custom property, scoped CSS-module class, native Button ref and Tooltip description relationship.

The complete native date example also compiles in both matrices: controlled string values, native bounds/required validity, external labels, submit handling, and the actual HTMLInputElement focus ref. Disabled and read-only date inputs use the existing Input API.

The complete implementation is also copied into each isolated consumer and compiled against its React types. This catches source-only incompatibilities such as missing `useRef` initializers and element props defaulting to `unknown`. Copies prevent the repository's React 18 development types from leaking into the React 19 check. Temporary files are removed on success or failure.
