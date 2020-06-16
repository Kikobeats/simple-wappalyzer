'use strict'

const writeJsonFile = require('write-json-file')
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
  const hasFixture = await existsFile(filepath)
  if (hasFixture) return JSON.parse(await fs.readFile(filepath, 'utf-8'))
  const result = await getHTML(url, opts)
  await writeJsonFile(filepath, result)
}

const URLS = [
  'https://kikobeats.com',
  'https://vercel.com',
  'https://www.theverge.com',
  'https://microlink.io'
]

URLS.forEach(targetUrl => {
  test(humanizeUrl(targetUrl), async t => {
    const fixture = await getFixture(targetUrl)
    const result = await wappalyzer(fixture)
    t.snapshot(result)
  })
})
