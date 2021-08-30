'use strict'

const writeJsonFile = require('write-json-file')
const got = require('got')

const main = async () => {
  const technologies = await got(
    'https://cdn.jsdelivr.net/gh/aliasio/wappalyzer@master/src/technologies.json'
  ).json()

  await writeJsonFile('src/technologies.json', technologies)
}

main()
  .catch(err => console.error(err) && process.exit(0))
  .then(process.exit)
