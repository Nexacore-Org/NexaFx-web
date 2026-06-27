"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Minus,
  Send,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
};

const AUTO_GREETING: ChatMessage = {
  id: "greeting",
  role: "agent",
  text: "Hello! Welcome to NexaFX support. How can I help you today?",
  timestamp: new Date(),
};

const MOCK_RESPONSES = [
  "I'd be happy to help you with that! Let me check our system.",
  "Thank you for reaching out. One moment please.",
  "I've processed your request. Is there anything else I can assist with?",
  "Our team is currently reviewing your inquiry. We'll get back to you shortly.",
  "Sure! I can help you with deposits, withdrawals, or account inquiries.",
];

const TYPING_DELAY = 1500;

export function LiveSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([AUTO_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
    if (unreadCount > 0) setUnreadCount(0);
  };

  const minimize = () => {
    setIsMinimized(true);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setIsTyping(true);
    const response =
      MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, TYPING_DELAY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && !isMinimized && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between bg-yellow-400 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-black" />
              <span className="text-sm font-semibold text-black">
                Live Support
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={minimize}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                aria-label="Minimize chat"
              >
                <Minus className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-yellow-400 text-black rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.role === "user" ? "text-black/60" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isMinimized && (
        <button
          onClick={() => {
            setIsMinimized(false);
            if (unreadCount > 0) setUnreadCount(0);
          }}
          className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors relative"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors relative"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
