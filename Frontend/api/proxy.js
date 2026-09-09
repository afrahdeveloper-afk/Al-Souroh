const BACKEND_ORIGIN = "https://apisorouh.trycvision.com";

export default async function handler(req, res) {
  const { path, ...restQuery } = req.query;
  const pathSegment = Array.isArray(path) ? path.join("/") : path || "";

  const queryString = new URLSearchParams(restQuery).toString();
  const targetUrl = `${BACKEND_ORIGIN}/api/${pathSegment}${queryString ? `?${queryString}` : ""}`;

  const forwardHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length"
    )
      continue;
    forwardHeaders[key] = value;
  }
  forwardHeaders["origin"] = BACKEND_ORIGIN;

  const init = { method: req.method, headers: forwardHeaders };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    init.body = Buffer.concat(chunks);
  }

  let backendResponse;
  try {
    backendResponse = await fetch(targetUrl, init);
  } catch (error) {
    res
      .status(502)
      .json({ detail: `Upstream request failed: ${error.message}` });
    return;
  }

  res.status(backendResponse.status);

  const setCookies =
    typeof backendResponse.headers.getSetCookie === "function"
      ? backendResponse.headers.getSetCookie()
      : backendResponse.headers.get("set-cookie")
        ? [backendResponse.headers.get("set-cookie")]
        : [];
  if (setCookies.length) res.setHeader("set-cookie", setCookies);

  backendResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "content-encoding" ||
      lower === "content-length" ||
      lower === "set-cookie"
    )
      return;
    res.setHeader(key, value);
  });

  const buffer = Buffer.from(await backendResponse.arrayBuffer());
  res.send(buffer);
}
