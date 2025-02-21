import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Popover, 
  TextField, 
  Button,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Search, ArrowUpward, ArrowDownward, Close } from '@mui/icons-material';

const SearchReplace = ({ onClose, anchorEl }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(-1);

  // Clear highlights when component unmounts or search text changes
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, []);

  const clearHighlights = () => {
    const content = document.querySelector('[contenteditable="true"]');
    if (!content) return;

    const highlights = Array.from(content.getElementsByClassName('search-highlight'));
    highlights.forEach(highlight => {
      const text = highlight.textContent;
      const textNode = document.createTextNode(text);
      highlight.parentNode.replaceChild(textNode, highlight);
    });
  };

  const handleSearch = () => {
    if (!searchText) return;
    
    clearHighlights();
    const content = document.querySelector('[contenteditable="true"]');
    if (!content) return;

    const text = content.textContent;
    const searchRegex = new RegExp(searchText, 'gi');
    const newMatches = [];
    let match;

    // Find all matches
    while ((match = searchRegex.exec(text)) !== null) {
      newMatches.push(match.index);
    }

    // Highlight matches
    if (newMatches.length > 0) {
      let lastIndex = 0;
      let result = '';
      
      newMatches.forEach((matchIndex, i) => {
        const beforeMatch = text.substring(lastIndex, matchIndex);
        const matchText = text.substr(matchIndex, searchText.length);
        
        result += beforeMatch;
        result += `<span class="search-highlight" style="background-color: #ffeb3b">${matchText}</span>`;
        
        lastIndex = matchIndex + searchText.length;
      });
      
      result += text.substring(lastIndex);
      content.innerHTML = result;
      setCurrentMatch(0);
    }

    setMatches(newMatches);
  };

  const navigateMatch = (direction) => {
    if (matches.length === 0) return;

    const newMatch = direction === 'next'
      ? (currentMatch + 1) % matches.length
      : (currentMatch - 1 + matches.length) % matches.length;

    setCurrentMatch(newMatch);

    // Scroll to the current match
    const highlights = document.getElementsByClassName('search-highlight');
    if (highlights[newMatch]) {
      highlights[newMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReplace = () => {
    if (matches.length === 0 || currentMatch === -1) return;

    const content = document.querySelector('[contenteditable="true"]');
    if (!content) return;

    // Store the entire content for undo
    const originalContent = content.innerHTML;
    
    try {
      // Get all highlights
      const highlights = Array.from(content.getElementsByClassName('search-highlight'));
      if (!highlights[currentMatch]) return;

      // Focus the editor
      content.focus();

      // Select the text to be replaced
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(highlights[currentMatch]);
      selection.removeAllRanges();
      selection.addRange(range);

      // Perform the replacement
      document.execCommand('insertText', false, replaceText);

      // Update matches and current match
      const newMatches = [...matches];
      newMatches.splice(currentMatch, 1);
      
      // Clear all existing highlights
      clearHighlights();

      // Re-highlight remaining matches
      const text = content.textContent;
      const searchRegex = new RegExp(searchText, 'gi');
      const updatedMatches = [];
      let match;

      while ((match = searchRegex.exec(text)) !== null) {
        updatedMatches.push(match.index);
      }

      setMatches(updatedMatches);
      
      if (updatedMatches.length > 0) {
        // Move to next match if available, otherwise stay at current position
        const nextMatch = Math.min(currentMatch, updatedMatches.length - 1);
        setCurrentMatch(nextMatch);
        
        // Re-highlight all matches
        let lastIndex = 0;
        let result = '';
        
        updatedMatches.forEach((matchIndex, i) => {
          const beforeMatch = text.substring(lastIndex, matchIndex);
          const matchText = text.substr(matchIndex, searchText.length);
          
          result += beforeMatch;
          result += `<span class="search-highlight" style="background-color: #ffeb3b">${matchText}</span>`;
          
          lastIndex = matchIndex + searchText.length;
        });
        
        result += text.substring(lastIndex);
        
        // Create an undo point
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
        
        document.execCommand('insertHTML', false, result);
      } else {
        setCurrentMatch(-1);
      }
    } catch (error) {
      console.error('Replace error:', error);
      // Restore original content if something goes wrong
      content.innerHTML = originalContent;
    }
  };

  const handleReplaceAll = () => {
    const content = document.querySelector('[contenteditable="true"]');
    if (!content || !searchText) return;

    try {
      // Store original state
      const originalContent = content.innerHTML;

      // Focus the editor
      content.focus();

      // Select all content
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(content);
      selection.removeAllRanges();
      selection.addRange(range);

      // Get the text content
      const text = content.textContent;
      
      // Create undo point
      document.execCommand('insertText', false, text);

      // Perform replacement
      const newContent = text.replace(new RegExp(searchText, 'g'), replaceText);
      
      // Apply the change
      document.execCommand('insertText', false, newContent);

      // Clear search state
      clearHighlights();
      setMatches([]);
      setCurrentMatch(-1);
    } catch (error) {
      console.error('Replace all error:', error);
      // Restore original content if something goes wrong
      content.innerHTML = originalContent;
    }
  };

  const trackContentChange = () => {
    // Implementation of trackContentChange function
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Paper sx={{ width: 300 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Search" />
          <Tab label="Replace" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSearch}
                disabled={!searchText}
              >
                Search
              </Button>
              <Typography variant="caption">
                {matches.length > 0 ? `${currentMatch + 1} of ${matches.length}` : 'No matches'}
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <IconButton
                  size="small"
                  onClick={() => navigateMatch('prev')}
                  disabled={matches.length === 0}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => navigateMatch('next')}
                  disabled={matches.length === 0}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                size="small"
                placeholder="Replace with"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                fullWidth
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleReplace}
                  disabled={matches.length === 0}
                >
                  Replace
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleReplaceAll}
                  disabled={!searchText}
                >
                  Replace All
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Popover>
  );
};

export default SearchReplace; 