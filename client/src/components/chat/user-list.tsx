import { User } from "@shared/schema";
import { Crown, Bot, User as UserIcon, Settings } from "lucide-react";

interface UserListProps {
  users: User[];
  currentUser: User | null;
  onUserClick?: (user: User) => void;
}

export default function UserList({ users, currentUser, onUserClick }: UserListProps) {
  const onlineUsers = users.filter(u => u.status === "online");
  const awayUsers = users.filter(u => u.status === "away");

  const getUserAvatar = (user: User) => {
    if (user.role === "founder") {
      return (
        <div className="w-8 h-8 founder-gradient rounded-full flex items-center justify-center">
          <Crown className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (user.role === "bot") {
      return (
        <div className="w-8 h-8 bot-gradient rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
        <UserIcon className="w-4 h-4 text-white" />
      </div>
    );
  };

  const getUserRole = (user: User) => {
    switch (user.role) {
      case "founder":
        return <p className="text-xs text-yellow-400">Founder</p>;
      case "bot":
        return <p className="text-xs text-blue-400">AI Bot</p>;
      default:
        return <p className="text-xs text-gray-400">Member</p>;
    }
  };

  const getStatusDot = (status: string) => {
    const color = status === "online" ? "bg-green-500" : "bg-gray-500";
    return (
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${color} rounded-full border-2 border-gray-900`}></div>
    );
  };

  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div className="space-y-4">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 aussie-gradient rounded-full flex items-center justify-center">
            <i className="fas fa-globe text-white text-sm"></i>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Aussie Chat</h1>
            <p className="text-xs text-gray-400">Public Room</p>
          </div>
        </div>
      </div>

      {/* Online Users */}
      <div className="px-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Online - {onlineUsers.length}
        </h3>
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div 
              key={user.id}
              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              <div className="relative">
                {getUserAvatar(user)}
                {getStatusDot(user.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.username}</p>
                {getUserRole(user)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Away Users */}
      {awayUsers.length > 0 && (
        <div className="px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Away - {awayUsers.length}
          </h3>
          <div className="space-y-2">
            {awayUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 transition-colors opacity-60 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="relative">
                  {getUserAvatar(user)}
                  {getStatusDot(user.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">{user.username}</p>
                  <p className="text-xs text-gray-500">Away</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current User Profile */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentUser?.username || "You"}</p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
