# @fastify/hotwire

[![CI](https://github.com/fastify/fastify-hotwire/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/fastify-hotwire/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/@fastify/hotwire.svg?style=flat)](https://www.npmjs.com/package/@fastify/hotwire)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

Do you enjoy writing applications with the [hotwire](http://hotwire.dev) pattern?
We have got you covered!

This plugin adds all the necessary utilities to Fastify for creating a fullstack application
with Hotwire. Take a look at the [example](./example) folder to see it in action!

## Install

```
npm i @fastify/hotwire
```

## Usage

Add the plugin to Fastify, with at least two options:

- `templates`: the location of your folder with your templates
- `filename`: the location of your HTML generator, any templating language is supported!

```js
// in your fastify app
fastify.register(require('@fastify/hotwire'), {
  templates: join(__dirname, 'views'),
  filename: join(__dirname, 'worker.js')
})
```

```js
// worker.js
module.exports = ({ file, data, fragment }) => {
  // your favorite templating library
  return 'generated html'
}
```

## API

### `reply.render(filename, data)`

Generates the entire initial page, it calls the worker with `fragment: false`

```js
fastify.get('/', async (req, reply) => {
  return reply.render('filename', { data })
})
```

### `reply.turboGenerate.*(filename, target, data)`

Every turbo stream action is supported: `append`, `prepend`, `replace`, `update`, `remove`, `before`, `after`, `refresh`.
It generates and returns a turbo compatible fragment.

```js
fastify.get('/', async (req, reply) => {
  const fragment = await reply.turboGenerate.append('filename', 'target', { data })
  // send it via SSE or websockets
})
```

### `reply.turboStream.*(filename, target, data)`

Every turbo stream action is supported: `append`, `prepend`, `replace`, `update`, `remove`.
It generates and send a turbo compatible fragment and configures the appropriate content type.

```js
fastify.get('/', async (req, reply) => {
  return reply.turboStream.append('filename', 'target', { data })
})
```

## License

Licensed under [MIT](./LICENSE).
