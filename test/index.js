'use strict'

const writeJsonFile = require('write-json-file')
const filenamifyUrl = require('filenamify-url')
const humanizeUrl = require('humanize-url')
const { readFile } = require('fs/promises')
const { existsSync } = require('fs')
const getHTML = require('html-get')
const path = require('path')

const test = require('ava')

const wappalyzer = require('../src')

const getFixture = async (url, opts) => {
  const filename = filenamifyUrl(url)
  const filepath = path.resolve(__dirname, 'fixtures', filename)
  if (existsSync(filepath)) return JSON.parse(await readFile(filepath, 'utf-8'))
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
