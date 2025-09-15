'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const { Browser } = require('happy-dom')

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
  const browser = new Browser({
    settings: {
      disableComputedStyleRendering: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true
    }
  })

  const page = browser.newPage()
  page.url = url
  page.content = html

  const document = page.mainFrame.document

  const detections = await wappalyzer.analyze({
    url,
    meta: getMeta(document),
    headers: getHeaders(headers),
    scripts: getScripts(document.scripts),
    cookies: getCookies(getHeader(headers, 'set-cookie')),
    html: document.documentElement.outerHTML
  })

  const result = wappalyzer.resolve(detections)
  await browser.close()

  return result
}

module.exports.getHeader = getHeader
