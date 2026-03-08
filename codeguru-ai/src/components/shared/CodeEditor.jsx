import { useState } from 'react';
import { Editor } from '@monaco-editor/react';

const CodeEditor = ({
  value,
  code,
  onChange,
  language = 'python',
  onLanguageChange,
  readOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const editorValue = value ?? code ?? '';

  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleEditorMount = () => {
    setIsLoading(false);
  };

  // Map language codes to Monaco editor language identifiers
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'c': 'c'
    };
    return languageMap[lang] || 'python';
  };

  // Language display names
  const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  return (
    <div className="w-full">
      {/* Language Selector */}
      <div className="bg-gray-800 border border-gray-700 rounded-t-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-gray-300 text-sm font-medium">
            Language:
          </label>
          <select 
            value={language}
            onChange={handleLanguageChange}
            disabled={readOnly}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-600"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {isLoading && (
          <span className="text-gray-400 text-sm animate-pulse">
            Loading editor...
          </span>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="border border-t-0 border-gray-700 rounded-b-lg overflow-hidden shadow-xl">
        {isLoading && (
          <div className="flex items-center justify-center h-[500px] bg-gray-900">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="text-gray-400">Loading Monaco Editor...</p>
            </div>
          </div>
        )}
        
        <Editor
          height="500px"
          language={getMonacoLanguage(language)}
          value={editorValue}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top',
            parameterHints: {
              enabled: true
            },
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            renderLineHighlight: 'all',
            bracketPairColorization: {
              enabled: true
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
