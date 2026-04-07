export function extractTextFromBlockNote(
  content: unknown,
  maxLength: number = 160,
): string {
  if (typeof content === "string") {
    return content.slice(0, maxLength);
  }

  if (!content) return "";

  try {
    const blocks = Array.isArray(content) ? content : [];

    const text = blocks
      .map((block: Record<string, unknown>) => {
        // Handle block content array
        const blockContent = block.content;
        if (!Array.isArray(blockContent)) return "";

        return blockContent
          .map((item: Record<string, unknown>) => {
            // Standard text content
            if (typeof item.text === "string") {
              return item.text;
            }
            return "";
          })
          .join("");
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, maxLength);
  } catch {
    return "";
  }
}
