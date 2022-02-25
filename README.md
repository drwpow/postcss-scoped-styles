# postcss-scoped-styles

Scope every selector within CSS with a class. Can either be a unique, randomized class per CSS file (default), or can be a class of your choosing.

Fast, lightweight, and zero dependencies.

## Installation

```
npm i postcss-scoped-styles
```

```js
// postcss.config.mjs
import postcssScopedStyles from 'postcss-scoped-styles';

export default {
  plugins: [postcssScopedStyles()],
};
```

Any and all selectors you use will now be scoped:

```diff
- h1 {
+ h1.gZHu1x {
    font-size: 32px;
  }

- .button {
+ .button.gZHu1x {
    color: blue;
  }

- #text-input {
+ #text-input.gZHu1x {
    font-family: monospace;
  }
```

However, you may opt out of this with the `:global()` selector (i.e. will remain as-written):

```diff
- :global(.button:hover) {
+ .button:hover {
    color: blue;
  }
```

It’s also important to note that `html` and `body` **won’t** be scoped either, as they can only appear in the document once (it also makes selecting them easier).

## Options

**scopedClass**

By default, a random 6-character class is added for each CSS document. You may customize that by providing a `scopedClass()` function that returns a string:

```js
// postcss.config.mjs
import postcssScopedStyles from 'postcss-scoped-styles';

export default {
  plugins: [
    postcssScopedStyles({
      scopedClass({ uuid, selector }) {
        return `my-scoped-class-${uuid}`; // .my-scoped-class-c10a6a
      },
    }),
  ],
};
```

The callback provides `uuid` and `selector` in an object param for extra context, but you don’t have to use these to generate the class. `uuid` is the random string that would have been applied on its own. It will be randomized on every pass, but it will stay consistent within each CSS document.
