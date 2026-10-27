'use strict'

const { chain, mapValues, once } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const { Window } = require('happy-dom')

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

const getScripts = scripts => chain(scripts).map('src').compact().uniq().value()

const getHeader = (headers, name) => {
  name = name.toLowerCase()
  let result
  Object.keys(headers).find(
    key => name === key.toLowerCase() && (result = headers[key])
  )
  return result
}

const getMeta = document =>
  Array.from(document.querySelectorAll('meta')).reduce((acc, meta) => {
    const key = meta.getAttribute('name') || meta.getAttribute('property')
    if (key) acc[key.toLowerCase()] = [meta.getAttribute('content')]
    return acc
  }, {})

const DOCUMENT_SETTINGS = {
  disableComputedStyleRendering: true,
  disableCSSFileLoading: true,
  disableIframePageLoading: true,
  disableJavaScriptEvaluation: true,
  disableJavaScriptFileLoading: true
}

module.exports = async ({ url, headers, html }) => {
  loadTechnologies()
  const window = new Window({ url, settings: DOCUMENT_SETTINGS })
  window.document.documentElement.innerHTML = html

  try {
    const detections = await wappalyzer.analyze({
      url,
      meta: getMeta(window.document),
      headers: getHeaders(headers),
      scripts: getScripts(window.document.scripts),
      cookies: getCookies(getHeader(headers, 'set-cookie')),
      // Response body. outerHTML throws when an SVG <template> has no content fragment.
      html
    })

    return wappalyzer.resolve(detections)
  } finally {
    await window.happyDOM.close()
  }
}

module.exports.getHeader = getHeader
