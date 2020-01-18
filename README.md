# Awesome Typescript Loader plugin for Gatsby

## Description

This plugin will integrate `awesome-typescript-loader` into the webpack config
to enable typescript support in Gatsby.  After `ts` files are compiled, they are
then fed into the standard gatsby `loaders.js()` (babel-loader, etc...), to maintain
compatibility.

---

## How to install

1. Include the plugin in your `gatsby-config.js`.

```js
// gatsby-config.js
module.exports = {
  plugins: [
    ...,
    `gatsby-plugin-atl`
  ]
}
```

2. Configure using any of `awesome-typescript-loader`'s options

---

## Available Options

* `ignoreAliases`: This will disable the alias transformer used in the plugin
* Any of the options used by `awesome-typescript-loader` can be used here.
  * _There is no guarantee that all of these options will work with Gatsby._
  * For list of `options` that are available for this plugin, see the
`awesome-typescript-loader` documentation at the following:

> <https://github.com/s-panferov/awesome-typescript-loader/#loader-options>

---

## Alias Transformation

By default, this plugin uses the npm package `ts-transform-paths`
function, so that you can use aliases from your `tsconfig.json`.

> <https://github.com/OniVe/ts-transform-paths>

If you want to exclude this functionality, then include the `ignoreAliases` boolean
value in the plugin configuration in `gatsby-config.js`, like so:

```js
// gatsby-config.js
module.exports = {
  ...
  plugins: [
    {
      resolve: 'gatsby-plugin-atl',
      options: {
        ignoreAliases: true
      }
    }
  ]
}
```

This is enabled by default to take some of the guesswork out getting your aliases working.  The process actually replaces the aliases with the paths relative to the source file being processed, so there is no need to include aliases in your webpack config.  This eliminates much of the maintenance.

---

## Required Compiler Options

By default some `compilerOptions` options will be set for you, as a minimum configuration.  Without these options set, there will usually be issues with the output that is fed to `babel-loader`, and the build will fail.

> _**If these are not configured, then compilation tends to fail.  These options are:**_

* target: 'esnext'
* module: 'esnext'
* noEmit: true
* moduleResolution: 'node'
* lib: [ 'dom' ]
* jsx: 'react'

---

## Additional extensibility

If you want to take full control of the compilation process, you can use a custom compiler.

I usually prefer to use `ttypescript` (<https://github.com/cevek/ttypescript>), because it gives you access to some cool transformer features.
To use `ttypescript`, first install it in your project

```sh
npm i -D ttypescript
```

Then set the configuration options in `gatsby-config.js`

```js
// gatsby-config.js
module.exports = {
  ...
  plugins: [
    {
      resolve: 'gatsby-plugin-atl',
      options: {
        compiler: 'ttypescript'
      }
    }
  ]
}
```

`ttypescript` will use your `tsconfig.json` by default, which is another cool feature.

Just make sure you use these options in your `tsconfig.json`

```json
{
  "module": "esnext",
  "target": "esnext",
  "noEmit": true,
  "moduleResolution": "node",
  "lib": ["dom"],
  "jsx": "react"
}
```
