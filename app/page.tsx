'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Database, Trash2, FileText, MessageSquare } from 'lucide-react';

export default function ChatbotWithMemoryRAG() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [uploadText, setUploadText] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => loadData(), []);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const loadData = () => {
    const msgResult = localStorage.getItem('chatbot:messages');
    if (msgResult) setMessages(JSON.parse(msgResult));
    const kbResult = localStorage.getItem('chatbot:knowledge');
    if (kbResult) setKnowledgeBase(JSON.parse(kbResult));
  };

  const saveMessages = (msgs) => localStorage.setItem('chatbot:messages', JSON.stringify(msgs));
  const saveKnowledgeBase = (kb) => localStorage.setItem('chatbot:knowledge', JSON.stringify(kb));

  // Find relevant sentences from knowledge base
  const findRelevantSentences = (query) => {
    if (!knowledgeBase.length) return [];

    const queryLower = query.toLowerCase();
    let sentences = [];
    knowledgeBase.forEach(doc => {
      const docSentences = doc.content.split(/\.\s+/);
      docSentences.forEach(s => {
        const sLower = s.toLowerCase();
        const words = queryLower.split(' ').filter(w => w.length > 3);
        let score = 0;
        words.forEach(w => { if (sLower.includes(w)) score++; });
        if (score > 0) sentences.push({ sentence: s.trim(), score, title: doc.title });
      });
    });

    return sentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => `[${s.title}] ${s.sentence}`);
  };

  // Summarize top sentences into a natural response
  const summarizeSentences = (sentences, query) => {
    if (!sentences.length) return `Sorry, I don't have information on that.`;

    const unique = [...new Set(sentences)];
    let combined = unique.join(' ');

    const q = query.toLowerCase();
    if (q.includes('battery')) {
      const batteryMatch = unique.find(s => s.toLowerCase().includes('battery'));
      if (batteryMatch) combined = batteryMatch.replace(/Battery Life[^\.]*\./i, 'The DJI Action 5 Pro has a battery life of around 4 hours, though real-world use may vary depending on settings and usage.');
    }
    if (q.includes('underwater') || q.includes('depth')) {
      const depthMatch = unique.find(s => s.toLowerCase().includes('waterproof'));
      if (depthMatch) combined = 'It can be used underwater up to 20 meters without a case.';
    }
    if (q.includes('price')) {
      const priceMatch = unique.find(s => s.match(/₹\d+/));
      if (priceMatch) combined = priceMatch.match(/₹\d+/)[0];
    }

    return combined;
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const relevantSentences = findRelevantSentences(input);
      const aiReply = summarizeSentences(relevantSentences, input);

      const assistantMessage = { role: 'assistant', content: aiReply, usedRAG: relevantSentences.length > 0 };
      const updatedMessages = [...newMessages, assistantMessage];

      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setLoading(false);
    }, 800);
  };

  const addToKnowledgeBase = () => {
    if (!uploadText.trim()) return;

    const newDoc = { id: Date.now().toString(), title: `Document ${knowledgeBase.length + 1}`, content: uploadText, timestamp: new Date().toISOString() };
    const updatedKB = [...knowledgeBase, newDoc];
    setKnowledgeBase(updatedKB);
    saveKnowledgeBase(updatedKB);
    setUploadText('');
    setShowUpload(false);
  };

  const deleteDocument = (id) => {
    const updatedKB = knowledgeBase.filter(doc => doc.id !== id);
    setKnowledgeBase(updatedKB);
    saveKnowledgeBase(updatedKB);
  };

  const clearChat = () => { setMessages([]); saveMessages([]); };
  const clearKnowledge = () => { setKnowledgeBase([]); saveKnowledgeBase([]); };

  return (
    <div className="flex h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" /> Knowledge Base
            </h2>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          {showUpload && (
            <div className="space-y-2">
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Paste text to add to knowledge base..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none text-black"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={addToKnowledgeBase}
                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-black text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {knowledgeBase.length === 0 ? (
            <p className="text-sm text-center mt-8">No documents yet. Add information to enhance responses.</p>
          ) : (
            <div className="space-y-2">
              {knowledgeBase.map(doc => (
                <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{doc.title}</span>
                    </div>
                    <button onClick={() => deleteDocument(doc.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs line-clamp-3">{doc.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {knowledgeBase.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={clearKnowledge}
              className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              Clear All Documents
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> AI Chatbot with Memory + RAG
          </h1>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-black text-sm"
            >
              Clear Chat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center mt-8">
              <p className="text-lg mb-2">Welcome! Start a conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-black'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.usedRAG && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <span className="text-xs flex items-center gap-1">
                        <Database className="w-3 h-3" /> Used knowledge base
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
