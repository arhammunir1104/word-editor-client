import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import ZoomControl from '../ZoomControl/ZoomControl';
import { useEditor } from '../../context/EditorContext';

const PAGE_HEIGHT = 1056; // Standard A4 height in pixels
const PAGE_WIDTH = 816;  // Standard A4 width in pixels
const PAGE_MARGIN = 16;  // Margin between pages

const EditorContent = () => {
  const [zoom, setZoom] = useState(100);
  const [pages, setPages] = useState([1]);
  const contentRef = useRef(null);
  const { editorState } = useEditor();

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // Monitor content height and add new pages as needed
  useEffect(() => {
    const checkContentHeight = () => {
      if (!contentRef.current) return;
      
      const contentHeight = contentRef.current.scrollHeight;
      const scaledPageHeight = PAGE_HEIGHT * (zoom / 100);
      const numberOfPages = Math.max(
        Math.ceil(contentHeight / scaledPageHeight),
        1
      );

      if (numberOfPages !== pages.length) {
        setPages(Array.from({ length: numberOfPages }, (_, i) => i + 1));
      }
    };

    const observer = new ResizeObserver(checkContentHeight);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, [zoom, pages.length]);

  // Add selection change listener to update toolbar state
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const parentElement = range.commonAncestorContainer.parentElement;

      // Update format states based on current selection
      document.queryCommandState('bold');
      document.queryCommandState('italic');
      document.queryCommandState('underline');
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      padding: '40px 0',
      overflow: 'auto'
    }}>
      {pages.map((pageNumber) => (
        <Box
          key={pageNumber}
          sx={{
            width: `${PAGE_WIDTH * (zoom / 100)}px`,
            height: `${PAGE_HEIGHT * (zoom / 100)}px`,
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            marginBottom: `${PAGE_MARGIN}px`,
            position: 'relative',
            '&:last-child': {
              marginBottom: 0
            }
          }}
        >
          <Box
            ref={pageNumber === 1 ? contentRef : null}
            contentEditable
            suppressContentEditableWarning
            sx={{
              position: 'absolute',
              top: '96px',
              left: '96px',
              right: '96px',
              bottom: '96px',
              outline: 'none',
              fontSize: `${16 * (zoom / 100)}px`,
              lineHeight: 1.5,
              wordWrap: 'break-word',
              '&:focus': {
                outline: 'none'
              }
            }}
          >
            {pageNumber === 1 && (
              <div></div>
            )}
          </Box>
        </Box>
      ))}
      <ZoomControl zoom={zoom} onZoomChange={handleZoomChange} />
    </Box>
  );
};

export default EditorContent; 