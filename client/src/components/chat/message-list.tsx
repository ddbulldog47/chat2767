import { MessageWithAuthor, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: MessageWithAuthor[];
  currentUser: User | null;
  typingUsers: Array<{ userId: number; username: string; isTyping: boolean }>;
  onReaction: (messageId: number, emoji: string) => void;
  onRemoveReaction: (messageId: number, emoji: string) => void;
  isLoading: boolean;
}

export default function MessageList({ 
  messages, 
  currentUser, 
  typingUsers,
  onReaction, 
  onRemoveReaction,
  isLoading 
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAuthorAvatar = (author: User) => {
    if (author.role === "founder") {
      return (
        <div className="w-10 h-10 founder-gradient rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-crown text-white"></i>
        </div>
      );
    }
    if (author.role === "bot") {
      return (
        <div className="w-10 h-10 bot-gradient rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-white"></i>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fas fa-user text-white"></i>
      </div>
    );
  };

  const getAuthorName = (author: User) => {
    if (author.role === "founder") {
      return <span className="font-semibold text-yellow-400">{author.username}</span>;
    }
    if (author.role === "bot") {
      return <span className="font-semibold text-blue-400">{author.username}</span>;
    }
    return <span className="font-semibold">{author.username}</span>;
  };

  const getRoleBadge = (author: User) => {
    if (author.role === "founder") {
      return <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">FOUNDER</span>;
    }
    if (author.role === "bot") {
      return <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">BOT</span>;
    }
    return null;
  };

  const getSpamWarning = (message: MessageWithAuthor) => {
    if (message.isSpam) {
      return (
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex items-center space-x-1 text-xs bg-red-600 px-2 py-1 rounded-full">
            <span>🦘</span>
            <span>Spam Guard Triggered</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleReactionClick = (messageId: number, emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onReaction(messageId, emoji);
    }
  };

  const activeTypingUsers = typingUsers.filter(u => u.isTyping && u.userId !== currentUser?.id);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
      {/* Welcome Message */}
      <div className="aussie-gradient p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-lg mb-2">G'day! Welcome to Aussie Chat! 🇦🇺</h3>
        <p className="text-sm opacity-90">Fair dinkum conversation starts here. Be respectful and have a ripper time!</p>
      </div>

      {/* Messages */}
      {messages.map((message) => (
        <div 
          key={message.id}
          className="flex items-start space-x-3 group hover:bg-gray-800 hover:bg-opacity-50 p-2 rounded transition-colors"
        >
          {getAuthorAvatar(message.author)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {getAuthorName(message.author)}
              {getRoleBadge(message.author)}
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-gray-100">{message.content}</p>
            
            {getSpamWarning(message)}
            
            {/* Reactions */}
            {Object.keys(message.reactionCounts).length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {Object.entries(message.reactionCounts).map(([emoji, count]) => {
                  const hasReacted = false; // TODO: Track user reactions
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(message.id, emoji, hasReacted)}
                      className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        hasReacted 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </button>
                  );
                })}
                <button 
                  onClick={() => onReaction(message.id, "👍")}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing Indicators */}
      {activeTypingUsers.map((user) => (
        <div key={user.userId} className="flex items-start space-x-3 opacity-50">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-user text-white"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-400">{user.username}</span>
              <span className="text-xs text-gray-500">is typing...</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
