export function isTokenLimitError(err: any): boolean {
  return (
    err?.cause?.message?.includes("Request too large for model") &&
    err?.code === "rate_limit_exceeded"
  );
}
