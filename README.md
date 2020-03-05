# simple-wappalyzer

![Last version](https://img.shields.io/github/tag/Kikobeats/simple-wappalyzer.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/com/Kikobeats/simple-wappalyzer/master.svg?style=flat-square)](https://travis-ci.com/Kikobeats/simple-wappalyzer)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/simple-wappalyzer.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/simple-wappalyzer)
[![Dependency status](https://img.shields.io/david/Kikobeats/simple-wappalyzer.svg?style=flat-square)](https://david-dm.org/Kikobeats/simple-wappalyzer)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/simple-wappalyzer.svg?style=flat-square)](https://david-dm.org/Kikobeats/simple-wappalyzer#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/simple-wappalyzer.svg?style=flat-square)](https://www.npmjs.org/package/simple-wappalyzer)

> A simple way to interacting with [Wappalyzer](https://www.wappalyzer.com).

Although Wappalyzer has an [official library](https://github.com/AliasIO/wappalyzer), it performs network requests operations under the hood.

**simple-wappalyzer** get the same information, but all the necessary data is provided as parameters.

## Install

```bash
$ npm install simple-wappalyzer --save
```

## Usage

```js
const wappalyzer = require('simple-wappalyzer')
const getHTML = require('html-get')

getHTML('https://kikobeats.com')
  .then(({ url, html, statusCode, headers }) =>
    wappalyzer({ url, html, statusCode, headers })
  )
  .then(result => console.log(result))

// {
//   "urls": {
//     "https://kikobeats.com/": {
//       "status": 200
//     }
//   },
//   "applications": [
//     {
//       "name": "CloudFlare",
//       "confidence": "100",
//       "version": null,
//       "icon": "CloudFlare.svg",
//       "website": "http://www.cloudflare.com",
//       "cpe": null,
//       "categories": [
//         {
//           "31": "CDN"
//         }
//       ]
//     },
//     {
//       "name": "Google Analytics",
//       "confidence": "100",
//       "version": null,
//       "icon": "Google Analytics.svg",
//       "website": "http://google.com/analytics",
//       "cpe": null,
//       "categories": [
//         {
//           "10": "Analytics"
//         }
//       ]
//     },
//     {
//       "name": "Jekyll",
//       "confidence": "100",
//       "version": "v3.8.6",
//       "icon": "Jekyll.png",
//       "website": "http://jekyllrb.com",
//       "cpe": "cpe:/a:jekyllrb:jekyll",
//       "categories": [
//         {
//           "57": "Static site generator"
//         }
//       ]
//     },
//     {
//       "name": "Netlify",
//       "confidence": "100",
//       "version": null,
//       "icon": "Netlify.svg",
//       "website": "https://www.netlify.com/",
//       "cpe": null,
//       "categories": [
//         {
//           "62": "PaaS"
//         },
//         {
//           "31": "CDN"
//         }
//       ]
//     }
//   ],
//   "meta": {
//     "language": "en"
//   }
// }
```

## License

**simple-wappalyzer** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/simple-wappalyzer/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/Kikobeats/simple-wappalyzer/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
