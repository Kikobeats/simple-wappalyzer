'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')
const Validator = require('jsonschema').Validator
const schema = require('./../schema.json')

const { JSDOM, VirtualConsole } = jsdom
const { technologies, categories } = require('./technologies.json')
const { ext_technologies, ext_categories } = require('./external.json')

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
  /*
    If user provided optional external package (their own technologies.json expansion)
    The following script checks the validity of this expansion and throws an error if 
    file does not match schema.
  */
  if (external !== undefined && external !== null) {
    const v = new Validator()
    const schemaToTestAgainst = schema
    const isValid = v.validate(external, schemaToTestAgainst)
    if (isValid !== undefined && isValid !== null) {
      if (isValid.errors.length > 0) {
        console.log(isValid.errors)
        wappalyzer.setTechnologies(technologies)
        wappalyzer.setCategories(categories)
        return 'External pacakge validation failed - please adhere to schema.json. Falling back to default technologies.json file'
      } else {
        wappalyzer.setTechnologies(ext_technologies)
        wappalyzer.setCategories(ext_categories)
      }
    }
  }

  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })

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
