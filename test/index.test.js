import { expect } from 'chai';
import postcss from 'postcss';
import postcssScopedStyles, { scopeRule } from '../dist/index.js';

const className = 'abcd1234';

describe('scopes rules correctly', () => {
  // Note: assume all selectors have no unnecessary spaces (i.e. must be minified)
  const tests = {
    '.class': `.class.${className}`,
    h1: `h1.${className}`,
    '.nav h1': `.nav.${className} h1.${className}`,
    '.class+.class': `.class.${className}+.class.${className}`,
    '.class~:global(a)': `.class.${className}~a`,
    '.class *': `.class.${className} .${className}`,
    '.class>*': `.class.${className}>.${className}`,
    '.class button:focus': `.class.${className} button.${className}:focus`,
    '.class h3::before': `.class.${className} h3.${className}::before`,
    'button:focus::before': `button.${className}:focus::before`,
    '.class :global(*)': `.class.${className} *`,
    '.class :global(.nav:not(.is-active))': `.class.${className} .nav:not(.is-active)`, // preserve nested parens
    '.class :global(ul li)': `.class.${className} ul li`, // allow doubly-scoped selectors
    ':global(body:not(.is-light)).is-dark,:global(body:not(.is-dark)).is-light': `body:not(.is-light).is-dark,body:not(.is-dark).is-light`, // :global() can contain parens, and can be chained off of
    ':global(.foo):global(.bar)': '.foo.bar', // more :global() shenanigans
    '.class:global(.bar)': `.class.bar`, // this is technically a “useless“ :global() but it should still be extracted
    '.class:not(.is-active):not(.is-disabled)': `.class.${className}:not(.is-active):not(.is-disabled)`, // Note: the :not() selector can NOT contain multiple classes, so this is correct; if this causes issues for some people then it‘s worth a discussion
    ':hover.a:focus': `.${className}:hover.a:focus`, // weird but still valid (yes, it’s valid)
    '*:hover': `.${className}:hover`,
    ':not(.is-disabled).a': `.${className}:not(.is-disabled).a`, // also valid
    'body h1': `body h1.${className}`, // body shouldn‘t be scoped; it‘s not a component
    'html,body': `html,body`,
    from: 'from', // ignore keyframe keywords (below)
    to: 'to',
    '55%': '55%',
    '.class\\:class': `.class\\:class.${className}`, // classes can contain special characters if escaped
    '.class\\:class:focus': `.class\\:class.${className}:focus`,
  };

  for (const [given, want] of Object.entries(tests)) {
    it(given, () => {
      const got = scopeRule(given, className);
      expect(got).to.equal(want);
    });
  }
});

describe('postcss', () => {
  it('basic', async () => {
    const given = '.my-class { color: blue; }';
    const got = (await postcss([postcssScopedStyles()]).process(given)).css;

    // test that more was added (will be random each time)
    expect(got.length).to.be.greaterThan(given.length);
  });

  it('scopedClass', async () => {
    const given = '.my-class { color: blue; }';
    const want = '.my-class.banana { color: blue; }';
    const got = (await postcss([postcssScopedStyles({ scopedClass: () => 'banana' })]).process(given)).css;

    expect(got).to.equal(want);
  });
});
