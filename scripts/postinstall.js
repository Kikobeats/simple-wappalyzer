'use strict'

const writeJsonFile = require('write-json-file')
const got = require('got')

const fetchTechnologies = async () => {
  const chars = Array.from({ length: 27 }, (value, index) =>
    index ? String.fromCharCode(index + 96) : '_'
  )

  const data = await Promise.all(
    chars.map(char =>
      got(
        `https://raw.githubusercontent.com/enthec/webappanalyzer/main/src/technologies/${char}.json`
      ).json()
    )
  )

  const technologies = data.reduce(
    (acc, obj) => ({
      ...acc,
      ...obj
    }),
    {}
  )

  // temporal fix until https://github.com/Kikobeats/simple-wappalyzer/issues/72 is closed
  technologies['Elementor Addon Elements'] = 'WordPress'

  return writeJsonFile('src/technologies.json', technologies)
}

const fetchCategories = async () => {
  const categories = await got(
    'https://raw.githubusercontent.com/enthec/webappanalyzer/main/src/categories.json'
  ).json()

  return writeJsonFile('src/categories.json', categories)
}

Promise.all([fetchTechnologies(), fetchCategories()]).catch(error =>
  console.error(error)
)
