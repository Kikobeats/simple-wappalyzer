'use strict'

const Browser = require('./browser')
const Driver = require('wappalyzer/driver')

module.exports = ({ url, ...opts }) => new Driver(Browser, url, opts).analyze()
