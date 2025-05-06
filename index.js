import request from '@derhuerst/gemini/client.js'
import { makeRoutedFetch } from 'make-fetch'

const DEFAULT_OPTS = {
  followRedirects: true,
  verifyAlpnId: () => true,
  tlsOpt: {
    rejectUnauthorized: false
  }
}

const MIME_TEXT_HTML = 'text/html; charset=utf-8'
// const MIME_TEXT_PLAIN = 'text/plain; charset=utf-8'
const INPUT_FIELD = 'input'

export default function makeGemini (opts = {}) {
  const { fetch, router } = makeRoutedFetch()
  const finalOpts = { ...DEFAULT_OPTS, opts }

  router.get('gemini://*/**', async ({ url, referrer }) => { /**/
    const res = await requestGemini(url, finalOpts)
    const { statusCode, statusMessage: statusText, meta } = res
    if (statusCode === 11) {
      // Request password input
      return {
        status: 200,
        headers: { 'Content-Type': MIME_TEXT_HTML },
        body: makeForm(meta, 'password')
      }
    } else if (statusCode >= 10 && statusCode < 20) {
      // Request regular input
      return {
        status: 200,
        headers: { 'Content-Type': MIME_TEXT_HTML },
        body: makeForm(meta)
      }
    }

    const isOK = (statusCode >= 10) && (statusCode < 300)

    // If the response is 200, the mime type should be the meta tag
    const headers = isOK ? { 'Content-Type': meta } : {}

    // If the response had an error, use the meta as the response body
    const body = isOK ? res : meta
    return {
      status: statusCode * 10,
      statusText,
      headers,
      body
    }
  })

  router.post('gemini://*/**', async (request) => { /**/
    const { url } = request
    const formData = await request.formData()
    const input = formData.get(INPUT_FIELD)
    if (!input) {
      throw new Error(`Expected ${INPUT_FIELD} field in form submission`)
    }

    const location = new URL(url)
    location.search = input

    return {
      status: 302,
      headers: {
        Location: location.href
      }
    }
  })

  return fetch
}

async function requestGemini (url, opts) {
  return new Promise((resolve, reject) => {
    request(url, opts, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

function makeForm (prompt, type = 'text') {
  return `<!DOCTYPE html>
<title>${prompt}</title>
<form method="post" enctype="application/x-www-form-urlencoded">
  <h1>${prompt}</h1>
  <input autofocus name="${INPUT_FIELD}" type="${type}">
  <input type="submit">
</form>
`
}
