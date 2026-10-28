'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const { elements } = require('html-scripts')

const ELEMENT_TAGS = ['meta', 'script']
const ELEMENT_OPTIONS = { scripting: false }

let technologiesReady = false
let categoriesReady = false

// setTechnologies rewrites its registries in place and is not safe to call again.
// Read categories before that setter so a missing file leaves the registries untouched,
// and retry a failed setCategories without compiling technologies a second time.
const loadTechnologies = () => {
  if (categoriesReady) return
  const categories = require('./categories.json')
  if (!technologiesReady) {
    wappalyzer.setTechnologies(require('./technologies.json'))
    technologiesReady = true
  }
  wappalyzer.setCategories(categories)
  categoriesReady = true
}

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

const getScriptSrc = (scripts, baseUrl) => [
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
  const { meta, script } = elements(html, ELEMENT_TAGS, ELEMENT_OPTIONS)

  const detections = await wappalyzer.analyze({
    url,
    meta: getMeta(meta),
    headers: getHeaders(headers),
    scriptSrc: getScriptSrc(script, baseUrl),
    cookies: getCookies(getHeader(headers, 'set-cookie')),
    html
  })

  return wappalyzer.resolve(detections)
}

module.exports.getHeader = getHeader
