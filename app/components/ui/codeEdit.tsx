import React, { useState } from "react";

interface CodeEditBlockProps {
  codeEdit: {
    original: string;
    modified: string;
    explanation: string;
  };
  onApply?: (code: string) => void;
  messageIndex: number;
}

const CodeEditBlock: React.FC<CodeEditBlockProps> = ({
  codeEdit,
  onApply,
  messageIndex,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
      <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-xs font-semibold">Suggested Code Change</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(codeEdit.modified)}
            className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-1 transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          {onApply && (
            <button
              onClick={() => onApply(codeEdit.modified)}
              className="text-xs px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold transition-colors"
            >
              Apply Change
            </button>
          )}
        </div>
      </div>
      {codeEdit.explanation && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
          <p className="text-xs text-slate-700">{codeEdit.explanation}</p>
        </div>
      )}
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div>
          <div className="bg-red-50 px-3 py-1 border-b border-red-200">
            <span className="text-[10px] font-bold text-red-700 uppercase">
              Original
            </span>
          </div>
          <pre className="p-3 text-xs overflow-x-auto bg-white">
            <code className="text-red-600">{codeEdit.original}</code>
          </pre>
        </div>
        <div>
          <div className="bg-green-50 px-3 py-1 border-b border-green-200">
            <span className="text-[10px] font-bold text-green-700 uppercase">
              Modified
            </span>
          </div>
          <pre className="p-3 text-xs overflow-x-auto bg-white">
            <code className="text-green-600">{codeEdit.modified}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditBlock;
