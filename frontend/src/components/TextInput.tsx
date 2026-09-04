import React, { useState } from 'react';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 100) {
      alert('Please enter at least 100 characters');
      return;
    }
    onTextSubmit(text);
    setText('');
  };

  const characterCount = text.length;
  const isValid = characterCount >= 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your agreement text here (minimum 100 characters)..."
          disabled={disabled}
          className={`w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
            isValid
              ? 'border-gray-300 focus:ring-blue-500'
              : 'border-orange-300 focus:ring-orange-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        <div
          className={`absolute bottom-3 right-3 text-sm ${
            isValid ? 'text-gray-500' : 'text-orange-600'
          }`}
        >
          {characterCount}/100
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || disabled}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isValid && !disabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Analyze Agreement
      </button>
    </form>
  );
};

export default TextInput;
