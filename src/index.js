'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const { Window } = require('happy-dom')

const technologies = require('./technologies.json')
const categories = require('./categories.json')

wappalyzer.setTechnologies(technologies)
wappalyzer.setCategories(categories)

const parseCookie = str => Cookie.parse(str).toJSON()

const getCookies = str =>
  chain(str)
    .castArray()
    .compact()
    .map(parseCookie)
    .map(({ key: name, ...props }) => ({ name, ...props }))
    .value()

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

module.exports = async ({ url, headers, html }) => {
  const window = new Window({
    url,
    settings: {
      disableComputedStyleRendering: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true
    }
  })

  window.document.documentElement.innerHTML = html

  const detections = await wappalyzer.analyze({
    url,
    meta: getMeta(window.document),
    headers: getHeaders(headers),
    scripts: getScripts(window.document.scripts),
    cookies: getCookies(getHeader(headers, 'set-cookie')),
    html: window.document.documentElement.outerHTML
  })

  const result = wappalyzer.resolve(detections)
  window.close()

  return result
}

module.exports.getHeader = getHeader
