#!/usr/bin/env node
import fetch from './index.js'

const url = process.argv[2]

if (url) {
  fetch(url).then((response) => {
    response.body.pipe(process.stdout)
  })
} else {
  console.log('Usage:\n\tgemini-fetch gemini://gemini.circumlunar.space/')
}
