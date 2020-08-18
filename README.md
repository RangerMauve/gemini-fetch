# gemini-fetch
Load data from the Gemini protocol the way you would fetch from HTTP in JavaScript

## Usage

```
npm i --save gemini-fetch
```

```js
const fetch = require('gemini-fetch')({
  // Opts from https://github.com/derhuerst/gemini#api
  followRedirects: true,
  useClientCerts: false
})

const response = await fetch('gemini://gemini.circumlunar.space/')

console.log(await response.text())
```

## CLI

```
npm i -g gemini-fetch

gemini-fetch gemini://gemini.circumlunar.space/

# Or use npx

npx gemini-fetch gemini://gemini.circumlunar.space/
```
