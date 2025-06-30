import { io, Socket } from "socket.io-client";

class ChatService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io("/", {
        transports: ["websocket", "polling"],
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChannel(channelId: string) {
    if (this.socket) {
      this.socket.emit("join_channel", channelId);
    }
  }

  startTyping(channelId: string, userId: number, username: string) {
    if (this.socket) {
      this.socket.emit("typing_start", { channelId, userId, username });
    }
  }

  stopTyping(channelId: string, userId: number, username: string) {
    if (this.socket) {
      this.socket.emit("typing_stop", { channelId, userId, username });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  onReactionUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("reaction_update", callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.off("new_message");
      this.socket.off("reaction_update");
      this.socket.off("user_typing");
    }
  }
}

export const chatService = new ChatService();
