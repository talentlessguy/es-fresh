# es-fresh

[![Subscribe to twitter][twitter-image]][twitter-url]
![Top language][top-lang-image]
![Vulnerabilities][snyk-image]
[![Version][npm-v-image]][npm-url]
[![Node Version][node-version-image]][node-version-url]
![Last commit][last-commit-image]

> This is a copy of [@foxify/fresh](https://github.com/foxifyjs/fresh) package but with ESM and CommonJS targets.

HTTP response freshness testing.

## Install

```sh
pnpm i es-fresh
```

## API

```ts
import fresh from 'es-fresh'
```

### `fresh(reqHeaders, resHeaders)`

Check freshness of the response using request and response headers.

When the response is still "fresh" in the client's cache `true` is
returned, otherwise `false` is returned to indicate that the client
cache is now stale and the full response should be sent.

When a client sends the `Cache-Control: no-cache` request header to
indicate an end-to-end reload request, this module will return `false`
to make handling these requests transparent.

## Example

```ts
import fresh from 'es-fresh'
import { createServer } from 'http'

function isFresh(req, res) {
  return fresh(req.headers, {
    etag: res.getHeader('ETag'),
    'last-modified': res.getHeader('Last-Modified'),
  })
}

createServer((req, res) => {
  // perform server logic
  // ... including adding ETag / Last-Modified response headers

  if (isFresh(req, res)) {
    // client has a fresh copy of resource
    res.statusCode = 304
    res.end()
    return
  }

  // send the resource
  res.statusCode = 200
  res.end('hello, world!')
}).listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)

[twitter-image]: https://img.shields.io/twitter/follow/v1rtl.svg?label=follow%20on%20twitter&style=flat-square
[twitter-url]: https://twitter.com/v1rtl
[node-version-image]: https://img.shields.io/node/v/es-fresh.svg?style=flat-square
[node-version-url]: https://nodejs.org
[top-lang-image]: https://img.shields.io/github/languages/top/talentlessguy/es-fresh.svg?style=flat-square
[snyk-image]: https://img.shields.io/snyk/vulnerabilities/npm/es-fresh.svg?style=flat-square
[npm-v-image]: https://img.shields.io/npm/v/es-fresh.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/es-fresh
[last-commit-image]: https://img.shields.io/github/last-commit/talentlessguy/es-fresh.svg?style=flat-square
