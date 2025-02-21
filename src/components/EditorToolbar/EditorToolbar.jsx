import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, IconButton, Select, MenuItem, Tooltip, Divider, Typography } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatListBulleted,
  FormatListNumbered,
  FormatIndentDecrease,
  FormatIndentIncrease,
  Link,
  Add,
  Image,
  Search,
  Undo,
  Redo,
  Print,
  ChevronLeft,
  ChevronRight,
  SpellcheckOutlined,
  FormatColorText,
  FormatColorFill,
  Remove
} from '@mui/icons-material';
import {useEditor}  from '../../context/EditorContext';
import SearchReplace from '../SearchReplace/SearchReplace';
import ColorPicker from '../ColorPicker/ColorPicker';
import FontSelector from '../FontSelector/FontSelector';
import { useEditorHistory } from '../../context/EditorHistoryContext';
import ListControls from '../ListControls/ListControls';
import AlignmentControls from '../AlignmentControls/AlignmentControls';

const EditorToolbar = () => {
  const { editorState, toggleFormat } = useEditor();
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [fontColorAnchorEl, setFontColorAnchorEl] = useState(null);
  const [highlightColorAnchorEl, setHighlightColorAnchorEl] = useState(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(11);
  const [recentColors, setRecentColors] = useState([]);
  const toolbarRef = useRef(null);
  const { undo, redo, saveHistory } = useEditorHistory();

  const fontSizeOptions = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96];

  useEffect(() => {
    const checkScrollable = () => {
      if (toolbarRef.current) {
        const { scrollWidth, clientWidth } = toolbarRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  const handleSearchClick = (event) => {
    setSearchAnchorEl(event.currentTarget);
  };

  const handleScroll = (direction) => {
    if (toolbarRef.current) {
      const scrollAmount = 200;
      toolbarRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handleFontColorSelect = (color) => {
    document.execCommand('foreColor', false, color);
    setRecentColors(prev => [color, ...prev.slice(0, 9)]);
  };

  const handleHighlightColorSelect = (color) => {
    document.execCommand('hiliteColor', false, color);
    setRecentColors(prev => [color, ...prev.slice(0, 9)]);
  };

  const handleFontChange = (event) => {
    setSelectedFont(event.target.value);
    document.execCommand('fontName', false, event.target.value);
  };

  const handleFontSizeChange = (increment) => {
    const newSize = Math.min(Math.max(8, fontSize + increment), 96);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const content = document.querySelector('[contenteditable="true"]');
      if (content) {
        // Save current state before changes
        const currentContent = content.innerHTML;
        
        try {
          // Set font size
          setFontSize(newSize);
          document.execCommand('fontSize', false, '7');
          
          // Convert size to pixels
          const fontElements = document.getElementsByTagName('font');
          Array.from(fontElements).forEach(element => {
            if (element.hasAttribute('size')) {
              element.removeAttribute('size');
              element.style.fontSize = `${newSize}px`;
            }
          });
          
          // Save to history
          saveHistory(currentContent);
        } catch (error) {
          console.error('Font size change failed:', error);
        }
      }
    }
  };

  const handleUndo = (e) => {
    e.preventDefault();
    const content = document.querySelector('[contenteditable="true"]');
    if (content) {
      try {
        const currentContent = content.innerHTML;
        undo();
        saveHistory(currentContent);
      } catch (error) {
        console.error('Undo failed:', error);
      }
    }
  };

  const handleRedo = (e) => {
    e.preventDefault();
    const content = document.querySelector('[contenteditable="true"]');
    if (content) {
      try {
        const currentContent = content.innerHTML;
        redo();
        saveHistory(currentContent);
      } catch (error) {
        console.error('Redo failed:', error);
      }
    }
  };

  const trackContentChange = () => {
    const content = document.querySelector('[contenteditable="true"]');
    if (content) {
      setTimeout(() => {
        saveHistory(content.innerHTML);
      }, 0);
    }
  };

  useEffect(() => {
    const content = document.querySelector('[contenteditable="true"]');
    if (content) {
      const observer = new MutationObserver(() => {
        trackContentChange();
      });

      observer.observe(content, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 1000,
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Left Arrow */}
      {isScrollable && (
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'sticky',
            left: 0,
            zIndex: 1,
            backgroundColor: 'white',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
          }}
        >
          <ChevronLeft />
        </IconButton>
      )}

      {/* Scrollable Toolbar Content */}
      <Box
        ref={toolbarRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '4px 8px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '10px',
            '&:hover': {
              background: '#a8a8a8'
            }
          },
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1'
        }}
      >
        {/* Search Button */}
        <Tooltip title="Search" enterDelay={300}>
          <IconButton size="small" onClick={handleSearchClick}>
            <Search sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)">
          <IconButton
            size="small"
            sx={{ padding: '4px' }}
            onClick={undo}
          >
            <Undo sx={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <IconButton
            size="small"
            sx={{ padding: '4px' }}
            onClick={redo}
          >
            <Redo sx={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Print */}
        <Tooltip title="Print" enterDelay={300}>
          <IconButton size="small" onClick={() => window.print()}>
            <Print sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Font Selector */}
        <Box sx={{ 
          width: '140px', 
          flexShrink: 0,
          flexGrow: 0,
        }}> 
          <Select
            value={selectedFont}
            onChange={handleFontChange}
            size="small"
            sx={{
              width: '130px !important',
              height: '28px',
              fontSize: '14px',
              '& .MuiSelect-select': {
                padding: '2px 8px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: '130px !important',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                width: '120px !important'
              },
              '& .MuiSelect-icon': {
                right: '2px'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: { width: '140px !important' }
              }
            }}
          >
            <MenuItem sx={{fontSize : "13px"}} value="Arial">Arial</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Courier New">Courier New</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Helvetica">Helvetica</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Verdana">Verdana</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Georgia">Georgia</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Palatino">Palatino</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Garamond">Garamond</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Bookman">Bookman</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Comic Sans MS">Comic Sans MS</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Trebuchet MS">Trebuchet MS</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Arial Black">Arial Black</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Impact">Impact</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Lucida Sans">Lucida Sans</MenuItem>
            <MenuItem sx={{fontSize : "13px"}} value="Tahoma">Tahoma</MenuItem>
          </Select>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Font Size */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          marginLeft: '8px',
          width: '65px'
        }}>
          <Select
            value={fontSize}
            onChange={(event) => {
              const newSize = event.target.value;
              setFontSize(newSize);
              
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const content = document.querySelector('[contenteditable="true"]');
                if (content) {
                  const currentContent = content.innerHTML;
                  
                  try {
                    document.execCommand('fontSize', false, '7');
                    const fontElements = document.getElementsByTagName('font');
                    Array.from(fontElements).forEach(element => {
                      if (element.hasAttribute('size')) {
                        element.removeAttribute('size');
                        element.style.fontSize = `${newSize}px`;
                      }
                    });
                    
                    saveHistory(currentContent);
                  } catch (error) {
                    console.error('Font size change failed:', error);
                  }
                }
              }
            }}
            size="small"
            sx={{
              height: '28px',
              fontSize: '14px',
              '& .MuiSelect-select': {
                padding: '2px 8px',
                paddingRight: '24px !important',
              },
              '& .MuiSelect-icon': {
                right: '2px'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: { 
                  maxHeight: '300px',
                  '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    minHeight: '24px',
                    padding: '4px 8px'
                  }
                }
              }
            }}
          >
            {fontSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <Tooltip title="Bold" enterDelay={300}>
          <IconButton size="small" onClick={() => toggleFormat('bold')}>
            <FormatBold sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic" enterDelay={300}>
          <IconButton size="small" onClick={() => toggleFormat('italic')}>
            <FormatItalic sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline" enterDelay={300}>
          <IconButton size="small" onClick={() => toggleFormat('underline')}>
            <FormatUnderlined sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Color Pickers */}
        <Tooltip title="Text color" enterDelay={300}>
          <IconButton size="small" onClick={(e) => setFontColorAnchorEl(e.currentTarget)}>
            <FormatColorText sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Highlight color" enterDelay={300}>
          <IconButton size="small" onClick={(e) => setHighlightColorAnchorEl(e.currentTarget)}>
            <FormatColorFill sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />
        <AlignmentControls />
        <Divider orientation="vertical" flexItem />
        <ListControls />

        

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '1px',
          padding: '0 4px',
          borderLeft: '1px solid #e0e0e0',
          marginLeft: '4px'
        }}>
          <IconButton size="small" sx={{ padding: '4px' }}>
            <Link sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton size="small" sx={{ padding: '4px' }}>
            <Add sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton size="small" sx={{ padding: '4px' }}>
            <Image sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Right Arrow */}
      {isScrollable && (
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'sticky',
            right: 0,
            zIndex: 1,
            backgroundColor: 'white',
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)'
          }}
        >
          <ChevronRight />
        </IconButton>
      )}

      {/* Search/Replace Popover */}
      <SearchReplace
        anchorEl={searchAnchorEl}
        onClose={() => setSearchAnchorEl(null)}
      />
      <ColorPicker
        anchorEl={fontColorAnchorEl}
        onClose={() => setFontColorAnchorEl(null)}
        onColorSelect={handleFontColorSelect}
        recentColors={recentColors}
        type="text"
      />
      <ColorPicker
        anchorEl={highlightColorAnchorEl}
        onClose={() => setHighlightColorAnchorEl(null)}
        onColorSelect={handleHighlightColorSelect}
        recentColors={recentColors}
        type="highlight"
      />
    </Box>
  );
};

export default EditorToolbar; 