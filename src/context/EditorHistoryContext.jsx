import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const EditorHistoryContext = createContext();

// Time window for batching changes (in milliseconds)
const BATCH_WINDOW = 1000;

// Action types for better tracking
export const ActionTypes = {
  TEXT: 'TEXT',
  FORMAT: 'FORMAT',
  STRUCTURE: 'STRUCTURE',
  PASTE: 'PASTE',
  DELETE: 'DELETE',
};

export const EditorHistoryProvider = ({ children }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lastActionTime, setLastActionTime] = useState(null);
  const [lastActionType, setLastActionType] = useState(null);
  const [lastAreaType, setLastAreaType] = useState(null);

  const captureState = useCallback(() => {
    const editor = document.querySelector('[data-content-area="true"]');
    const header = document.querySelector('[data-header-area="true"]');
    const footer = document.querySelector('[data-footer-area="true"]');

    const selection = window.getSelection();
    let selectionState = null;

    // Only capture selection if it exists and is within the editor
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        selectionState = {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startContainer: range.startContainer.textContent,
          endContainer: range.endContainer.textContent
        };
      }
    }

    return {
      content: editor?.innerHTML || '',
      header: header?.innerHTML || '',
      footer: footer?.innerHTML || '',
      activeArea: document.activeElement?.getAttribute('data-area-type') || 'content',
      selection: selectionState
    };
  }, []);

  const restoreState = useCallback((state) => {
    if (!state) return;

    // Restore content for each area
    const areas = {
      content: document.querySelector('[data-content-area="true"]'),
      header: document.querySelector('[data-header-area="true"]'),
      footer: document.querySelector('[data-footer-area="true"]')
    };

    Object.entries(areas).forEach(([type, element]) => {
      if (element && state[type]) {
        element.innerHTML = state[type];
      }
    });

    // Restore focus to active area
    if (state.activeArea) {
      areas[state.activeArea]?.focus();
    }

    // Restore selection if available
    if (state.selection) {
      restoreSelection(state.selection);
    }
  }, []);

  const saveHistory = useCallback((actionType = ActionTypes.TEXT, areaType = 'content') => {
    const currentState = captureState();
    if (!currentState) return;

    const now = Date.now();
    const shouldBatch = 
      actionType === lastActionType &&
      areaType === lastAreaType &&
      actionType === ActionTypes.TEXT &&
      lastActionTime &&
      now - lastActionTime < BATCH_WINDOW;

    setUndoStack(prev => {
      if (shouldBatch) {
        return [...prev.slice(0, -1), currentState];
      }
      return [...prev, currentState];
    });

    // Clear redo stack when new action is performed
    if (!shouldBatch) {
      setRedoStack([]);
    }

    setLastActionTime(now);
    setLastActionType(actionType);
    setLastAreaType(areaType);
  }, [captureState, lastActionTime, lastActionType, lastAreaType]);

  const undo = useCallback(() => {
    if (undoStack.length < 2) return; // Need at least 2 states to undo

    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);
    restoreState(previousState);
  }, [undoStack, restoreState]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const stateToRestore = redoStack[redoStack.length - 1];
    const currentState = captureState();

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, stateToRestore]);
    restoreState(stateToRestore);
  }, [redoStack, captureState, restoreState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts if inside an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Initialize with empty state
  useEffect(() => {
    // Wait for the editor to be mounted
    setTimeout(() => {
      const initialState = captureState();
      if (initialState) {
        setUndoStack([initialState]);
      }
    }, 0);
  }, [captureState]);

  // Debug logging
  useEffect(() => {
    console.log('Undo stack size:', undoStack.length);
    console.log('Redo stack size:', redoStack.length);
  }, [undoStack, redoStack]);

  const value = {
    saveHistory,
    undo,
    redo,
    ActionTypes,
  };

  return (
    <EditorHistoryContext.Provider value={value}>
      {children}
    </EditorHistoryContext.Provider>
  );
};

export const useEditorHistory = () => {
  const context = useContext(EditorHistoryContext);
  if (!context) {
    throw new Error('useEditorHistory must be used within an EditorHistoryProvider');
  }
  return context;
};

export default EditorHistoryContext; 