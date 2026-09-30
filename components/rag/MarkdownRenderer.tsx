"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Parses inline formatting: bold, italic, inline-code, and links
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex matches:
  // 1. [text](url) -> link
  // 2. `code` -> inline code
  // 3. **bold** -> bold
  // 4. *italic* -> italic
  const pattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [label](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, label, href] = match;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00e5c0] underline hover:text-[#00c9a7] transition-colors"
          >
            {label}
          </a>
        );
      }
    }

    // Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded-md bg-[#0a1a1a] px-1.5 py-0.5 font-mono text-xs text-[#00e5c0] border border-[#1a4a4a]/70"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-[#e0faf5]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-[#7ecfc4]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Code Block with Copy Button
 */
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed
    }
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#1a4a4a] bg-[#071313] text-xs">
      <div className="flex items-center justify-between border-b border-[#1a4a4a] bg-[#0a1a1a] px-3 py-1.5 text-[#7ecfc4]">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#00c9a7]">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#7ecfc4] hover:text-[#00e5c0] transition-colors"
          type="button"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="size-3 text-[#00e5c0]" />
              <span className="text-[#00e5c0]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-[#e0faf5]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Markdown Table Renderer
 */
function TableBlock({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const headerCells = lines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

  // Skip delimiter row (line 1)
  const bodyRows = lines.slice(2).map((row) =>
    row
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
  );

  return (
    <div className="my-2.5 overflow-x-auto rounded-xl border border-[#1a4a4a] bg-[#0a1a1a]">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="border-b border-[#1a4a4a] bg-[#0d2626] text-[#00e5c0]">
          <tr>
            {headerCells.map((cell, idx) => (
              <th key={idx} className="px-3 py-2 font-semibold">
                {renderInlineFormatting(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a4a4a]/40 text-[#e0faf5]">
          {bodyRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-[#0f2d2d]/50 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2">
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

/**
 * Production Markdown Renderer
 * Parses headings, lists, tables, code blocks, bold/italics without external heavy dependencies.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block: ```language
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock
          key={`code-${i}`}
          code={codeLines.join("\n")}
          language={language}
        />
      );
      i++;
      continue;
    }

    // 2. Table: starts with | and contains |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<TableBlock key={`table-${i}`} lines={tableLines} />);
      continue;
    }

    // 3. Headings: #, ##, ###
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="mt-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#00e5c0]"
        >
          {renderInlineFormatting(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-3 mb-1.5 text-sm font-bold text-[#e0faf5] border-b border-[#1a4a4a]/50 pb-1"
        >
          {renderInlineFormatting(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mt-4 mb-2 text-base font-extrabold text-[#00e5c0]"
        >
          {renderInlineFormatting(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 4. Blockquotes: > quote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 border-l-2 border-[#00c9a7] bg-[#0a1a1a]/80 px-3 py-1.5 text-xs italic text-[#7ecfc4] rounded-r-lg"
        >
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Unordered List Items: - or *
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1 pl-1">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-2 text-xs leading-relaxed text-[#e0faf5]"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#00c9a7]" />
              <div className="grow">{renderInlineFormatting(item)}</div>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Ordered List Items: 1. 2.
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, "");
        listItems.push(itemText);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-2 text-xs leading-relaxed text-[#e0faf5]"
            >
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#00c9a7]/20 text-[10px] font-semibold text-[#00e5c0] border border-[#00c9a7]/40">
                {itemIdx + 1}
              </span>
              <div className="grow">{renderInlineFormatting(item)}</div>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Empty line spacer
    if (!line.trim()) {
      elements.push(<div key={`spacer-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 8. Regular paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs leading-relaxed text-[#e0faf5]"
      >
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1.5">{elements}</div>;
}

export default MarkdownRenderer;
