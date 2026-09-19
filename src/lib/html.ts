export function unescapeHtmlEntities(value: string) {
  if (!/&(?:lt|gt|quot|amp|#39|#x27);/i.test(value)) {
    return value;
  }
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&amp;/gi, "&");
}

export function htmlToPlainText(html: string) {
  return unescapeHtmlEntities(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyHtml(html: string | null | undefined) {
  return htmlToPlainText(html ?? "").length === 0;
}
