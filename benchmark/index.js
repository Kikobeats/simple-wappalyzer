'use strict'

const { readdirSync, readFileSync, writeFileSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const { join, resolve } = require('node:path')

const wappalyzer = require('..')

const RUNS = 7
const ANALYZE_CALLS = 3
const PACKAGE_PATH = resolve(__dirname, '..')
const FIXTURES_PATH = join(__dirname, '..', 'test', 'fixtures')

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const now = () => process.hrtime.bigint()

const elapsed = started => Number(now() - started) / 1e6

const loadFixtures = () =>
  readdirSync(FIXTURES_PATH)
    .sort()
    .map(filename => ({
      filename,
      fixture: JSON.parse(readFileSync(join(FIXTURES_PATH, filename), 'utf8'))
    }))

const detectionNames = detections =>
  detections
    .map(({ name }) => name)
    .sort()
    .join(',')

const analyzeCase = ({ filename, fixture }) => {
  let expected
  return {
    name: `analyze ${filename}`,
    work: `${ANALYZE_CALLS} calls, ${fixture.html.length} bytes html`,
    warmup: async () => {
      const detections = await wappalyzer(fixture)
      if (detections.length === 0) throw new Error(`${filename}: no detections`)
      expected = detectionNames(detections)
      return `${detections.length} detections`
    },
    timed: async () => {
      const started = now()
      for (let call = 0; call < ANALYZE_CALLS; call++) {
        const actual = detectionNames(await wappalyzer(fixture))
        if (actual !== expected) {
          throw new Error(
            `${filename}: detections ${actual} != warmup ${expected}`
          )
        }
      }
      return elapsed(started)
    }
  }
}

const spawnNode = code => {
  const started = now()
  const child = spawnSync(process.execPath, ['-e', code], { stdio: 'inherit' })
  const wall = elapsed(started)
  if (child.status !== 0) { throw new Error(`node -e ${code} exited ${child.status}`) }
  return wall
}

const REQUIRE_CODE = `require(${JSON.stringify(PACKAGE_PATH)})`
const BASELINE_CODE = '0'

const coldRequireCase = () => ({
  name: 'cold require',
  work: '1 spawn minus node -e 0 baseline',
  warmup: async () => {
    spawnNode(BASELINE_CODE)
    spawnNode(REQUIRE_CODE)
    return 'spawn ok'
  },
  timed: async () => spawnNode(REQUIRE_CODE) - spawnNode(BASELINE_CODE)
})

const measure = async entry => {
  const samples = []
  let errors = 0
  let note = ''
  try {
    note = await entry.warmup()
  } catch (error) {
    errors++
    console.error(error.message)
  }
  for (let run = 0; run < RUNS && errors === 0; run++) {
    try {
      samples.push(await entry.timed())
    } catch (error) {
      errors++
      console.error(error.message)
    }
  }
  return { samples, errors, note }
}

const report = (entry, { samples, errors, note }) => {
  const med = samples.length ? median(samples) : Number.NaN
  const min = samples.length ? Math.min(...samples).toFixed(1) : 'n/a'
  const max = samples.length ? Math.max(...samples).toFixed(1) : 'n/a'
  const extra = `work ${entry.work}, ${note}, errors ${errors}, runs ${RUNS}`
  console.log(
    `${entry.name}  median ${med.toFixed(1)}ms  range ${min}-${max}  ${extra}`
  )
  return {
    name: entry.name,
    unit: 'ms',
    value: Number(med.toFixed(1)),
    range: `${min}-${max}`,
    extra
  }
}

const main = async () => {
  const cases = [...loadFixtures().map(analyzeCase), coldRequireCase()]
  const results = []
  let errors = 0
  for (const entry of cases) {
    const result = await measure(entry)
    errors += result.errors
    results.push(report(entry, result))
  }
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
