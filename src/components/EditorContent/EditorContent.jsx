import React, { useState, useRef, useEffect } from 'react';
import ZoomControl from '../ZoomControl/ZoomControl';

// A4 dimensions in pixels (96 DPI)
const INCH_TO_PX = 96;
const PAGE_WIDTH = 8.27 * INCH_TO_PX;  // 793.92px
const PAGE_HEIGHT = 11.69 * INCH_TO_PX; // 1122.24px

// Predefined margin presets (in pixels)
const MARGIN_PRESETS = {
  NORMAL: {
    top: INCH_TO_PX,
    bottom: INCH_TO_PX,
    left: INCH_TO_PX,
    right: INCH_TO_PX,
  },
  NARROW: {
    top: INCH_TO_PX * 0.5,
    bottom: INCH_TO_PX * 0.5,
    left: INCH_TO_PX * 0.5,
    right: INCH_TO_PX * 0.5,
  },
  MODERATE: {
    top: INCH_TO_PX,
    bottom: INCH_TO_PX,
    left: INCH_TO_PX * 0.75,
    right: INCH_TO_PX * 0.75,
  },
  WIDE: {
    top: INCH_TO_PX,
    bottom: INCH_TO_PX,
    left: INCH_TO_PX * 1.5,
    right: INCH_TO_PX * 1.5,
  },
};

const EditorContent = () => {
  const [zoom, setZoom] = useState(100);
  const [pages, setPages] = useState([1]);
  const [margins, setMargins] = useState(MARGIN_PRESETS.NORMAL);
  const [pageContents, setPageContents] = useState({1: ''});
  const [headers, setHeaders] = useState({1: ''});
  const [footers, setFooters] = useState({1: ''});
  
  const contentRefs = useRef({});
  const headerRefs = useRef({});
  const footerRefs = useRef({});
  const measureRef = useRef(null);
  
  const getZoomedSize = (size) => `${size * (zoom / 100)}px`;

  // Handle content changes and pagination
  const handleContentChange = (e, pageNumber) => {
    const currentRef = contentRefs.current[pageNumber];
    if (!currentRef) return;

    const maxHeight = (PAGE_HEIGHT - margins.top - margins.bottom) * (zoom / 100);
    
    // Debug logs
    console.log('Current page:', pageNumber);
    console.log('Max height:', maxHeight);
    console.log('Current content height:', currentRef.scrollHeight);
    console.log('Content overflowing?', currentRef.scrollHeight > maxHeight);

    // Create temp div for accurate measurement
    const temp = document.createElement('div');
    temp.style.cssText = window.getComputedStyle(currentRef).cssText;
    temp.style.width = `${currentRef.offsetWidth}px`;
    temp.style.height = 'auto';
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.wordWrap = 'break-word';
    temp.innerHTML = e.target.innerHTML;
    document.body.appendChild(temp);

    const contentHeight = temp.scrollHeight;

    if (contentHeight > maxHeight) {
      const content = e.target.innerHTML;
      const words = content.split(/(<[^>]*>|\s+)/);
      let firstPart = '';
      let currentHeight = 0;
      
      // Find split point
      for (let i = 0; i < words.length; i++) {
        temp.innerHTML = firstPart + words[i];
        currentHeight = temp.scrollHeight;
        
        if (currentHeight > maxHeight) {
          break;
        }
        firstPart += words[i];
      }

      const secondPart = content.slice(firstPart.length);
      document.body.removeChild(temp);

      // Update current page
      setPageContents(prev => ({
        ...prev,
        [pageNumber]: firstPart
      }));

      // Handle next page
      if (secondPart.trim()) {
        // Add new page
        if (!pages.includes(pageNumber + 1)) {
          setPages(prev => [...prev, pageNumber + 1]);
        }

        // Update next page content
        setTimeout(() => {
          setPageContents(prev => ({
            ...prev,
            [pageNumber + 1]: secondPart
          }));

          // Check if next page needs pagination
          const nextRef = contentRefs.current[pageNumber + 1];
          if (nextRef && nextRef.scrollHeight > maxHeight) {
            handleContentChange({ target: { innerHTML: secondPart } }, pageNumber + 1);
          }
        }, 0);
      }
    } else {
      document.body.removeChild(temp);
      setPageContents(prev => ({
        ...prev,
        [pageNumber]: e.target.innerHTML
      }));
    }
  };

  // Helper function to find last visible character
  const findLastVisibleChar = (element, maxHeight) => {
    const text = element.innerText;
    let start = 0;
    let end = text.length;
    
    while (start < end) {
      const mid = Math.floor((start + end + 1) / 2);
      element.innerText = text.substring(0, mid);
      
      if (element.scrollHeight <= maxHeight) {
        start = mid;
      } else {
        end = mid - 1;
      }
    }
    
    // Restore original content
    element.innerHTML = text;
    return start;
  };

  // Handle backspace at start of page
  const handleKeyDown = (e, pageNumber) => {
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // Check if cursor is at start of content
      if (range.startOffset === 0 && pageNumber > 1) {
        e.preventDefault();
        
        const currentContent = pageContents[pageNumber] || '';
        const prevContent = pageContents[pageNumber - 1] || '';
        
        // Merge with previous page
        setPageContents(prev => ({
          ...prev,
          [pageNumber - 1]: prevContent + currentContent,
          [pageNumber]: ''
        }));
        
        // Remove empty page
        setPages(prev => prev.filter(p => p !== pageNumber));
        
        // Focus previous page
        setTimeout(() => {
          const prevPage = contentRefs.current[pageNumber - 1];
          if (prevPage) {
            prevPage.focus();
            const range = document.createRange();
            range.setStart(prevPage, prevContent.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }, 0);
      }
    }
  };

  // Handle header/footer changes
  const handleHeaderChange = (e, pageNumber) => {
    const newContent = e.target.textContent;
    setHeaders(prev => ({
      ...prev,
      [pageNumber]: newContent
    }));
  };

  const handleFooterChange = (e, pageNumber) => {
    const newContent = e.target.textContent;
    setFooters(prev => ({
      ...prev,
      [pageNumber]: newContent
    }));
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5] p-8">
      <div className="flex flex-col items-center gap-10">
        {pages.map(pageNumber => (
          <div
            key={pageNumber}
            data-page={pageNumber}
            className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded-sm transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            style={{
              width: getZoomedSize(PAGE_WIDTH),
              height: getZoomedSize(PAGE_HEIGHT),
              position: 'relative',
              backgroundColor: 'white',
              margin: '10px',
            }}
          >
            {/* Header Area */}
            <div
              ref={el => headerRefs.current[pageNumber] = el}
              contentEditable
              suppressContentEditableWarning
              className="absolute outline-none px-2"
              style={{
                top: getZoomedSize(margins.top * 0.25),
                left: getZoomedSize(margins.left),
                right: getZoomedSize(margins.right),
                height: getZoomedSize(margins.top * 0.5),
                minHeight: '1em',
                backgroundColor: 'white',
                zIndex: 2,
                direction: 'ltr',
                unicodeBidi: 'embed',
                textAlign: 'left',
                writingMode: 'horizontal-tb'
              }}
              onInput={(e) => handleHeaderChange(e, pageNumber)}
            >
              {headers[pageNumber]}
            </div>

            {/* Content Area */}
            <div
              ref={el => contentRefs.current[pageNumber] = el}
              contentEditable
              suppressContentEditableWarning
              className="absolute outline-none px-2"
              data-content-area="true"
              // data-page={pageNumber}
              style={{
                top: getZoomedSize(margins.top * 0.75),
                left: getZoomedSize(margins.left),
                right: getZoomedSize(margins.right),
                bottom: getZoomedSize(margins.bottom * 0.75),
                overflowY: 'hidden',
                wordWrap: 'break-word',
                backgroundColor: 'white',
                zIndex: 1,
                direction: 'ltr',
                unicodeBidi: 'embed',
                textAlign: 'left',
                writingMode: 'horizontal-tb'
              }}
              onInput={(e) => handleContentChange(e, pageNumber)}
              onKeyDown={(e) => handleKeyDown(e, pageNumber)}
            >
              {console.log(pageContents)}
              {pageContents[pageNumber]}
            </div>

            {/* Footer Area */}
            <div
              ref={el => footerRefs.current[pageNumber] = el}
              contentEditable
              suppressContentEditableWarning
              className="absolute outline-none px-2"
              style={{
                bottom: getZoomedSize(margins.bottom * 0.25),
                left: getZoomedSize(margins.left),
                right: getZoomedSize(margins.right),
                height: getZoomedSize(margins.bottom * 0.5),
                minHeight: '1em',
                backgroundColor: 'white',
                zIndex: 2,
                direction: 'ltr',
                unicodeBidi: 'embed',
                textAlign: 'left',
                writingMode: 'horizontal-tb'
              }}
              onInput={(e) => handleFooterChange(e, pageNumber)}
            >
              <div className="flex justify-between items-center h-full">
                <div>{footers[pageNumber]}</div>
                <div className="text-gray-500 text-sm">
                  Page {pageNumber} of {pages.length}
                </div>
              </div>
            </div>

            {/* Margin Guidelines */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute border border-dashed border-gray-200"
                style={{
                  top: getZoomedSize(margins.top),
                  left: getZoomedSize(margins.left),
                  right: getZoomedSize(margins.right),
                  bottom: getZoomedSize(margins.bottom),
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <ZoomControl zoom={zoom} onZoomChange={setZoom} />
    </div>
  );
};

export default EditorContent; 

