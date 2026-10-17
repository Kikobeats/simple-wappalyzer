'use strict'

const test = require('ava')

const wappalyzer = require('../src')

const html = `<!doctype html>
<html>
  <head><meta name="generator" content="WordPress 6.4"></head>
  <body>
    <svg xmlns="http://www.w3.org/2000/svg">
      <foreignObject>
        <div xmlns="http://www.w3.org/1999/xhtml">
          <template data-js="playbook-check"></template>
        </div>
      </foreignObject>
    </svg>
  </body>
</html>`

test('detects technologies when the page has an SVG template', async t => {
  const result = await wappalyzer({
    url: 'https://voiceflow.com/',
    headers: {},
    html
  })

  t.true(result.some(technology => technology.name === 'WordPress'))
})
