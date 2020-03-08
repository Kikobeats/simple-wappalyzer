'use strict'

const { get, noop, chain, mapValues } = require('lodash')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')

const { JSDOM, VirtualConsole } = jsdom

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

const getLinks = links =>
  chain(links)
    .map('href')
    .compact()
    .uniq()
    .value()

function Browser ({ url, html, statusCode, headers }) {
  const { window } = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    virtualConsole: new VirtualConsole()
  })

  return {
    visit: noop,
    userAgent: get(headers, 'user-agent'),
    cookies: getCookies(get(headers, 'set-cookie')),
    html,
    statusCode,
    contentType: get(headers, 'content-type'),
    document: window.document,
    window,
    headers: getHeaders(headers),
    js: window,
    scripts: getScripts(window.document.scripts),
    links: getLinks(window.document.getElementsByTagName('a'))
  }
}

module.exports = Browser
