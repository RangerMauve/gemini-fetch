import createCert from 'create-cert'
import { createServer } from '@derhuerst/gemini'
import { DEFAULT_PORT } from '@derhuerst/gemini/lib/util.js'
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

test('fetch asking input and supplying it', async (t) => {
  const prompt = 'Enter a search string!'
  function onRequest (request, response) {
    const { url, path } = request
    const { search } = new URL(url)
    //console.log({ url, path, search })

    if (!search) {
      response.prompt(prompt)
      return response.end('')
    }
    response.end(search.slice(1))
  }

  const fetch = await makeGemini()

  const server = createServer({
    tlsOpt: await createCert('example.org')
  }, onRequest)

  server.listen(DEFAULT_PORT)
  server.on('error', (e) => t.fail(e))

  try {
    let response = null
    response = await fetch('gemini://localhost/example')
    await checkOk(response, t)
    t.ok(response.headers.get('Content-Type').includes('text/html'), 'Got HTML form with prompt')
    const htmlForm = await response.text()
    t.ok(htmlForm.includes(prompt), 'Prompt included in form')

    const formData = new FormData()
    formData.append('input', 'Hello World')
    response = await fetch('gemini://localhost/example', {
      method: 'POST',
      body: formData
    })
    await checkOk(response, t)
    t.equal(response.status, 302, 'Redirected to URL with input')
    t.equal(response.headers.get('Location'), 'gemini://localhost/example?Hello%20World')

    response = await fetch('gemini://localhost/example?Hello World')
    await checkOk(response, t)
  } finally {
    server.close()
  }
})

async function checkOk (response, t, message = 'Response OK') {
  if (!response.ok && (response.status !== 302)) {
    const errMsg = await response.text()
    console.log(response.status, errMsg)
    t.fail(errMsg)
  }
  t.pass(message)
}
