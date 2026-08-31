"use client";

import React, { memo } from "react";

interface ChatMessageRendererProps {
  text: string;
  isAssistant?: boolean;
}

/**
 * Safely and cleanly renders inline markdown formatting (bold, italic, strikethrough, code).
 */
function renderInlineFormatting(line: string): React.ReactNode[] {
  // Clean up any weird accidental prefix like " .**" or ".**" or "• .**"
  const cleaned = line
    .replace(/^(\s*[•\-*]?\s*)\.\*\*/g, "$1**")
    .replace(/^\.\*\*/g, "**");

  // Regex to split by markdown tokens: **bold**, ~~strikethrough~~, *italic*, `code`
  const tokenRegex = /(\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|`[^`]+`)/g;
  const parts = cleaned.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-neutral-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <span key={idx} className="line-through text-neutral-400 dark:text-neutral-500 font-normal">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      return (
        <em key={idx} className="italic text-neutral-800 dark:text-neutral-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-purple-700 dark:text-purple-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Parses and renders Markdown comparison tables into clean responsive HTML tables
 */
function renderTableBlock(lines: string[], keyPrefix: string): React.ReactNode {
  const rows = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"))
    .map((l) =>
      l
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim())
    );

  if (rows.length < 2) return null;

  const headerRow = rows[0];
  // Filter out divider row (e.g. |:---|:---|)
  const bodyRows = rows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));

  return (
    <div key={keyPrefix} className="my-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-neutral-100/80 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700">
            {headerRow.map((cell, cIdx) => (
              <th key={cIdx} className="p-2 sm:p-2.5 font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                {renderInlineFormatting(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-neutral-50/50 dark:bg-neutral-900/50" : ""}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2 sm:p-2.5 text-neutral-800 dark:text-neutral-200 align-top">
                  {renderInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const ChatMessageRenderer = memo(function ChatMessageRenderer({
  text,
  isAssistant = true,
}: ChatMessageRendererProps) {
  if (!text) return null;

  // Split into raw lines
  const rawLines = text.split("\n");
  const blocks: React.ReactNode[] = [];

  let inTable = false;
  let tableLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Check if line is part of a Markdown Table (starts and ends with "|")
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      // Table ended
      blocks.push(renderTableBlock(tableLines, `table-${i}`));
      inTable = false;
      tableLines = [];
    }

    // Empty line / paragraph break
    if (!trimmed) {
      blocks.push(<div key={`spacer-${i}`} className="h-1.5" />);
      continue;
    }

    // Horizontal separator
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push(<hr key={`hr-${i}`} className="my-2.5 border-neutral-200 dark:border-neutral-800" />);
      continue;
    }

    // Headings (### or ##)
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const headingText = trimmed.replace(/^#+\s*/, "");
      blocks.push(
        <h4 key={`h-${i}`} className="font-extrabold text-[13.5px] sm:text-sm text-neutral-950 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
          {renderInlineFormatting(headingText)}
        </h4>
      );
      continue;
    }

    // Bullet points (• or - or *)
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || (trimmed.startsWith("* ") && !trimmed.startsWith("**"))) {
      const bulletContent = trimmed.replace(/^[•\-*]\s*/, "");
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-0.5 text-xs sm:text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200">
          <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0 leading-tight">•</span>
          <div className="flex-1 min-w-0">{renderInlineFormatting(bulletContent)}</div>
        </div>
      );
      continue;
    }

    // Standard text paragraph
    blocks.push(
      <div key={`p-${i}`} className="text-xs sm:text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200 my-0.5">
        {renderInlineFormatting(rawLine)}
      </div>
    );
  }

  // If table was at the end of message
  if (inTable && tableLines.length > 0) {
    blocks.push(renderTableBlock(tableLines, "table-end"));
  }

  return <div className="space-y-0.5">{blocks}</div>;
});
