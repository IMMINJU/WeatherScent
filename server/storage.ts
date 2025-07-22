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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private perfumes: Map<number, Perfume>;
  private recommendations: Map<number, Recommendation>;
  private wishlistItems: Map<number, Wishlist>;
  private chatMessages: Map<number, ChatMessage>;
  private preferenceTests: Map<number, PreferenceTest>;
  private currentUserId: number;
  private currentPerfumeId: number;
  private currentRecommendationId: number;
  private currentWishlistId: number;
  private currentChatId: number;
  private currentTestId: number;

  constructor() {
    this.users = new Map();
    this.perfumes = new Map();
    this.recommendations = new Map();
    this.wishlistItems = new Map();
    this.chatMessages = new Map();
    this.preferenceTests = new Map();
    this.currentUserId = 1;
    this.currentPerfumeId = 1;
    this.currentRecommendationId = 1;
    this.currentWishlistId = 1;
    this.currentChatId = 1;
    this.currentTestId = 1;

    // Initialize with some sample perfumes
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePerfumes: InsertPerfume[] = [
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
      this.createPerfume(perfume);
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
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
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const id = this.currentPerfumeId++;
    const perfume: Perfume = { ...insertPerfume, id };
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
      this.perfumes.set(id, perfume);
    }
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: Recommendation = { 
      ...insertRecommendation, 
      id,
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByUserId(userId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => rec.userId === userId);
  }

  async getRecommendationsWithPerfumes(userId: number): Promise<any[]> {
    const userRecommendations = await this.getRecommendationsByUserId(userId);
    return Promise.all(userRecommendations.map(async rec => {
      const perfume = await this.getPerfumeById(rec.perfumeId!);
      return { ...rec, perfume };
    }));
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.currentWishlistId++;
    const wishlistItem: Wishlist = { 
      ...insertWishlist, 
      id,
      createdAt: new Date()
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, perfumeId: number): Promise<boolean> {
    const items = Array.from(this.wishlistItems.entries());
    for (const [id, item] of items) {
      if (item.userId === userId && item.perfumeId === perfumeId) {
        this.wishlistItems.delete(id);
        return true;
      }
    }
    return false;
  }

  async getWishlistByUserId(userId: number): Promise<Wishlist[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }

  async getWishlistWithPerfumes(userId: number): Promise<any[]> {
    const wishlistItems = await this.getWishlistByUserId(userId);
    return Promise.all(wishlistItems.map(async item => {
      const perfume = await this.getPerfumeById(item.perfumeId!);
      return { ...item, perfume };
    }));
  }

  async isInWishlist(userId: number, perfumeId: number): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.perfumeId === perfumeId
    );
  }

  async saveChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async savePreferenceTest(insertTest: InsertPreferenceTest): Promise<PreferenceTest> {
    const id = this.currentTestId++;
    const test: PreferenceTest = { 
      ...insertTest, 
      id,
      completedAt: new Date()
    };
    this.preferenceTests.set(id, test);
    return test;
  }

  async getPreferenceTestByUserId(userId: number): Promise<PreferenceTest | undefined> {
    return Array.from(this.preferenceTests.values()).find(test => test.userId === userId);
  }
}

export const storage = new MemStorage();
