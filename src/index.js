'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')
const Validator = require('jsonschema').Validator
const schema = require('./../schema.json')

const { JSDOM, VirtualConsole } = jsdom
const { technologies, categories } = require('./technologies.json')
const old_tech = require('./technologies.json')

const fetchFirstCategory = () => {
  old_categories = old_technologies.categories
  let largestCategoryValue = 0
  for (const [key, value] of Object.entries(old_categories)) {
    //console.log(key, value);
    const numeralVal = parseInt(key)
    if (numeralVal > largestCategoryValue) {
      largestCategoryValue = numeralVal
    }
  }
  return largestCategoryValue + 1
}

const addNewCategories = () => {
  technologies.categories.forEach((category, index) => {
    /* console.log(index);
    console.log(category); */

    new_tech = {
      ...new_tech,
      categories: {
        ...new_tech.categories,
        [LastCategory.toString()]: {
          ...technologies.categories[index]
        }
      }
    }
    LastCategory++
  })

  return
}

const addNewTechnologies = () => {
  for (const [key, value] of Object.entries(technologies.technologies)) {
    new_tech = {
      ...new_tech,
      technologies: {
        ...new_tech.technologies,
        [key]: {
          ...value
        }
      }
    }
  }
  return
}

const FirstCategory = fetchFirstCategory()
LastCategory = FirstCategory

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
    new_tech = {
      ...old_tech
    }

    addNewCategories()

    addNewTechnologies()

    const v = new Validator()
    const schemaToTestAgainst = schema
    const isValid = v.validate(external, schemaToTestAgainst)
    if (isValid !== undefined && isValid !== null) {
      if (isValid.errors.length > 0) {
        console.log(isValid.errors)
        return 'External pacakge validation failed - please adhere to schema.json.'
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
