export function graphqlResponse(data: unknown): Response {
  return new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } })
}

export function sseResponse(...payloads: unknown[]): Response {
  const frames = payloads.map((payload) => `event: next\ndata: ${JSON.stringify(payload)}\n\n`)
  frames.push('event: complete\ndata: {}\n\n')

  return new Response(frames.join(''), { headers: { 'content-type': 'text/event-stream' } })
}
