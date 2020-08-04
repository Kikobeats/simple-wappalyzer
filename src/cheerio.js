'use strict'

const { chain, mapValues } = require('lodash')
const { Cookie } = require('tough-cookie')

const getCookies = str =>
  chain(str)
    .castArray()
    .compact()
    .map(str => Cookie.parse(str).toJSON())
    .map(({ key: name, ...props }) => ({ name, ...props }))
    .value()

const getHeaders = headers => mapValues(headers, value => [value])

const getScripts = $ =>
  chain($('script'))
    .map(s => s.attribs['src'])
    .compact()
    .uniq()
    .value()

const getMeta = $ =>
  Array.from($('meta')).reduce((acc, meta) => {
    const key = meta.attribs['name'] || meta.attribs['property']
    if (key) acc[key.toLowerCase()] = [meta.attribs['content']]
    return acc
  }, {})

module.exports = ({ wappalyzer, url, headers, $ }) => {
  const detections = wappalyzer.analyze({
    url,
    meta: getMeta($),
    headers: getHeaders(headers),
    scripts: getScripts($),
    cookies: getCookies(headers['set-cookie']),
    html: $.html()
  })

  return wappalyzer.resolve(detections)
}
