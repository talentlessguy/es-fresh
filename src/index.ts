import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http'

const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/

const parseHttpDate = Date.parse

const compareETags = (etag: string, str: string) =>
  str === etag || str === `W/${etag}` || `W/${str}` === etag

function isStale(etag: string, noneMatch: string) {
  let start = 0
  let end = 0

  for (let i = 0, len = noneMatch.length; i < len; i++) {
    switch (noneMatch.charCodeAt(i)) {
      case 0x20 /*   */:
        if (start === end) start = end = i + 1
        break
      case 0x2c /* , */:
        if (compareETags(etag, noneMatch.substring(start, end))) return false
        start = end = i + 1
        break
      default:
        end = i + 1
        break
    }
  }

  if (compareETags(etag, noneMatch.substring(start, end))) return false

  return true
}

/**
 * Check freshness of the response using request and response headers.
 */
export function fresh(
  reqHeaders: IncomingHttpHeaders,
  resHeaders: OutgoingHttpHeaders
) {
  // fields
  const modifiedSince = reqHeaders['if-modified-since']
  const noneMatch = reqHeaders['if-none-match']

  // unconditional request
  if (!modifiedSince && !noneMatch) return false

  // Always return stale when Cache-Control: no-cache
  // to support end-to-end reload requests
  // https://tools.ietf.org/html/rfc2616#section-14.9.4
  const cacheControl = reqHeaders['cache-control']
  if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
    return false
  }

  // if-none-match
  if (noneMatch && noneMatch !== '*') {
    const etag = resHeaders.etag as string | undefined

    if (!etag || isStale(etag, noneMatch)) return false
  }

  // if-modified-since
  if (modifiedSince) {
    const lastModified = resHeaders['last-modified'] as string | undefined

    if (
      !lastModified ||
      !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince))
    ) {
      return false
    }
  }

  return true
}
