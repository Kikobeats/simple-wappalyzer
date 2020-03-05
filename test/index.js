'use strict'

const test = require('ava')

const getHTML = require('html-get')

const wappalyzer = require('../src')

test('extract data', async t => {
  const headers = {
    date: 'Sat, 22 Feb 2020 16:50:20 GMT',
    'content-type': 'text/html; charset=UTF-8',
    'set-cookie':
      '__cfduid=dc816e0d1b050e1f8cef4c96f025cb6811582390220; expires=Mon, 23-Mar-20 16:50:20 GMT; path=/; domain=.kikobeats.com; HttpOnly; SameSite=Lax; Secure',
    'cf-ray': '5692755cddc3a885-CDG',
    age: '78075',
    'cache-control': 'public, max-age=0, must-revalidate',
    vary: 'Accept-Encoding',
    'cf-cache-status': 'DYNAMIC',
    'expect-ct':
      'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
    'x-nf-request-id': 'e3c5df5f-2eae-43ec-9b3d-be6723f814aa-6765075',
    'x-origin-processing-time': '43.0000 ms',
    'x-powered-by': 'RankSense/CW',
    'x-rs-cf-app-version': '1.0.38',
    'x-rs-changes-amount': '0',
    'x-rs-fixes-request-time': '0.0000',
    'x-total-processing-time': '43.0000 ms',
    server: 'cloudflare'
  }
  const statusCode = 200
  const { url, html } = await getHTML('https://kikobeats.com')
  const result = await wappalyzer({ url, statusCode, html, headers })
  console.log(JSON.stringify(result, null, 2))
  t.snapshot(result)
})
