import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageWithAuthor, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { chatService } from "@/lib/chat-service";

export function useChat(channelId: string = "general") {
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: number; username: string; isTyping: boolean }>>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<MessageWithAuthor[]>({
    queryKey: ["/api/messages", channelId],
    queryFn: () => fetch(`/api/messages/${channelId}`).then(res => res.json()),
  });

  // Set current user (for demo purposes, we'll use a default user)
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      // In a real app, this would be the logged-in user
      // For demo, we'll create a default user
      const defaultUser: User = {
        id: 999,
        username: "You",
        password: "",
        role: "member",
        status: "online",
        avatar: null,
        createdAt: new Date(),
      };
      setCurrentUser(defaultUser);
    }
  }, [users, currentUser]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error("No current user");
      
      return apiRequest("POST", "/api/messages", {
        content,
        authorId: currentUser.id,
        channelId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", channelId] });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      if (!currentUser) throw new Error("No current user");
      
      return apiRequest("POST", "/api/reactions", {
        messageId,
        userId: currentUser.id,
        emoji,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", channelId] });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      if (!currentUser) throw new Error("No current user");
      
      return apiRequest("DELETE", "/api/reactions", {
        messageId,
        userId: currentUser.id,
        emoji,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", channelId] });
    },
  });

  // Socket.IO setup
  useEffect(() => {
    const socket = chatService.connect();
    
    chatService.joinChannel(channelId);
    
    chatService.onNewMessage((message: MessageWithAuthor) => {
      queryClient.setQueryData<MessageWithAuthor[]>(
        ["/api/messages", channelId],
        (oldData) => [...(oldData || []), message]
      );
    });

    chatService.onReactionUpdate((data: { messageId: number; reactionCounts: Record<string, number> }) => {
      queryClient.setQueryData<MessageWithAuthor[]>(
        ["/api/messages", channelId],
        (oldData) => 
          oldData?.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, reactionCounts: data.reactionCounts }
              : msg
          ) || []
      );
    });

    chatService.onUserTyping((data: { userId: number; username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    return () => {
      chatService.offAllListeners();
      chatService.disconnect();
    };
  }, [channelId, queryClient]);

  const sendMessage = useCallback((content: string) => {
    sendMessageMutation.mutate(content);
  }, [sendMessageMutation]);

  const addReaction = useCallback((messageId: number, emoji: string) => {
    addReactionMutation.mutate({ messageId, emoji });
  }, [addReactionMutation]);

  const removeReaction = useCallback((messageId: number, emoji: string) => {
    removeReactionMutation.mutate({ messageId, emoji });
  }, [removeReactionMutation]);

  return {
    messages,
    users,
    currentUser,
    typingUsers,
    sendMessage,
    addReaction,
    removeReaction,
    isLoading,
  };
}
