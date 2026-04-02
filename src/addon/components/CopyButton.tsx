import React, { useCallback, useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '4px 12px',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: copied ? '#e6ffe6' : '#fff',
        cursor: 'pointer',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};
