import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from '@mui/icons-material';
import { useEditorHistory } from '../../context/EditorHistoryContext';

const AlignmentControls = () => {
  const { saveHistory, ActionTypes } = useEditorHistory();

  const handleAlignment = (alignment) => {
    try {
      document.execCommand(`justify${alignment}`, false, null);
      saveHistory(ActionTypes.FORMAT);
    } catch (error) {
      console.error('Alignment change failed:', error);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            handleAlignment('Left');
            break;
          case 'e':
            e.preventDefault();
            handleAlignment('Center');
            break;
          case 'r':
            e.preventDefault();
            handleAlignment('Right');
            break;
          case 'j':
            e.preventDefault();
            handleAlignment('Full');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
      <Tooltip title="Align Left (Ctrl+L)">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleAlignment('Left')}
        >
          <FormatAlignLeft sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Center (Ctrl+E)">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleAlignment('Center')}
        >
          <FormatAlignCenter sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Right (Ctrl+R)">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleAlignment('Right')}
        >
          <FormatAlignRight sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Justify (Ctrl+J)">
        <IconButton
          size="small"
          sx={{ padding: '4px' }}
          onClick={() => handleAlignment('Full')}
        >
          <FormatAlignJustify sx={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default AlignmentControls; 