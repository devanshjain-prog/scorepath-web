"use client";

import ReactMarkdown from "react-markdown";

/**
 * AiMarkdown – renders AI coach responses with ChatGPT-style formatting.
 * Supports headings, bold, lists, code blocks, and paragraph spacing.
 */
export default function AiMarkdown({ content }: { content: string }) {
  return (
    <div className="ai-prose">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="text-base font-extrabold text-slate-900 mt-4 mb-1.5 font-display">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-sm font-extrabold text-slate-800 mt-3 mb-1 font-display">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-xs font-bold text-slate-700 mt-2.5 mb-1 uppercase tracking-wide">
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="text-[13px] leading-[1.7] text-slate-700 mb-2 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-500 not-italic font-medium">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-2 pl-0 list-none">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-0 list-none counter-reset-item">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[13px] leading-[1.6] text-slate-700 flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)] shrink-0" />
              <span>{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-slate-900 text-emerald-300 text-xs p-4 rounded-xl overflow-x-auto my-3 font-mono leading-relaxed border border-slate-700">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-slate-100 text-[var(--color-primary)] px-1.5 py-0.5 rounded-md text-xs font-mono font-semibold border border-slate-200">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[var(--color-accent-violet)]/40 pl-3 my-2 text-slate-500 italic text-[13px]">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="border-t border-slate-100 my-3" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
