"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
  className?: string;
};

export function ContentRenderer({ content, className = "" }: Props) {
  if (!content.trim()) return null;

  return (
    <div className={`whitespace-pre-wrap break-words [&_p]:mb-2 [&_p:last-child]:mb-0 ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          img: ({ src, alt }) => (
            <span className="my-2 block">
              <img
                src={src}
                alt={alt || "이미지"}
                className="max-h-96 max-w-full rounded-lg object-contain"
              />
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
