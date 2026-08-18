import { useState } from 'react';

interface CssCodeBlockProps {
  readonly label: string;
  readonly code: string;
}

export function CssCodeBlock({ label, code }: CssCodeBlockProps) {
  const [feedback, setFeedback] = useState('');

  const copy = async () => {
    try {
      if (!('clipboard' in navigator)) throw new Error('Unavailable');
      await navigator.clipboard.writeText(code);
      setFeedback('Copied');
    } catch {
      setFeedback('Could not copy automatically. Select the code manually.');
    }
  };

  return (
    <div className="css-code-block">
      <div>
        <span>{label}</span>
        <button
          type="button"
          onClick={() => {
            void copy();
          }}
        >
          Copy {label} CSS
        </button>
      </div>
      <pre aria-label={`Generated ${label} CSS`}>
        <code>{code}</code>
      </pre>
      <p aria-live="polite">{feedback}</p>
    </div>
  );
}
