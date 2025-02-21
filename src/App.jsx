import React from 'react';
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home/Home';
import Editor from './pages/Editor/Editor';
import { EditorProvider } from './context/EditorContext';
import { EditorHistoryProvider } from './context/EditorHistoryContext';

const App = () => {
  return (
    <EditorHistoryProvider>
    <EditorProvider>
      <Routes>
        {/* <Switch> */}
          <Route exact path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
        {/* </Switch> */}
      </Routes>
    </EditorProvider>
    </EditorHistoryProvider>
  );
};

export default App;
