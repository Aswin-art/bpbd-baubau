import DOMPurify from "isomorphic-dompurify";
import type { Descendant } from "slate";
import { Element as SlateElement, Text } from "slate";

/** Allowed markup untuk komentar (Slate → HTML → sanitize). */
const PURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "u", "s", "code", "blockquote"],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

export function sanitizeCommentHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

type CommentMarks = {
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serializeTextNode(node: Text): string {
  let t = escapeHtml(node.text);
  // Apply marks (nesting order is stable and deterministic).
  const marks = node as Text & CommentMarks;
  if (marks.code) t = `<code>${t}</code>`;
  if (marks.strike) t = `<s>${t}</s>`;
  if (marks.underline) t = `<u>${t}</u>`;
  if (node.italic) t = `<em>${t}</em>`;
  if (node.bold) t = `<strong>${t}</strong>`;
  return t;
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) {
    return serializeTextNode(node);
  }
  if (SlateElement.isElement(node) && node.type === "paragraph") {
    const inner = node.children.map(serializeNode).join("");
    return `<p>${inner.length > 0 ? inner : "<br />"}</p>`;
  }
  if (SlateElement.isElement(node) && "type" in node && node.type === "blockquote") {
    const inner = node.children.map(serializeNode).join("");
    return `<blockquote><p>${inner.length > 0 ? inner : "<br />"}</p></blockquote>`;
  }
  return "";
}

/** Serialize dokumen Slate ke HTML, lalu sanitasi (defense in depth). */
export function slateToSafeCommentHtml(nodes: Descendant[]): string {
  const raw = nodes.map(serializeNode).join("");
  return sanitizeCommentHtml(raw);
}
