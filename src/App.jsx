import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
function App() {
  return (
    <BrowserRouter>
      <div className='App'>
        <Routes>
          {/* Define routes */}
          <Route path="/" element={<HomePage/>} />
          <Route path="/chat" element={<ChatPage/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
