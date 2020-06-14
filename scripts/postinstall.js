'use strict'

const writeJsonFile = require('write-json-file')
const got = require('got')

const main = async () => {
  const apps = await got(
    'https://raw.githack.com/aliasio/wappalyzer/master/src/apps.json'
  ).json()

  await writeJsonFile('src/apps.json', apps)
}

main()
  .catch(err => console.error(err) && process.exit(1))
  .then(process.exit)
