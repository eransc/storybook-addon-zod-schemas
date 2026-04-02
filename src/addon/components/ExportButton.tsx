import React, { useCallback } from 'react';

interface ExportButtonProps {
  content: string;
  filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ content, filename }) => {
  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [content, filename]);

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '4px 12px',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      Download
    </button>
  );
};
