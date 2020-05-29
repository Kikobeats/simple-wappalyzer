'use strict'

const filenamifyUrl = require('filenamify-url')
const humanizeUrl = require('humanize-url')
const existsFile = require('exists-file')
const getHTML = require('html-get')
const fs = require('fs').promises
const path = require('path')

const test = require('ava')

const wappalyzer = require('../src')

const getFixture = async (url, opts) => {
  const filename = filenamifyUrl(url)
  const filepath = path.resolve(__dirname, 'fixtures', filename)
  const hasFixture = await existsFile(filename)
  if (hasFixture) return require(filename)
  const result = await getHTML(url, opts)
  await fs.writeFile(filepath, JSON.stringify(result, null, 2))
  return result
}

;['https://kikobeats.com', 'https://vercel.com'].forEach(targetUrl => {
  test(humanizeUrl(targetUrl), async t => {
    const { headers, statusCode, url, html } = await getFixture(targetUrl)
    const result = await wappalyzer({ url, statusCode, html, headers })
    t.snapshot(result)
  })
})
