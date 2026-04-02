import React, { useCallback, useState } from 'react';
import { SyntaxHighlighter } from '@storybook/components';
import { CopyButton } from './CopyButton';
import { ExportButton } from './ExportButton';

interface SchemaDisplayProps {
  code: string;
  language: 'typescript' | 'python';
  filename: string;
}

export const SchemaDisplay: React.FC<SchemaDisplayProps> = ({ code, language, filename }) => {
  return (
    <div style={{ position: 'relative', marginTop: '8px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          marginBottom: '4px',
        }}
      >
        <CopyButton text={code} />
        <ExportButton content={code} filename={filename} />
      </div>
      <SyntaxHighlighter language={language} copyable={false}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
