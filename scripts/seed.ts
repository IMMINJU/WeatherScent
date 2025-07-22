import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { perfumes, users } from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

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
  },
  {
    name: "Black Opium",
    brand: "YVES SAINT LAURENT",
    category: "오리엔탈",
    notes: ["블랙커피", "바닐라", "화이트플라워"],
    description: "중독적인 커피 향과 달콤한 바닐라가 조화를 이룹니다.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
    rating: 47,
    views: 1840
  },
  {
    name: "Flowerbomb",
    brand: "VIKTOR & ROLF",
    category: "플로럴",
    notes: ["자스민", "프리지아", "로즈"],
    description: "화려한 꽃다발이 폭발하는 듯한 강렬한 플로럴 향수입니다.",
    image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
    rating: 45,
    views: 1560
  }
];

const sampleUser = {
  username: "demo_user",
  email: "demo@weatherscent.com",
  preferences: null
};

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Create demo user
    await db.insert(users).values(sampleUser).onConflictDoNothing();
    console.log("✅ Created demo user");
    
    // Create sample perfumes
    await db.insert(perfumes).values(samplePerfumes).onConflictDoNothing();
    console.log("✅ Created sample perfumes");
    
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();