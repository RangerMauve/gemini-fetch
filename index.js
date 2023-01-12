import request from '@derhuerst/gemini/client.js'
import makeFetch from 'make-fetch'
import { Readable } from 'stream'

const DEFAULT_OPTS = {
  followRedirects: true,
  verifyAlpnId: () => true,
  tlsOpt: {
    rejectUnauthorized: false
  }
}

export default function makeGemini (opts = {}) {
  const finalOpts = { ...DEFAULT_OPTS, opts }
  return makeFetch(({ url, referrer }, sendResponse) => {
    const toRequest = new URL(url, referrer)

    request(toRequest.href, finalOpts, (err, res) => {
      if (err) {
        sendResponse({
          statusCode: 500,
          headers: {},
          data: intoStream(err.stack)
        })
      } else {
        const { statusCode, statusMessage: statusText, meta } = res

        // TODO: Figure out what to do with `1x` status codes
        const isOK = (statusCode >= 10) && (statusCode < 300)

        // If the response is 200, the mime type should be the meta tag
        const headers = isOK ? { 'Content-Type': meta } : {}

        // If the response had an error, use the meta as the response body
        const data = isOK ? res : intoStream(meta)
        sendResponse({
          statusCode: statusCode * 10,
          statusText,
          headers,
          data
        })
      }
    })
  })
}

export function intoStream (data) {
  return new Readable({
    read () {
      this.push(data)
      this.push(null)
    }
  })
}
