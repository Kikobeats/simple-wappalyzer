'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')
const Validator = require('jsonschema').Validator
const schema = require('./../schema.json')

const { JSDOM, VirtualConsole } = jsdom
const toTest = require('./technologies.json')
const { technologies, categories } = require('./technologies.json')

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

const getScheme = () => {
  return schema
}

const getScripts = scripts =>
  chain(scripts)
    .map('src')
    .compact()
    .uniq()
    .value()

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

module.exports = ({ url, headers, html, external }) => {
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })

  if (external !== undefined && external !== null) {
    const v = new Validator()
    const schemaToTestAgainst = schema
    const isValid = v.validate(external, schemaToTestAgainst)
    if (isValid !== undefined && isValid !== null) {
      console.log(isValid.errors)
    }
  }

  const detections = wappalyzer.analyze({
    url,
    meta: getMeta(dom.window.document),
    headers: getHeaders(headers),
    scripts: getScripts(dom.window.document.scripts),
    cookies: getCookies(getHeader(headers, 'set-cookie')),
    html: dom.serialize()
  })

  return wappalyzer.resolve(detections)
}

module.exports.getHeader = getHeader
module.exports.getScheme = getScheme()
