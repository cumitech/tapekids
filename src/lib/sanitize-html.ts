import DOMPurify from "isomorphic-dompurify";

import { unescapeHtmlEntities } from "@/lib/html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "blockquote",
  "span",
];

export function sanitizeRichText(html: string) {
  return DOMPurify.sanitize(unescapeHtmlEntities(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}
