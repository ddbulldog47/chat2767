import { users, messages, reactions, type User, type InsertUser, type Message, type InsertMessage, type MessageWithAuthor, type InsertReaction } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: number, status: string): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(channelId: string, limit?: number): Promise<MessageWithAuthor[]>;
  updateMessageSpamStatus(id: number, isSpam: boolean, spamScore: number): Promise<void>;

  // Reactions
  addReaction(reaction: InsertReaction): Promise<void>;
  removeReaction(messageId: number, userId: number, emoji: string): Promise<void>;
  getReactionCounts(messageId: number): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private reactions: Map<number, Array<{ userId: number; emoji: string }>>;
  private currentUserId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.reactions = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;

    // Initialize with default users
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    // Create founder
    const founder: User = {
      id: this.currentUserId++,
      username: "Mozzy",
      password: "password",
      role: "founder",
      status: "online",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(founder.id, founder);

    // Create AI bot
    const bot: User = {
      id: this.currentUserId++,
      username: "Marge",
      password: "bot",
      role: "bot",
      status: "online",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(bot.id, bot);

    // Create sample users
    const sampleUsers = [
      "SydneyMate",
      "MelbourneMate", 
      "BrisbaneBuddy",
      "PerthPal",
      "AdelaideAce",
      "DarwinDude",
      "CanberraCrew",
      "TassieTiger"
    ];

    for (const username of sampleUsers) {
      const user: User = {
        id: this.currentUserId++,
        username,
        password: "password",
        role: "member",
        status: Math.random() > 0.3 ? "online" : "away",
        avatar: null,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    }

    // Create welcome messages
    await this.createInitialMessages(founder, bot);
  }

  private async createInitialMessages(founder: User, bot: User) {
    // Bot welcome message
    const botMessage: Message = {
      id: this.currentMessageId++,
      content: "G'day everyone! I'm Marge, your friendly AI assistant. Just mention my name if you need help! 🤖",
      authorId: bot.id,
      channelId: "general",
      isSpam: false,
      spamScore: 0,
      reactions: [],
      createdAt: new Date(Date.now() - 300000), // 5 minutes ago
    };
    this.messages.set(botMessage.id, botMessage);

    // Founder welcome message
    const founderMessage: Message = {
      id: this.currentMessageId++,
      content: "Thanks Marge! Welcome to the community everyone. Let's keep it friendly and fair dinkum! 🇦🇺",
      authorId: founder.id,
      channelId: "general",
      isSpam: false,
      spamScore: 0,
      reactions: [],
      createdAt: new Date(Date.now() - 240000), // 4 minutes ago
    };
    this.messages.set(founderMessage.id, founderMessage);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => {
      // Sort by role (founder, bot, then members), then by status, then by username
      const roleOrder = { founder: 0, bot: 1, member: 2 };
      const statusOrder = { online: 0, away: 1, offline: 2 };

      if (roleOrder[a.role as keyof typeof roleOrder] !== roleOrder[b.role as keyof typeof roleOrder]) {
        return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
      }
      if (statusOrder[a.status as keyof typeof statusOrder] !== statusOrder[b.status as keyof typeof statusOrder]) {
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      }
      return a.username.localeCompare(b.username);
    });
  }

  async updateUserStatus(id: number, status: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.status = status;
      this.users.set(id, user);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    // Check for spam
    await this.checkSpam(message);

    // Check for AI bot trigger
    await this.checkAIBotTrigger(message);

    return message;
  }

  private async checkSpam(message: Message): Promise<void> {
    const spamKeywords = [
      "buy now", "save", "deal", "discount", "free", "click here", 
      "limited time", "act now", "special offer", "bonus", "prize"
    ];
    
    const content = message.content.toLowerCase();
    let spamScore = 0;
    
    for (const keyword of spamKeywords) {
      if (content.includes(keyword)) {
        spamScore += 1;
      }
    }

    if (spamScore >= 2) {
      await this.updateMessageSpamStatus(message.id, true, spamScore);
    }
  }

  private async checkAIBotTrigger(message: Message): Promise<void> {
    const content = message.content.toLowerCase();
    const botUser = Array.from(this.users.values()).find(u => u.role === "bot");
    
    if (!botUser || message.authorId === botUser.id) return;

    // Trigger words for Marge
    const triggerWords = [
      "marge", "bot", "help", "coffee", "sydney", "melbourne", 
      "brisbane", "perth", "adelaide", "darwin", "canberra",
      "australia", "aussie", "mate", "recommendation"
    ];

    const shouldRespond = triggerWords.some(word => content.includes(word));

    if (shouldRespond) {
      setTimeout(async () => {
        const responses = [
          "G'day! How can I help you out, mate? 🇦🇺",
          "Fair dinkum! What can I do for you? 🤖",
          "Too right! I'm here to help, cobber! 👍",
          "No worries! What do you need assistance with? ☕",
          "Beauty! Let me know what you're after! 🌟"
        ];

        if (content.includes("coffee")) {
          responses.push(
            "For coffee in Sydney, try Single O in Surry Hills or The Grounds of Alexandria! ☕️",
            "Melbourne's got amazing coffee culture - try Patricia Coffee Brewers or Seven Seeds! ☕️",
            "Brisbane coffee? Check out Blackbird Espresso or Coffee Anthology! ☕️"
          );
        }

        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const botMessage: Message = {
          id: this.currentMessageId++,
          content: response,
          authorId: botUser.id,
          channelId: message.channelId,
          isSpam: false,
          spamScore: 0,
          reactions: [],
          createdAt: new Date(),
        };
        
        this.messages.set(botMessage.id, botMessage);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    }
  }

  async getMessages(channelId: string, limit: number = 50): Promise<MessageWithAuthor[]> {
    const channelMessages = Array.from(this.messages.values())
      .filter(msg => msg.channelId === channelId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);

    const messagesWithAuthors: MessageWithAuthor[] = [];

    for (const message of channelMessages) {
      const author = this.users.get(message.authorId);
      if (author) {
        const reactionCounts = await this.getReactionCounts(message.id);
        messagesWithAuthors.push({
          ...message,
          author,
          reactionCounts,
        });
      }
    }

    return messagesWithAuthors;
  }

  async updateMessageSpamStatus(id: number, isSpam: boolean, spamScore: number): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isSpam = isSpam;
      message.spamScore = spamScore;
      this.messages.set(id, message);
    }
  }

  async addReaction(reaction: InsertReaction): Promise<void> {
    if (!this.reactions.has(reaction.messageId)) {
      this.reactions.set(reaction.messageId, []);
    }
    
    const messageReactions = this.reactions.get(reaction.messageId)!;
    
    // Remove existing reaction from same user with same emoji
    const existingIndex = messageReactions.findIndex(
      r => r.userId === reaction.userId && r.emoji === reaction.emoji
    );
    
    if (existingIndex === -1) {
      messageReactions.push({
        userId: reaction.userId,
        emoji: reaction.emoji,
      });
    }
  }

  async removeReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    const messageReactions = this.reactions.get(messageId);
    if (messageReactions) {
      const index = messageReactions.findIndex(
        r => r.userId === userId && r.emoji === emoji
      );
      if (index !== -1) {
        messageReactions.splice(index, 1);
      }
    }
  }

  async getReactionCounts(messageId: number): Promise<Record<string, number>> {
    const messageReactions = this.reactions.get(messageId) || [];
    const counts: Record<string, number> = {};
    
    for (const reaction of messageReactions) {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    }
    
    return counts;
  }
}

export const storage = new MemStorage();
