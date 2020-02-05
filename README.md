## PNPM Compatibility Plugin for Gatsby

### Description

This plugin will integrate Webpack module & loader resolution for packages installed
via `pnpm`.

When using `pnpm`, building a Gatsby project will fail because `pnpm` uses a unique
`node_modules` structure, and `webpack` doesn't know how to resolve packages in it.
This plugin will configure `webpack` so that it is able to see `Gatsby`'s dependencies.

---

### How to install

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

---

### Extended usage

* Sometimes, Webpack may need to resolve a module that is a sub-dependency of one of your
project's dependencies, and due to the way Webpack resolves modules (and sometimes because of
the way those modules are written), it won't be able to.  If this is the case, we need to point
Webpack the way to where those sub-dependencies are located.  To do that, please include your
dependency in question in the `include` plugin option described below.

  * Note: the package you define in this manner **MUST** be one of your project's direct
  dependencies.  It will be resolved using your project's `node_modules` directory.

* There are also times where you want Webpack to be able to resolve modules in a directory that
is not a part of any of your dependency's `node_modules`.  If that's the case, please include
the directory path in the `include` option described below.
  * If you include a relative path, it will be resolved relative to your `process.cwd()`.
  * **MUST BE A DIRECTORY**.

---

### Available Options

| Option   | Description |
|:---------|:------------|
| include  | A list of package names and/or paths that you would like to be made available to Webpack.  Each of these should either be the name of one of your project's direct dependencies, or a path to a folder containing packages that can be resolved as a module.

Please define plugin options as follows:

```js
// gatsby-config.js
module.exports = {
  plugins: [
    ...,
    {
      resolve: `gatsby-plugin-pnpm`,
      options: {
        include: [
          `my-awesome-package`,
          `path/to/my/private/webpack/loaders`
        ]
      }
    }
  ]
}
```

## Issues / Contributing

If you notice any issues caused by this plugin, or there seems to be some feature missing,
please feel free to file an issue at <https://github.com/Js-Brecht/gatsby-plugin-pnpm/issues>