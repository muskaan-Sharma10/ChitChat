import React from 'react';
import Chat from './Chat.jsx';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4 py-8">
      <div className="w-full max-w-lg max-h-[90vh]">
        <Chat />
      </div>
    </div>
  );
}

export default App;
