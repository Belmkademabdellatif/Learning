'use client';

import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface MonacoEditorProps {
  initialCode: string;
  language: string;
  onRun: (code: string) => void;
  isRunning?: boolean;
}

export function MonacoEditor({ initialCode, language, onRun, isRunning }: MonacoEditorProps) {
  const [code, setCode] = useState(initialCode);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
        <span className="text-sm font-medium text-gray-700">{language.toUpperCase()}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCode(initialCode)}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => onRun(code)}
            disabled={isRunning}
            className="px-4 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
