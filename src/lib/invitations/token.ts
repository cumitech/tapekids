export function normalizeInviteToken(token: string) {
  try {
    return decodeURIComponent(token)
      .trim()
      .replace(/^<|>$/g, "")
      .replace(/[.,;:!?)\]\s]+$/g, "");
  } catch {
    return token.trim();
  }
}
