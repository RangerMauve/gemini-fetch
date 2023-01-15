import test from 'tape'
import makeGemini from './index.js'

test('fetch data from known page', async (t) => {
  try {
    const fetch = makeGemini()

    const url = 'gemini://gemini.circumlunar.space/'
    const response = await fetch(url)
    const { headers, status } = response
    const contentType = headers.get('content-type')
    const text = await response.text()

    t.equal(status, 200, 'got 200 status code')
    t.equal(contentType, 'text/gemini', 'got gemini page')
    t.ok(text, 'got page text')

    t.end()
  } catch (e) {
    t.error(e)
  }
})
