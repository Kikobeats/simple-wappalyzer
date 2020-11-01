'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')

const { JSDOM, VirtualConsole } = jsdom

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

const getScripts = scripts =>
  chain(scripts)
    .map('src')
    .compact()
    .uniq()
    .value()

const getMeta = document =>
  Array.from(document.querySelectorAll('meta')).reduce((acc, meta) => {
    const key = meta.getAttribute('name') || meta.getAttribute('property')
    if (key) acc[key.toLowerCase()] = [meta.getAttribute('content')]
    return acc
  }, {})

module.exports = ({ url, headers, html }) => {
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })
  
  let cookies_lowerCase = null;
  var searchKey = 'set-cookie';
  cookies_lowerCase = headers[Object.keys(myObj).find(key => { 
      if(key.toLowerCase() === searchKey.toLowerCase()){
          //console.log("MATCH!!!");
          return true;
      }
  })];

  const detections = wappalyzer.analyze({
    url,
    meta: getMeta(dom.window.document),
    headers: getHeaders(headers),
    scripts: getScripts(dom.window.document.scripts),
    cookies: getCookies(cookies_lowerCase),
    html: dom.serialize()
  })


  return wappalyzer.resolve(detections)
}
