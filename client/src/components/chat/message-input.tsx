import { useState, useRef, useEffect } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  currentUser: User | null;
}

export default function MessageInput({ onSendMessage, currentUser }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSendMessage = () => {
    if (message.trim() && currentUser) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      // TODO: Emit typing start event
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // TODO: Emit typing stop event
    }, 1000);
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice-to-text functionality
    console.log("Voice input feature coming soon!");
  };

  const handleEmojiPicker = () => {
    // TODO: Implement emoji picker
    const emojis = ["😊", "👍", "❤️", "😂", "🔥", "🇦🇺", "🦘", "☕"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(prev => prev + randomEmoji);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 border-t border-gray-700 chat-bg-darker">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Message #general..."
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-700 text-white placeholder-gray-400 border-none pr-20 focus:ring-2 focus:ring-blue-500 focus:bg-gray-600"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                title="Voice Input (Coming Soon)"
              >
                <i className="fas fa-microphone"></i>
              </button>
              <button
                type="button"
                onClick={handleEmojiPicker}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-smile"></i>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>🦘 Spam Guard</span>
              <span>•</span>
              <span>🤖 Marge responds to mentions</span>
            </div>
            <div className="text-xs text-gray-400">
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !currentUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium flex items-center space-x-2"
        >
          <i className="fas fa-paper-plane"></i>
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
