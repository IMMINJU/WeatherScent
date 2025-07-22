import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getWeatherData, getWeatherMood } from "./services/weather";
import { getWeatherBasedRecommendations, analyzePreferences, getChatResponse } from "./services/openai";
import { 
  insertUserSchema, 
  insertRecommendationSchema, 
  insertWishlistSchema,
  insertChatMessageSchema,
  insertPreferenceTestSchema,
  weatherDataSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Weather and location endpoints
  app.post("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.body;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const weatherData = await getWeatherData(lat, lon);
      const moodText = getWeatherMood(weatherData);
      
      res.json({ ...weatherData, moodText });
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Perfume endpoints
  app.get("/api/perfumes", async (req, res) => {
    try {
      const perfumes = await storage.getAllPerfumes();
      res.json(perfumes);
    } catch (error) {
      console.error("Error fetching perfumes:", error);
      res.status(500).json({ message: "Failed to fetch perfumes" });
    }
  });

  app.get("/api/perfumes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const perfume = await storage.getPerfumeById(id);
      
      if (!perfume) {
        return res.status(404).json({ message: "Perfume not found" });
      }

      // Update view count
      await storage.updatePerfumeViews(id);
      
      res.json(perfume);
    } catch (error) {
      console.error("Error fetching perfume:", error);
      res.status(500).json({ message: "Failed to fetch perfume" });
    }
  });

  // AI Recommendation endpoints
  app.post("/api/recommendations/weather", async (req, res) => {
    try {
      const { weatherData, userPreferences, userId } = req.body;
      
      if (!weatherData) {
        return res.status(400).json({ message: "Weather data is required" });
      }

      const aiRecommendations = await getWeatherBasedRecommendations(weatherData, userPreferences);
      const moodText = getWeatherMood(weatherData);

      // Save recommendations to storage if userId provided
      if (userId) {
        for (const aiRec of aiRecommendations) {
          // Find or create perfume in storage
          let existingPerfumes = await storage.getAllPerfumes();
          let perfume = existingPerfumes.find(p => 
            p.name.toLowerCase() === aiRec.name.toLowerCase() && 
            p.brand.toLowerCase() === aiRec.brand.toLowerCase()
          );

          if (!perfume) {
            perfume = await storage.createPerfume({
              name: aiRec.name,
              brand: aiRec.brand,
              category: aiRec.category,
              notes: aiRec.notes,
              description: aiRec.reason,
              rating: Math.floor(aiRec.confidence * 50), // Convert to 0-50 scale
              views: 0
            });
          }

          await storage.createRecommendation({
            userId,
            perfumeId: perfume.id,
            weatherCondition: weatherData.condition,
            temperature: weatherData.temperature,
            reason: aiRec.reason,
            moodText: aiRec.moodText
          });
        }
      }

      res.json({ 
        recommendations: aiRecommendations, 
        moodText,
        weatherData 
      });
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recommendations = await storage.getRecommendationsWithPerfumes(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Preference test endpoints
  app.post("/api/preferences/analyze", async (req, res) => {
    try {
      const { answers, userId } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Valid answers array is required" });
      }

      const analysis = await analyzePreferences(answers);
      
      // Save preference test if userId provided
      if (userId) {
        await storage.savePreferenceTest({
          userId,
          answers,
          results: analysis
        });

        // Update user preferences
        if (analysis.profile) {
          await storage.updateUserPreferences(userId, analysis.profile);
        }
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing preferences:", error);
      res.status(500).json({ message: "Failed to analyze preferences" });
    }
  });

  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferenceTest = await storage.getPreferenceTestByUserId(userId);
      res.json(preferenceTest);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Wishlist endpoints
  app.post("/api/wishlist", async (req, res) => {
    try {
      const validatedData = insertWishlistSchema.parse(req.body);
      
      // Check if already in wishlist
      const isAlreadyWishlisted = await storage.isInWishlist(
        validatedData.userId!, 
        validatedData.perfumeId!
      );
      
      if (isAlreadyWishlisted) {
        return res.status(400).json({ message: "Item already in wishlist" });
      }

      const wishlistItem = await storage.addToWishlist(validatedData);
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:userId/:perfumeId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const perfumeId = parseInt(req.params.perfumeId);
      
      const removed = await storage.removeFromWishlist(userId, perfumeId);
      
      if (!removed) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const wishlist = await storage.getWishlistWithPerfumes(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.get("/api/wishlist/:userId/:perfumeId/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const perfumeId = parseInt(req.params.perfumeId);
      
      const isWishlisted = await storage.isInWishlist(userId, perfumeId);
      res.json({ isWishlisted });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const chatResponse = await getChatResponse(message, context);
      
      // Save user message and AI response if userId provided
      if (userId) {
        await storage.saveChatMessage({
          userId,
          message,
          isUser: true
        });
        
        await storage.saveChatMessage({
          userId,
          message: chatResponse.message,
          isUser: false
        });
      }

      res.json(chatResponse);
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  app.get("/api/chat/:userId/history", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const chatHistory = await storage.getChatHistory(userId);
      res.json(chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // User endpoints (basic)
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
