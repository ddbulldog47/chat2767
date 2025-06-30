import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertMessageSchema, insertReactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // API Routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/messages/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessages(channelId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Basic validation for user existence
      const author = await storage.getUser(messageData.authorId);
      if (!author) {
        return res.status(400).json({ error: "Author not found" });
      }

      const message = await storage.createMessage(messageData);
      
      // Emit new message to all connected clients
      const messageWithAuthor = {
        ...message,
        author,
        reactionCounts: {},
      };
      
      io.emit("new_message", messageWithAuthor);
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  app.post("/api/reactions", async (req, res) => {
    try {
      const reactionData = insertReactionSchema.parse(req.body);
      
      await storage.addReaction(reactionData);
      
      // Get updated reaction counts
      const reactionCounts = await storage.getReactionCounts(reactionData.messageId);
      
      // Emit reaction update to all connected clients
      io.emit("reaction_update", {
        messageId: reactionData.messageId,
        reactionCounts,
      });
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid reaction data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add reaction" });
      }
    }
  });

  app.delete("/api/reactions", async (req, res) => {
    try {
      const { messageId, userId, emoji } = req.body;
      
      if (!messageId || !userId || !emoji) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      await storage.removeReaction(messageId, userId, emoji);
      
      // Get updated reaction counts
      const reactionCounts = await storage.getReactionCounts(messageId);
      
      // Emit reaction update to all connected clients
      io.emit("reaction_update", {
        messageId,
        reactionCounts,
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    socket.on("join_channel", (channelId) => {
      socket.join(channelId);
    });
    
    socket.on("typing_start", (data) => {
      socket.to(data.channelId).emit("user_typing", {
        userId: data.userId,
        username: data.username,
        isTyping: true,
      });
    });
    
    socket.on("typing_stop", (data) => {
      socket.to(data.channelId).emit("user_typing", {
        userId: data.userId,
        username: data.username,
        isTyping: false,
      });
    });
    
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}
