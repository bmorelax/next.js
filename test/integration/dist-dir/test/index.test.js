/* eslint-env jest */
/* global jasmine */
import { join, resolve, relative } from 'path'
import { existsSync, readFileSync } from 'fs'
import { BUILD_ID_FILE, CHUNK_GRAPH_MANIFEST } from 'next-server/constants'
import {
  nextServer,
  nextBuild,
  startApp,
  stopApp,
  renderViaHTTP
} from 'next-test-utils'

const appDir = join(__dirname, '../')
let appPort
let server
let app
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

describe('Production Usage', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    app = nextServer({
      dir: join(__dirname, '../'),
      dev: false,
      quiet: true
    })

    server = await startApp(app)
    appPort = server.address().port
  })
  afterAll(() => stopApp(server))

  describe('With basic usage', () => {
    it('should render the page', async () => {
      const html = await renderViaHTTP(appPort, '/')
      expect(html).toMatch(/Hello World/)
    })
  })

  describe('File locations', () => {
    it('should build the app within the given `dist` directory', () => {
      expect(
        existsSync(join(__dirname, `/../dist/${BUILD_ID_FILE}`))
      ).toBeTruthy()
    })
    it('should not build the app within the default `.next` directory', () => {
      expect(
        existsSync(join(__dirname, `/../.next/${BUILD_ID_FILE}`))
      ).toBeFalsy()
    })
  })

  describe('Module collection', () => {
    it('should build a chunk graph file', () => {
      const cgf = join(__dirname, `/../dist/${CHUNK_GRAPH_MANIFEST}`)
      expect(existsSync(cgf)).toBeTruthy()
      expect(
        JSON.parse(readFileSync(cgf, 'utf8')).pages['/'].includes(
          relative(appDir, resolve(__dirname, '..', 'pages', 'index.js'))
        )
      )
    })
  })
})
