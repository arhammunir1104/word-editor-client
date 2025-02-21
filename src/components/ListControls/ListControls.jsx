import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import {
  FormatListBulleted,
  FormatListNumbered,
  FormatIndentDecrease,
  FormatIndentIncrease,
} from '@mui/icons-material';
import { useEditorHistory } from '../../context/EditorHistoryContext';

const bulletStyles = [
  { name: 'Default', value: 'disc' },
  { name: 'Circle', value: 'circle' },
  { name: 'Square', value: 'square' },
];

const numberStyles = [
  { name: 'Default (1, 2, 3)', value: 'decimal' },
  { name: 'Roman (I, II, III)', value: 'upper-roman' },
  { name: 'roman (i, ii, iii)', value: 'lower-roman' },
  { name: 'Letters (A, B, C)', value: 'upper-alpha' },
  { name: 'letters (a, b, c)', value: 'lower-alpha' },
];

const ListControls = () => {
  const { saveHistory, ActionTypes } = useEditorHistory();
  const [bulletAnchorEl, setBulletAnchorEl] = useState(null);
  const [numberAnchorEl, setNumberAnchorEl] = useState(null);

  const handleBulletStyle = (style) => {
    try {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const content = range.commonAncestorContainer;
      
      // Check if we're already in a list
      const existingList = content.closest ? content.closest('ul') : content.parentElement.closest('ul');
      
      if (existingList) {
        existingList.style.listStyleType = style;
      } else {
        document.execCommand('insertUnorderedList', false, null);
        const newList = selection.anchorNode.closest('ul');
        if (newList) {
          newList.style.listStyleType = style;
        }
      }
      
      // Save history after the DOM has been updated
      setTimeout(() => saveHistory(ActionTypes.STRUCTURE), 0);
    } catch (error) {
      console.error('Bullet style change failed:', error);
    }
    setBulletAnchorEl(null);
  };

  const handleNumberedList = (style) => {
    try {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const content = range.commonAncestorContainer;
      
      // Check if we're already in a list
      const existingList = content.closest ? content.closest('ol') : content.parentElement.closest('ol');
      
      if (existingList) {
        existingList.style.listStyleType = style;
      } else {
        document.execCommand('insertOrderedList', false, null);
        const newList = selection.anchorNode.closest('ol');
        if (newList) {
          newList.style.listStyleType = style;
        }
      }
      
      // Save history after the DOM has been updated
      setTimeout(() => saveHistory(ActionTypes.STRUCTURE), 0);
    } catch (error) {
      console.error('Numbered list style change failed:', error);
    }
    setNumberAnchorEl(null);
  };

  const handleIndent = (direction) => {
    try {
      document.execCommand(direction === 'increase' ? 'indent' : 'outdent', false, null);
      // Save history after the DOM has been updated
      setTimeout(() => saveHistory(ActionTypes.STRUCTURE), 0);
    } catch (error) {
      console.error('Indentation failed:', error);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const selection = window.getSelection();
      const listItem = selection.anchorNode?.closest('li');
      
      if (listItem) {
        // Handle Tab key for indentation
        if (e.key === 'Tab') {
          e.preventDefault();
          handleIndent(e.shiftKey ? 'decrease' : 'increase');
        }
        
        // Handle Backspace key
        if (e.key === 'Backspace') {
          const isAtStart = selection.anchorOffset === 0;
          const isTextNode = selection.anchorNode.nodeType === 3;
          const isEmpty = !listItem.textContent.trim();
          
          // Check if cursor is at the start of the list item
          if (isAtStart || (!isTextNode && isEmpty)) {
            e.preventDefault();
            
            const list = listItem.closest('ul, ol');
            const isNested = !!listItem.parentElement.closest('li');
            const currentIndent = parseInt(listItem.style.marginLeft || '0', 10);
            
            if (isNested || currentIndent > 0) {
              // If nested or indented, just outdent first
              document.execCommand('outdent', false, null);
            } else {
              // Convert list item to paragraph while preserving content and position
              const content = listItem.innerHTML;
              const newP = document.createElement('p');
              newP.innerHTML = content;
              
              // Preserve any existing styles
              const computedStyle = window.getComputedStyle(listItem);
              newP.style.marginLeft = computedStyle.marginLeft;
              newP.style.textAlign = computedStyle.textAlign;
              
              // Replace the list item with the paragraph
              if (list.children.length === 1) {
                // If it's the last item, remove the entire list
                list.parentNode.replaceChild(newP, list);
              } else {
                listItem.parentNode.replaceChild(newP, listItem);
              }
              
              // Restore cursor position
              const range = document.createRange();
              range.setStart(newP, 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
            
            // Save the history after DOM updates
            setTimeout(() => saveHistory(ActionTypes.STRUCTURE), 0);
          }
        }
        
        // Handle Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
          const isEmpty = !listItem.textContent.trim();
          
          if (isEmpty) {
            e.preventDefault();
            
            const list = listItem.closest('ul, ol');
            const isNested = !!listItem.parentElement.closest('li');
            
            if (isNested) {
              // If nested, outdent first
              document.execCommand('outdent', false, null);
            } else {
              // Convert to paragraph and exit list
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              
              if (list.children.length === 1) {
                list.parentNode.replaceChild(newP, list);
              } else {
                listItem.parentNode.removeChild(listItem);
                list.parentNode.insertBefore(newP, list.nextSibling);
              }
              
              // Set cursor in new paragraph
              const range = document.createRange();
              range.setStart(newP, 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
            
            setTimeout(() => saveHistory(ActionTypes.STRUCTURE), 0);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveHistory]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
      <Tooltip title="Bullet list styles">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={(e) => setBulletAnchorEl(e.currentTarget)}
        >
          <FormatListBulleted sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={bulletAnchorEl}
        open={Boolean(bulletAnchorEl)}
        onClose={() => setBulletAnchorEl(null)}
      >
        {bulletStyles.map((style) => (
          <MenuItem
            key={style.value}
            onClick={() => handleBulletStyle(style.value)}
            sx={{
              fontSize: '14px',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span style={{ listStyleType: style.value }}>●</span>
            {style.name}
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title="Numbered list styles">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={(e) => setNumberAnchorEl(e.currentTarget)}
        >
          <FormatListNumbered sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={numberAnchorEl}
        open={Boolean(numberAnchorEl)}
        onClose={() => setNumberAnchorEl(null)}
      >
        {numberStyles.map((style) => (
          <MenuItem
            key={style.value}
            onClick={() => handleNumberedList(style.value)}
            sx={{
              fontSize: '14px',
              minHeight: '32px',
            }}
          >
            {style.name}
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title="Decrease indent">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleIndent('decrease')}
        >
          <FormatIndentDecrease sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Increase indent">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleIndent('increase')}
        >
          <FormatIndentIncrease sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ListControls; 