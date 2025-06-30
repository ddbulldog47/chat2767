import { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import Sidebar from "@/components/chat/sidebar";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { Helmet } from "react-helmet";

export default function Chat() {
  const { 
    messages, 
    users, 
    sendMessage, 
    addReaction, 
    removeReaction,
    isLoading,
    currentUser,
    typingUsers
  } = useChat("general");

  return (
    <>
      <Helmet>
        <title>Aussie Chat - Public Chatroom | G'day Mate!</title>
        <meta name="description" content="Join the friendliest Australian chatroom community. Chat with mates, get help from Marge our AI bot, and enjoy fair dinkum conversations!" />
        <meta property="og:title" content="Aussie Chat - Public Chatroom" />
        <meta property="og:description" content="Join the friendliest Australian chatroom community with AI bot integration and spam protection." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="flex h-screen">
        <Sidebar users={users} currentUser={currentUser} />
        
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="chat-bg-darker p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <i className="fas fa-hashtag text-gray-400"></i>
                <h2 className="font-semibold text-lg">general</h2>
                <div className="hidden sm:flex items-center space-x-2 ml-4">
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full">🦘 Spam Guard Active</span>
                  <span className="text-xs px-2 py-1 rounded-full aussie-gradient">🤖 Marge Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-gray-700">
                <i className="fas fa-bell"></i>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-gray-700">
                <i className="fas fa-users"></i>
              </button>
            </div>
          </div>

          <MessageList 
            messages={messages} 
            currentUser={currentUser}
            typingUsers={typingUsers}
            onReaction={addReaction}
            onRemoveReaction={removeReaction}
            isLoading={isLoading}
          />
          
          <MessageInput 
            onSendMessage={sendMessage}
            currentUser={currentUser}
          />
        </div>
      </div>
    </>
  );
}
