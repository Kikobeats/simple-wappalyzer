'use strict'

const writeJsonFile = require('write-json-file')
const got = require('got')

const main = async () => {
  const technologies = await got(
    'https://raw.githack.com/aliasio/wappalyzer/master/src/technologies.json'
  ).json()

  await writeJsonFile('src/technologies.json', technologies)

  const technologies = await got(
    'https://raw.githack.com/aliasio/wappalyzer/master/schema.json'
  ).json()

  await writeJsonFile('./schema.json', schema)
}

main()
  .catch(err => console.error(err) && process.exit(0))
  .then(process.exit)
