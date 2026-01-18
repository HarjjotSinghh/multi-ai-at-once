'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0 font-mono text-sm leading-relaxed text-cyber-text/90">{children}</p>,
          h1: ({ children }) => (
            <h1 className="text-2xl font-display font-bold text-neon-blue mb-4 border-b border-neon-blue/30 pb-2 uppercase tracking-widest">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-display font-bold text-neon-blue mb-3 uppercase tracking-wider">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-display font-bold text-neon-blue/80 mb-2 uppercase tracking-wide">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 font-mono text-sm text-cyber-text marker:text-neon-green">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 font-mono text-sm text-cyber-text marker:text-neon-blue">{children}</ol>
          ),
          li: ({ children }) => <li className="text-cyber-text pl-1">{children}</li>,
          code: ({ className, children }: any) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-cyber-black px-1.5 py-0.5 rounded-none text-xs font-mono text-neon-pink border border-neon-pink/30">
                {children}
              </code>
            ) : (
              <code className="block bg-cyber-black p-4 rounded-none text-xs font-mono overflow-x-auto mb-4 border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] text-neon-green">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="mb-4">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-neon-yellow pl-4 py-2 italic text-sm text-neon-yellow/80 bg-neon-yellow/5 pr-4 my-4 font-mono">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-neon-green hover:text-white underline decoration-neon-green decoration-1 underline-offset-4 transition-colors font-bold"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
