import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [editorState, setEditorState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false
  });

  const toggleFormat = (format) => {
    document.execCommand(format, false, null);
    setEditorState(prev => ({
      ...prev,
      [`is${format.charAt(0).toUpperCase() + format.slice(1)}`]: !prev[`is${format.charAt(0).toUpperCase() + format.slice(1)}`]
    }));
  };

  const value = {
    editorState,
    toggleFormat
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === null) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}; 