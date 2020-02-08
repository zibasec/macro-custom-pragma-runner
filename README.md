# Macro Custom Pragma Runner

A macro for [@architect/architect](https://arc.codes/) that lets you define and run custom pragmas intuitively.

## Installation

From source

```bash
npm install zibasec/macro-custom-pragma-runner
```

Note: npm version coming soon...

## Usage

Define your custom pragma in `.arc`, ensure the name is prefixed by an underscore.

**Sample .arc file** this has a `@_hello`

```
@app
myApp

@http
post /hellow

@macros
macro-custom-pragma-runner

@_hello
name Julie
```

Ensure the directory `src/pragmas/` exists.

Ensure that you make either `src/pragmas/hello.js` or `src/pragmas/hello/index.js`

Then within that file define a function that returns a Promise. This function will receive the object `{ arc, cloudformation, stage, args }` as an argument. These will have the same shape as explained in the Architect for custom macros [docs](https://arc.codes/primitives/macros). `args` is the raw shape of the parsed arguments for your pragma.

Given arguments like this:

```
@_hello
name Julie
details:
  favoriteColor: green
```

the value of `args` would look like

```js
[ [ 'name', 'Julie' ],
  { 'details:': { 'favorit_color:': 'green' } } ]
```

It can optionally return an object with a `cloudformation` property, this value will be merged with the architect generated property via `Object.assign()`.

Example:

```js
module.exports = async function ({ arc, cloudformation, stage, args }) {
  console.log(`Hello ${args[0][1]}`)
  // this return statement isn't needed since we're not modifying the cft but it's here for demonstration
  return { cloudformation }
}
```

Next time your run `npx arc deploy` you should see `Hello Julie` in stdout.

**IMPORTANT** the custom pragams are executed in the order in which they are defined. This can cause issues if multiple custom pragmas modify the same cloudformation properties.

## License

[MIT](https://choosealicense.com/licenses/mit/)