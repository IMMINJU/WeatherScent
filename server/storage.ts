import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import { 
  users, perfumes, recommendations, wishlist, chatMessages, preferenceTests,
  type User, type InsertUser, type Perfume, type InsertPerfume,
  type Recommendation, type InsertRecommendation, type Wishlist, type InsertWishlist,
  type ChatMessage, type InsertChatMessage, type PreferenceTest, type InsertPreferenceTest
} from "@shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserPreferences(id: number, preferences: any): Promise<User | undefined>;

  // Perfume operations
  createPerfume(perfume: InsertPerfume): Promise<Perfume>;
  getAllPerfumes(): Promise<Perfume[]>;
  getPerfumeById(id: number): Promise<Perfume | undefined>;
  updatePerfumeViews(id: number): Promise<void>;

  // Recommendation operations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsByUserId(userId: number): Promise<Recommendation[]>;
  getRecommendationsWithPerfumes(userId: number): Promise<any[]>;

  // Wishlist operations
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, perfumeId: number): Promise<boolean>;
  getWishlistByUserId(userId: number): Promise<Wishlist[]>;
  getWishlistWithPerfumes(userId: number): Promise<any[]>;
  isInWishlist(userId: number, perfumeId: number): Promise<boolean>;

  // Chat operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: number): Promise<ChatMessage[]>;

  // Preference test operations
  savePreferenceTest(test: InsertPreferenceTest): Promise<PreferenceTest>;
  getPreferenceTestByUserId(userId: number): Promise<PreferenceTest | undefined>;
}

export class SupabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Supabase connection");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserPreferences(id: number, preferences: any): Promise<User | undefined> {
    const [user] = await this.db
      .update(users)
      .set({ preferences })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Perfume operations
  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const [perfume] = await this.db.insert(perfumes).values(insertPerfume).returning();
    return perfume;
  }

  async getAllPerfumes(): Promise<Perfume[]> {
    return await this.db.select().from(perfumes);
  }

  async getPerfumeById(id: number): Promise<Perfume | undefined> {
    const [perfume] = await this.db.select().from(perfumes).where(eq(perfumes.id, id));
    return perfume;
  }

  async updatePerfumeViews(id: number): Promise<void> {
    const perfume = await this.getPerfumeById(id);
    if (perfume) {
      await this.db
        .update(perfumes)
        .set({ views: (perfume.views || 0) + 1 })
        .where(eq(perfumes.id, id));
    }
  }

  // Recommendation operations
  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await this.db
      .insert(recommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  async getRecommendationsByUserId(userId: number): Promise<Recommendation[]> {
    return await this.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId));
  }

  async getRecommendationsWithPerfumes(userId: number): Promise<any[]> {
    const recs = await this.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId));
    
    const recsWithPerfumes = await Promise.all(recs.map(async (rec) => {
      const perfume = rec.perfumeId ? await this.getPerfumeById(rec.perfumeId) : null;
      return { ...rec, perfume };
    }));
    
    return recsWithPerfumes;
  }

  // Wishlist operations
  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const [wishlistItem] = await this.db
      .insert(wishlist)
      .values(insertWishlist)
      .returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, perfumeId: number): Promise<boolean> {
    const result = await this.db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.perfumeId, perfumeId)));
    return result.rowCount > 0;
  }

  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    return await this.db
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, userId));
  }

  async getWishlistWithPerfumes(userId: number): Promise<any[]> {
    const wishlistItems = await this.db
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, userId));
    
    const wishlistWithPerfumes = await Promise.all(wishlistItems.map(async (item) => {
      const perfume = item.perfumeId ? await this.getPerfumeById(item.perfumeId) : null;
      return { ...item, perfume };
    }));
    
    return wishlistWithPerfumes;
  }

  async isInWishlist(userId: number, perfumeId: number): Promise<boolean> {
    const [item] = await this.db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.perfumeId, perfumeId)));
    return !!item;
  }

  // Chat operations
  async saveChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await this.db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    return await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
;
  }

  // Preference test operations
  async savePreferenceTest(insertTest: InsertPreferenceTest): Promise<PreferenceTest> {
    const [test] = await this.db
      .insert(preferenceTests)
      .values(insertTest)
      .returning();
    return test;
  }

  async getPreferenceTestByUserId(userId: number): Promise<PreferenceTest | undefined> {
    const [test] = await this.db
      .select()
      .from(preferenceTests)
      .where(eq(preferenceTests.userId, userId));
    return test;
  }
}

// Temporarily use memory storage until DATABASE_URL is provided
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private perfumes: Map<number, Perfume> = new Map();
  private recommendations: Map<number, Recommendation> = new Map();
  private wishlistItems: Map<number, Wishlist> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private preferenceTests: Map<number, PreferenceTest> = new Map();
  private currentUserId = 1;
  private currentPerfumeId = 1;
  private currentRecommendationId = 1;
  private currentWishlistId = 1;
  private currentChatId = 1;
  private currentTestId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample perfumes
    const samplePerfumes = [
      {
        name: "Chance Eau Tendre",
        brand: "CHANEL",
        category: "프레시",
        notes: ["그레이프후르츠", "자스민", "화이트머스크"],
        description: "상쾌한 시트러스가 산뜻함을 주고, 은은한 플로럴 노트가 우아함을 더해줍니다.",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        rating: 48,
        views: 1200
      },
      {
        name: "Neroli Portofino",
        brand: "TOM FORD", 
        category: "우디",
        notes: ["네롤리", "베르가못", "앰버"],
        description: "지중해의 따뜻한 햇살을 담은 럭셔리한 향입니다.",
        image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        rating: 46,
        views: 856
      },
      {
        name: "English Pear & Freesia",
        brand: "JO MALONE",
        category: "플로럴",
        notes: ["배", "프리지아", "패출리"],
        description: "영국 정원의 우아한 분위기를 담은 향수입니다.",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        rating: 49,
        views: 2100
      }
    ];

    samplePerfumes.forEach(perfume => {
      const id = this.currentPerfumeId++;
      this.perfumes.set(id, { ...perfume, id });
    });

    // Sample user
    this.users.set(1, {
      id: 1,
      username: "demo_user",
      email: "demo@weatherscent.com",
      preferences: null,
      createdAt: new Date()
    });
  }

  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      preferences: insertUser.preferences || null
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUserPreferences(id: number, preferences: any): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.preferences = preferences;
      return user;
    }
    return undefined;
  }

  // Perfume operations
  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const id = this.currentPerfumeId++;
    const perfume: Perfume = { 
      ...insertPerfume, 
      id,
      image: insertPerfume.image || null,
      description: insertPerfume.description || null,
      rating: insertPerfume.rating || null,
      views: insertPerfume.views || null
    };
    this.perfumes.set(id, perfume);
    return perfume;
  }

  async getAllPerfumes(): Promise<Perfume[]> {
    return Array.from(this.perfumes.values());
  }

  async getPerfumeById(id: number): Promise<Perfume | undefined> {
    return this.perfumes.get(id);
  }

  async updatePerfumeViews(id: number): Promise<void> {
    const perfume = this.perfumes.get(id);
    if (perfume) {
      perfume.views = (perfume.views || 0) + 1;
    }
  }

  // Recommendation operations
  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: Recommendation = { 
      ...insertRecommendation, 
      id,
      createdAt: new Date(),
      userId: insertRecommendation.userId || null,
      perfumeId: insertRecommendation.perfumeId || null,
      temperature: insertRecommendation.temperature || null,
      weatherCondition: insertRecommendation.weatherCondition || null,
      reason: insertRecommendation.reason || null,
      moodText: insertRecommendation.moodText || null
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByUserId(userId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId);
  }

  async getRecommendationsWithPerfumes(userId: number): Promise<any[]> {
    const recs = await this.getRecommendationsByUserId(userId);
    return Promise.all(recs.map(async (rec) => {
      const perfume = rec.perfumeId ? await this.getPerfumeById(rec.perfumeId) : null;
      return { ...rec, perfume };
    }));
  }

  // Wishlist operations
  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.currentWishlistId++;
    const wishlistItem: Wishlist = { 
      ...insertWishlist, 
      id,
      createdAt: new Date(),
      userId: insertWishlist.userId || null,
      perfumeId: insertWishlist.perfumeId || null
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, perfumeId: number): Promise<boolean> {
    const itemToRemove = Array.from(this.wishlistItems.entries())
      .find(([, item]) => item.userId === userId && item.perfumeId === perfumeId);
    if (itemToRemove) {
      this.wishlistItems.delete(itemToRemove[0]);
      return true;
    }
    return false;
  }

  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId);
  }

  async getWishlistWithPerfumes(userId: number): Promise<any[]> {
    const wishlistItems = await this.getWishlistByUserId(userId);
    return Promise.all(wishlistItems.map(async (item) => {
      const perfume = item.perfumeId ? await this.getPerfumeById(item.perfumeId) : null;
      return { ...item, perfume };
    }));
  }

  async isInWishlist(userId: number, perfumeId: number): Promise<boolean> {
    return Array.from(this.wishlistItems.values())
      .some(item => item.userId === userId && item.perfumeId === perfumeId);
  }

  // Chat operations
  async saveChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
      userId: insertMessage.userId || null,
      response: insertMessage.response || null,
      isUser: insertMessage.isUser !== undefined ? insertMessage.isUser : null
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Preference test operations
  async savePreferenceTest(insertTest: InsertPreferenceTest): Promise<PreferenceTest> {
    const id = this.currentTestId++;
    const test: PreferenceTest = { 
      ...insertTest, 
      id,
      completedAt: new Date(),
      userId: insertTest.userId || null,
      results: insertTest.results || null
    };
    this.preferenceTests.set(id, test);
    return test;
  }

  async getPreferenceTestByUserId(userId: number): Promise<PreferenceTest | undefined> {
    return Array.from(this.preferenceTests.values())
      .find(test => test.userId === userId);
  }
}

export const storage = process.env.DATABASE_URL ? new SupabaseStorage() : new MemStorage();