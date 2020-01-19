# PNPM Compatibility Plugin for Gatsby

## Description

This plugin will integrate module resolution for packages installed
using `pnpm`.

When using `pnpm`, building a gatsby project will fail because `pnpm` uses a unique
`node_modules` structure, and `webpack` doesn't know how to resolve packages in it.
This plugin will configure `webpack` so that it is able to see `Gatsby`'s dependencies.

---

## How to install

* Include the plugin in your `gatsby-config.js`.

```js
// gatsby-config.js
module.exports = {
  plugins: [
    ...,
    `gatsby-plugin-pnpm`,
    ...
  ]
}
```

That's it.  You should be able to build now.

## Issues / Contributing

If you notice any issues caused by this plugin, or there seems to be some feature missing,
please feel free to file an issue at <https://github.com/Js-Brecht/gatsby-plugin-pnpm/issues>.