export async function handleBase64Upload(
  userId: string,
  newVal: string | null | undefined,
  oldVal: string | null | undefined
): Promise<string | null> {
  const CDN_UPLOAD_URL = process.env.CDN_UPLOAD_URL;
  const CDN_SECRET_KEY = process.env.CDN_SECRET_KEY;
  if (!CDN_UPLOAD_URL || !CDN_SECRET_KEY) {
    throw new Error("CDN_UPLOAD_URL or CDN_SECRET_KEY not configured");
  }
  const prevUrl =
    typeof oldVal === "string" && oldVal.trim() !== "" ? oldVal.trim() : null;
  const newField =
    typeof newVal === "string" && newVal.trim() !== "" ? newVal.trim() : null;
  if (
    newField &&
    prevUrl &&
    newField === prevUrl &&
    !newField.startsWith("data:")
  ) {
    return prevUrl;
  }
  let bodyOldVal: string | null = null;
  let bodyNewVal: string | null = null;
  if (newField && newField.startsWith("data:")) {
    const mimeMatch = newField.match(
      /^data:(image\/(png|jpeg|jpg|webp));base64,(.*)$/i
    );
    if (!mimeMatch) {
      throw new Error(
        "Unsupported image type. Only PNG, JPEG, JPG, WEBP allowed."
      );
    }
    const b64Part = newField.slice(newField.indexOf(",") + 1);
    const approxBytes = (b64Part.length * 3) / 4;
    const MAX_BYTES = 5 * 1024 * 1024;
    if (approxBytes > MAX_BYTES) {
      throw new Error(
        `Image too large (${Math.round(
          approxBytes / 1024
        )} KiB). Max is ${MAX_BYTES / 1024} KiB.`
      );
    }
    bodyNewVal = newField;
    if (prevUrl) {
      let rel: string | null = null;
      try {
        const parsed = new URL(prevUrl);
        const cdnObj = new URL(CDN_UPLOAD_URL);
        if (
          parsed.origin === cdnObj.origin &&
          parsed.pathname.startsWith(`/uploads/avatars/${userId}/`)
        ) {
          rel = parsed.pathname;
        }
      } catch {
        if (
          prevUrl.startsWith(`/uploads/avatars/${userId}/`) ||
          prevUrl.startsWith(`uploads/avatars/${userId}/`)
        ) {
          rel = prevUrl.startsWith("/") ? prevUrl : `/${prevUrl}`;
        }
      }
      if (rel) bodyOldVal = rel;
    }
  } else {
    if (!newField && prevUrl) {
      let rel: string | null = null;
      try {
        const parsed = new URL(prevUrl);
        const cdnObj = new URL(CDN_UPLOAD_URL);
        if (
          parsed.origin === cdnObj.origin &&
          parsed.pathname.startsWith(`/uploads/avatars/${userId}/`)
        ) {
          rel = parsed.pathname;
        }
      } catch {
        if (
          prevUrl.startsWith(`/uploads/avatars/${userId}/`) ||
          prevUrl.startsWith(`uploads/avatars/${userId}/`)
        ) {
          rel = prevUrl.startsWith("/") ? prevUrl : `/${prevUrl}`;
        }
      }
      if (rel) {
        bodyOldVal = rel;
        bodyNewVal = null;
      } else {
        return null;
      }
    } else if (newField && newField !== prevUrl) {
      return newField;
    } else {
      return null;
    }
  }

  if (bodyOldVal === null && bodyNewVal === null) return null;
  const endpoint = CDN_UPLOAD_URL.replace(/\/$/, "") + `/${userId}`;
  const jsonBody: Record<string, any> = {};
  if (bodyOldVal !== null) jsonBody.oldVal = bodyOldVal;
  if (bodyNewVal !== null) jsonBody.newVal = bodyNewVal;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": CDN_SECRET_KEY,
    },
    body: JSON.stringify(jsonBody),
  });
  const resJson = await res.json();
  if (!res.ok || resJson.code !== 200) {
    throw new Error(
      resJson.message || `CDN error (status ${res.status})`
    );
  }
  return typeof resJson.results === "string"
    ? resJson.results
    : null;
}
