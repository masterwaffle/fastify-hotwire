'use strict'

const { join } = require('node:path')
const fp = require('fastify-plugin')
const Piscina = require('piscina')

async function fastifyHotwire (fastify, opts) {
  const { templates } = opts
  delete opts.templates

  const pool = new Piscina(opts)

  fastify.decorateReply('render', render)
  fastify.decorateReply('turboStream', {
    getter () {
      return {
        append: (file, target, data) => turboSend(this, 'append', file, target, data),
        prepend: (file, target, data) => turboSend(this, 'prepend', file, target, data),
        replace: (file, target, data) => turboSend(this, 'replace', file, target, data),
        update: (file, target, data) => turboSend(this, 'update', file, target, data),
        remove: (file, target, data) => turboSend(this, 'remove', null, target),
        before: (file, target, data) => turboSend(this, 'before', file, target, data),
        after: (file, target, data) => turboSend(this, 'after', file, target, data),
        refresh: (file, target, data) => turboSend(this, 'refresh')
      }
    }
  })
  fastify.decorateReply('turboGenerate', {
    getter () {
      return {
        append: (file, target, data) => generate(this, 'append', file, target, data),
        prepend: (file, target, data) => generate(this, 'prepend', file, target, data),
        replace: (file, target, data) => generate(this, 'replace', file, target, data),
        update: (file, target, data) => generate(this, 'update', file, target, data),
        remove: (file, target, data) => generate(this, 'remove', null, target),
        before: (file, target, data) => generate(this, 'before', file, target, data),
        after: (file, target, data) => generate(this, 'after', file, target, data),
        refresh: (file, target, data) => generate(this, 'refresh')
      }
    }
  })

  async function render (file, data) {
    file = join(templates, file)
    const html = await pool.runTask({ file, data, fragment: false })
    this.type('text/html; charset=utf-8')
    this.send(html)
    return this
  }

  async function turboSend (that, action, file, target, data) {
    const html = await generate(that, action, file, target, data)
    that.type('text/vnd.turbo-stream.html; charset=utf-8')
    that.send(html)
    return that
  }

  async function generate (that, action, file, target, data) {
    const html =
      action !== 'remove' &&
      action !== 'refresh' &&
        (await pool.runTask({ file: join(templates, file), data, fragment: true }))
    return buildStream(action, target, html).replace(/\n/g, '').trim()
  }
}

function buildStream (action, target, content) {
  const targetAttribute = target ? `target="${target}"` : ''
  const templateHtml = content ? `<template>${content}</template>` : ''

  return `
  <turbo-stream action="${action}" ${targetAttribute}>
    ${templateHtml}
  </turbo-stream>
  `
}

module.exports = fp(fastifyHotwire, {
  name: '@fastify/hotwire'
})
module.exports.default = fastifyHotwire
module.exports.fastifyHotwire = fastifyHotwire
