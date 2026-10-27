'use strict'

const { chain, mapValues, once } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const { Parser } = require('htmlparser2')

const loadTechnologies = once(() => {
  wappalyzer.setTechnologies(require('./technologies.json'))
  wappalyzer.setCategories(require('./categories.json'))
})

const parseCookie = str => {
  const cookie = Cookie.parse(str)
  if (!cookie) return
  const { key: name, ...props } = cookie.toJSON()
  return { name, ...props }
}

const getCookies = str =>
  chain(str).castArray().compact().map(parseCookie).compact().value()

const getHeaders = headers => mapValues(headers, value => [value])

const getHeader = (headers, name) => {
  name = name.toLowerCase()
  let result
  Object.keys(headers).find(
    key => name === key.toLowerCase() && (result = headers[key])
  )
  return result
}

const getElements = html => {
  const elements = { meta: [], script: [] }
  let attributes = null
  let templateDepth = 0
  const parser = new Parser({
    onopentagname: name => {
      if (name === 'template') templateDepth++
      const isCollected = name === 'meta' || name === 'script'
      attributes = isCollected && templateDepth === 0 ? {} : null
      if (attributes) elements[name].push(attributes)
    },
    onattribute: (name, value) => {
      if (attributes && attributes[name] === undefined) attributes[name] = value
    },
    onclosetag: name => {
      if (name === 'template') templateDepth--
    }
  })
  parser.end(html)
  return elements
}

const getMeta = metas =>
  metas.reduce((acc, { name, property, content = null }) => {
    const key = name || property
    if (key) acc[key.toLowerCase()] = [content]
    return acc
  }, {})

const resolveUrl = (src, baseUrl) => {
  try {
    return new URL(src, baseUrl).href
  } catch (_) {
    return src
  }
}

const getScripts = (scripts, baseUrl) => [
  ...new Set(
    scripts
      .filter(({ src }) => src !== undefined)
      .map(({ src }) => resolveUrl(src, baseUrl))
      .filter(Boolean)
  )
]

module.exports = async ({ url, headers, html }) => {
  loadTechnologies()
  const { href: baseUrl } = new URL(url ?? 'about:blank')
  const { meta, script } = getElements(html)

  const detections = await wappalyzer.analyze({
    url,
    meta: getMeta(meta),
    headers: getHeaders(headers),
    scripts: getScripts(script, baseUrl),
    cookies: getCookies(getHeader(headers, 'set-cookie')),
    html
  })

  return wappalyzer.resolve(detections)
}

module.exports.getHeader = getHeader
