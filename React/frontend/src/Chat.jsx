import React, { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

const PlaneIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path fill="currentColor" d="M2 21l21-9-21-9v7l15 2-15 2v7z"/>
  </svg>
);

const CompressIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2" fill="#d1fae5"/>
    <path d="M7 10l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatsIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="3" y="13" width="4" height="8" rx="2" fill="#3b82f6"/>
    <rect x="10" y="9" width="4" height="12" rx="2" fill="#22c55e"/>
    <rect x="17" y="5" width="4" height="16" rx="2" fill="#60a5fa"/>
  </svg>
);

const InfoIcon = ()=>(
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" fill="#dbeafe"/>
    <path d="M12 16v-4m0-4h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send_message', { message });
    setChat(prev => [
      ...prev,
      { original: message, compressed: '', self: true, anim: true }
    ]);
    setMessage('');
  };

  useEffect(() => {
    socket.on('receive_message', data => {
      setChat(prev => {
        if (
          prev.length &&
          prev[prev.length - 1].self &&
          prev[prev.length - 1].original === data.original &&
          !prev[prev.length - 1].compressed
        ) {
          return [
            ...prev.slice(0, -1),
            { ...prev[prev.length - 1], compressed: data.compressed, anim: true }
          ];
        }
        return [...prev, { ...data, self: false, anim: true }];
      });
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const stats = (() => {
    let orig = 0, comp = 0;
    chat.forEach(m => {
      if (m.compressed) {
        orig += m.original.length * 8;
        comp += m.compressed.length;
      }
    });
    const saved = orig ? Math.round(100 * (1 - comp / orig)) : 0;
    return { totalOriginal: orig, totalCompressed: comp, saved };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-teal-50 to-sky-200 flex flex-col items-center overflow-hidden relative font-sans">
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              background: `radial-gradient(circle, ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#22c55e' : '#60a5fa'}, transparent)`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 30 + 30}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between px-6 pt-6 pb-4 bg-white/90 rounded-b-3xl shadow-xl mb-4 backdrop-blur-lg z-10 relative border-b border-blue-100">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 tracking-wide drop-shadow-[0_2px_12px_rgba(96,165,250,0.4)] animate-glow select-none">
            ChitChat
          </h1>
          <span className="bg-gradient-to-r from-green-400/20 to-blue-400/20 text-green-600 font-semibold text-xs rounded-xl px-3 py-1 shadow flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
            {stats.saved}% saved
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInfo(v => !v)}
            className={`p-2 rounded-lg transition-all outline-none focus:ring-2 focus:ring-blue-300 hover:bg-blue-50 ${showInfo ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
          >
            <InfoIcon />
          </button>
          <button
            onClick={() => setShowStats(v => !v)}
            className={`p-2 rounded-lg transition-all outline-none focus:ring-2 focus:ring-blue-300 hover:bg-blue-50 ${showStats ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
          >
            <StatsIcon />
          </button>
        </div>
        
        {/* Stats Popup */}
        {showStats && (
          <div className="absolute top-16 right-4 bg-white/95 rounded-2xl shadow-2xl px-7 py-6 z-20 text-gray-800 animate-popupIn backdrop-blur-md border border-blue-100">
            <p className="font-bold mb-2 text-blue-700 text-lg flex items-center gap-2">
              <StatsIcon /> Compression Stats
            </p>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between"><span>Messages:</span> <b className="text-blue-600">{chat.filter(m => m.compressed).length}</b></p>
              <p className="flex justify-between"><span>Original size:</span> <b className="text-blue-600">{stats.totalOriginal} bits</b></p>
              <p className="flex justify-between"><span>Compressed size:</span> <b className="text-blue-600">{stats.totalCompressed} bits</b></p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500" 
                  style={{ width: `${stats.saved}%` }}
                />
              </div>
              <p className="text-green-600 font-semibold mt-2 text-right">Saved: {stats.saved}%</p>
            </div>
          </div>
        )}

        {/* Info Popup */}
        {showInfo && (
          <div className="absolute top-16 right-4 bg-white/95 rounded-2xl shadow-2xl px-7 py-6 z-20 text-gray-800 animate-popupIn backdrop-blur-md border border-blue-100 w-80">
            <p className="font-bold mb-2 text-blue-700 text-lg flex items-center gap-2">
              <InfoIcon /> About ChitChat
            </p>
            <div className="text-sm space-y-2">
              <p>This chat application uses Huffman coding to compress messages in real-time.</p>
              <p>Each message is analyzed and compressed using optimal prefix codes based on character frequency.</p>
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-700 mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Type a message and send it</li>
                  <li>The server analyzes character frequencies</li>
                  <li>Creates optimal binary codes</li>
                  <li>Compresses your message</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <main className="w-full max-w-2xl flex-1 flex flex-col bg-white/90 rounded-3xl shadow-xl px-4 py-5 mb-6 backdrop-blur-lg border border-blue-100 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2">
          {chat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gradient-to-br from-blue-100 to-green-50 p-8 rounded-full mb-4">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-blue-300">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500">Send your first message</p>
              <p className="text-sm">Start chatting to see compression in action</p>
            </div>
          ) : (
            chat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end ${msg.self ? 'justify-end' : 'justify-start'} ${msg.anim ? 'animate-slideIn' : ''}`}
              >
                <div
                  tabIndex={0}
                  className={`
                    px-5 py-3 max-w-[80%] rounded-2xl shadow-lg transition-all duration-200 transform
                    ${msg.self
                      ? 'bg-gradient-to-br from-blue-600 to-green-500 text-white rounded-br-none'
                      : 'bg-gradient-to-br from-slate-100 to-sky-100 text-gray-900 rounded-bl-none'}
                    hover:scale-[1.02] hover:shadow-xl focus:scale-[1.02] focus:shadow-xl
                    group relative
                  `}
                >
                  {msg.self && (
                    <div className="absolute -right-2 bottom-0 w-4 h-4 overflow-hidden">
                      <div className="absolute left-0 top-0 w-4 h-4 bg-blue-600 transform rotate-45 origin-bottom-left" />
                    </div>
                  )}
                  {!msg.self && (
                    <div className="absolute -left-2 bottom-0 w-4 h-4 overflow-hidden">
                      <div className="absolute right-0 top-0 w-4 h-4 bg-slate-100 transform rotate-45 origin-bottom-right" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="text-lg break-words">{msg.original}</p>
                    {msg.compressed && (
                      <span className="ml-1" title="Compressed message">
                        <CompressIcon />
                      </span>
                    )}
                  </div>
                  {msg.compressed && (
                    <div className="text-xs mt-1 flex items-center gap-1 opacity-90">
                      <span className={msg.self ? "text-blue-100" : "text-green-600"}>
                        Compressed to {msg.compressed.length} bits
                      </span>
                      <span className={msg.self ? "text-blue-100" : "text-gray-500"}>
                        (Original: {msg.original.length * 8} bits)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
        className="w-full max-w-2xl flex items-center gap-3 px-6 pb-8 z-20 relative"
      >
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <div className="bg-gradient-to-r from-transparent via-blue-400/30 to-transparent h-px w-3/4" />
        </div>
        <input
          className="flex-1 px-5 py-3 rounded-2xl border-2 border-sky-200 bg-white/95 text-lg font-medium focus:outline-none focus:border-green-400 shadow-lg transition-all duration-150 hover:shadow-xl focus:shadow-xl"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold bg-gradient-to-br from-blue-600 to-green-500 shadow-lg hover:shadow-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-70 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <PlaneIcon />
          <span className="ml-1">Send</span>
        </button>
      </form>

      <style>{`
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-popupIn { animation: popupIn 0.25s cubic-bezier(.4,2,.6,1); }
        .animate-glow { animation: glow 2.5s ease-in-out infinite alternate; }
        .animate-float { animation: float linear infinite; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glow {
          from { text-shadow: 0 2px 12px #60a5fa66, 0 0px 2px #22c55e44; }
          to { text-shadow: 0 4px 24px #22c55e99, 0 0px 6px #60a5fa88; }
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default Chat;
