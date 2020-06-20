# @condict/eslint-plugin

This package contains the ESLint configuration for Condict. It exports three configurations:

* `node`: For Node (i.e. non-browser) packages.
* `web`: For browser packages that do not use React. This is also the recommended configuration for packages used in both Node and the browser.
* `react`: For browser packages that make use of React.

## Suggested .eslintrc.json files

**Node only:**

```json
{
  "extends": [
    "@condict/node"
  ],
  "plugins": [
    "@condict"
  ]
}
```

**Web or Node+web:**

```json
{
  "extends": [
    "@condict/web"
  ],
  "plugins": [
    "@condict"
  ]
}
```

**Web+React:**

```json
{
  "extends": [
    "@condict/react"
  ],
  "plugins": [
    "@condict"
  ]
}
```
