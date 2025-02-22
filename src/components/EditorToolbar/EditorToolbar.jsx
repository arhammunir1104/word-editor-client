import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, IconButton, Select, MenuItem, Tooltip, Divider, Typography, FormControlLabel, Switch } from '@mui/material';
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
  Remove,
  ViewHeadline as HeaderIcon,
  ViewStream as FooterIcon,
} from '@mui/icons-material';
import {useEditor}  from '../../context/EditorContext';
import SearchReplace from '../SearchReplace/SearchReplace';
import ColorPicker from '../ColorPicker/ColorPicker';
import FontSelector from '../FontSelector/FontSelector';
import { useEditorHistory } from '../../context/EditorHistoryContext';
import ListControls from '../ListControls/ListControls';
import AlignmentControls from '../AlignmentControls/AlignmentControls';

const EditorToolbar = () => {
  const { 
    editorState, 
    toggleFormat, 
    changeFontSize, 
    changeFontFamily,
    changeFontColor,
    changeBackgroundColor 
  } = useEditor();
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [fontColorAnchorEl, setFontColorAnchorEl] = useState(null);
  const [highlightColorAnchorEl, setHighlightColorAnchorEl] = useState(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  const toolbarRef = useRef(null);
  const { undo, redo, saveHistory } = useEditorHistory();

  // MS Word standard font sizes in points (pt)
  const fontSizeOptions = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96].map(size => ({
    value: size,
    label: size.toString()
  }));

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
    changeFontColor(color);
    setFontColorAnchorEl(null);
  };

  const handleHighlightColorSelect = (color) => {
    changeBackgroundColor(color);
    setHighlightColorAnchorEl(null);
  };

  const handleFontSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    if (!isNaN(newSize)) {
      changeFontSize(newSize);
    }
  };

  const handleFontChange = (event) => {
    changeFontFamily(event.target.value);
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

  const handleHeaderClick = () => {
    // Implement header edit logic
  };

  const handleFooterClick = () => {
    // Implement footer edit logic
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Enhanced print styles to maintain exact layout
    const printStyles = `
      @page {
        size: A4;
        margin: 0;
      }
      
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      
      .print-page {
        width: 210mm;
        min-height: 297mm;
        padding: 0;
        margin: 0 auto;
        background: white;
        position: relative;
        page-break-after: always;
      }
      
      .print-page:last-child {
        page-break-after: auto;
      }
      
      .header-content {
        position: absolute;
        top: 20mm;
        left: 25mm;
        right: 25mm;
        min-height: 15mm;
      }
      
      .page-content {
        position: absolute;
        top: 35mm;
        left: 25mm;
        right: 25mm;
        min-height: 222mm; /* Adjusted to maintain content space */
        word-wrap: break-word;
        overflow: hidden;
      }
      
      .footer-content {
        position: absolute;
        bottom: 20mm;
        left: 25mm;
        right: 25mm;
        min-height: 15mm;
      }
      
      /* Preserve all styles from the editor */
      .page-content *,
      .header-content *,
      .footer-content * {
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        background-color: inherit;
        margin: inherit;
        padding: inherit;
        line-height: inherit;
        text-align: inherit;
      }

      /* Preserve specific formatting */
      strong { font-weight: bold; }
      em { font-style: italic; }
      u { text-decoration: underline; }
      
      /* Handle lists properly */
      ul, ol {
        margin: 1em 0;
        padding-left: 40px;
      }
      
      /* Preserve table formatting */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: inherit;
        padding: inherit;
      }

      @media print {
        body {
          padding: 0;
          margin: 0;
        }
        
        .print-page {
          box-shadow: none;
        }
        
        /* Force background printing */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    // Get all content areas with computed styles
    const contentPages = document.querySelectorAll('[data-content-area="true"]');
    const headerElements = document.querySelectorAll('[data-header-area="true"]');
    const footerElements = document.querySelectorAll('[data-footer-area="true"]');

    // Helper function to preserve computed styles
    const getComputedStylesHTML = (element) => {
      if (!element) return '';
      
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true);
      
      // Preserve computed styles on the element and its children
      const preserveStyles = (node) => {
        if (node.nodeType === 1) { // Element node
          const computedStyle = window.getComputedStyle(node);
          const styles = {
            'font-family': computedStyle.fontFamily,
            'font-size': computedStyle.fontSize,
            'font-weight': computedStyle.fontWeight,
            'font-style': computedStyle.fontStyle,
            'color': computedStyle.color,
            'background-color': computedStyle.backgroundColor,
            'text-align': computedStyle.textAlign,
            'text-decoration': computedStyle.textDecoration,
            'line-height': computedStyle.lineHeight,
            'padding': computedStyle.padding,
            'margin': computedStyle.margin,
            'border': computedStyle.border
          };
          
          let styleString = '';
          for (const [property, value] of Object.entries(styles)) {
            if (value && value !== 'initial') {
              styleString += `${property}:${value};`;
            }
          }
          
          if (styleString) {
            node.setAttribute('style', (node.getAttribute('style') || '') + styleString);
          }
        }
        
        Array.from(node.childNodes).forEach(preserveStyles);
      };
      
      preserveStyles(clone);
      return clone.innerHTML;
    };

    // Create HTML content for printing with preserved styles
    const printContent = Array.from(contentPages).map((page, index) => `
      <div class="print-page">
        <div class="header-content">
          ${getComputedStylesHTML(headerElements[index])}
        </div>
        <div class="page-content">
          ${getComputedStylesHTML(page)}
        </div>
        <div class="footer-content">
          ${getComputedStylesHTML(footerElements[index])}
        </div>
      </div>
    `).join('');

    // Write to the new window with preserved styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <meta charset="utf-8">
          <style>${printStyles}</style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    // Wait for content and styles to load
    printWindow.document.close();
    
    printWindow.onload = () => {
      // Small delay to ensure styles are applied
      setTimeout(() => {
        printWindow.focus();
        
        // Track both print completion and cancellation
        let printed = false;
        
        printWindow.onafterprint = () => {
          printed = true;
          printWindow.close();
        };

        // Close window if print was cancelled
        printWindow.print();
        
        // Check if print was cancelled
        setTimeout(() => {
          if (!printed) {
            printWindow.close();
          }
        }, 500);
      }, 250);
    };
  };

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
          <IconButton size="small" onClick={handlePrint}>
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
            value={editorState.fontFamily}
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
              }
            }}
          >
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
            <MenuItem value="Helvetica">Helvetica</MenuItem>
            <MenuItem value="Verdana">Verdana</MenuItem>
            <MenuItem value="Georgia">Georgia</MenuItem>
            <MenuItem value="Palatino">Palatino</MenuItem>
            <MenuItem value="Garamond">Garamond</MenuItem>
            <MenuItem value="Bookman">Bookman</MenuItem>
            <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
            <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
            <MenuItem value="Arial Black">Arial Black</MenuItem>
            <MenuItem value="Impact">Impact</MenuItem>
            <MenuItem value="Lucida Sans">Lucida Sans</MenuItem>
            <MenuItem value="Tahoma">Tahoma</MenuItem>
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
            value={editorState.fontSize}
            onChange={handleFontSizeChange}
            size="small"
            sx={{
              height: '28px',
              fontSize: '14px',
              '& .MuiSelect-select': {
                padding: '2px 8px',
                paddingRight: '24px !important',
              }
            }}
          >
            {fontSizeOptions.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <Tooltip title="Bold">
          <IconButton 
            size="small" 
            onClick={() => toggleFormat('bold')}
            color={editorState.isBold ? 'primary' : 'default'}
          >
            <FormatBold />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Italic">
          <IconButton 
            size="small" 
            onClick={() => toggleFormat('italic')}
            color={editorState.isItalic ? 'primary' : 'default'}
          >
            <FormatItalic />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Underline">
          <IconButton 
            size="small" 
            onClick={() => toggleFormat('underline')}
            color={editorState.isUnderline ? 'primary' : 'default'}
          >
            <FormatUnderlined />
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

        <Divider orientation="vertical" flexItem />
        
        <Tooltip title="Edit Header">
          <IconButton
            size="small"
            onClick={handleHeaderClick}
            color={editorState.isHeaderMode ? 'primary' : 'default'}
          >
            <HeaderIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit Footer">
          <IconButton
            size="small"
            onClick={handleFooterClick}
            color={editorState.isFooterMode ? 'primary' : 'default'}
          >
            <FooterIcon />
          </IconButton>
        </Tooltip>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={editorState.differentFirstPage}
              onChange={(e) => {
                // Implement different first page logic
              }}
            />
          }
          label="Different First Page"
          sx={{ ml: 2 }}
        />

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