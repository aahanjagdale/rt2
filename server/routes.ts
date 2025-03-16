import type { Express } from "express";
import { createServer, type Server } from "http";
import { type IStorage } from "./storage";
import { insertTaskSchema, insertPointSchema, insertBucketlistSchema, insertTruthSchema, insertDareSchema, insertCouponSchema, insertAttractionSchema } from "@shared/schema";

export async function registerRoutes(app: Express, storage: IStorage): Promise<Server> {
  // Tasks
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid task data" });
    }
    const task = await storage.createTask(result.data);
    res.json(task);
  });

  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const task = await storage.completeTask(req.params.id); 
      res.json(task);
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  // Game
  app.get("/api/game/truths", async (req, res) => {
    const intensity = req.query.intensity ? parseInt(req.query.intensity as string) : undefined;
    const truths = await storage.getTruths(intensity);
    res.json(truths);
  });

  app.post("/api/game/truths", async (req, res) => {
    const result = insertTruthSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid truth data" });
    }
    const truth = await storage.createTruth(result.data);
    res.json(truth);
  });

  app.get("/api/game/dares", async (req, res) => {
    const intensity = req.query.intensity ? parseInt(req.query.intensity as string) : undefined;
    const dares = await storage.getDares(intensity);
    res.json(dares);
  });

  app.post("/api/game/dares", async (req, res) => {
    const result = insertDareSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid dare data" });
    }
    const dare = await storage.createDare(result.data);
    res.json(dare);
  });

  // Points
  app.get("/api/points", async (req, res) => {
    const partner = req.query.partner as string | undefined;
    const points = await storage.getPoints(partner);
    res.json(points);
  });

  app.get("/api/points/total", async (req, res) => {
    const partner = req.query.partner as string;
    if (!partner) {
      return res.status(400).json({ error: "Partner parameter is required" });
    }
    const total = await storage.getTotalPoints(partner);
    res.json({ total });
  });

  app.post("/api/points", async (req, res) => {
    const result = insertPointSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid points data" });
    }
    const points = await storage.addPoints(result.data);
    res.json(points);
  });

  // Bucketlist
  app.get("/api/bucketlist", async (_req, res) => {
    const items = await storage.getBucketlist();
    res.json(items);
  });

  app.post("/api/bucketlist", async (req, res) => {
    const result = insertBucketlistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid bucketlist data" });
    }
    const item = await storage.createBucketlistItem(result.data);
    res.json(item);
  });

  app.post("/api/bucketlist/:id/complete", async (req, res) => {
    try {
      const item = await storage.completeBucketlistItem(req.params.id); 
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: "Bucketlist item not found" });
    }
  });

  // Love Coupons
  app.get("/api/coupons", async (_req, res) => {
    const coupons = await storage.getCoupons();
    res.json(coupons);
  });

  app.post("/api/coupons", async (req, res) => {
    const result = insertCouponSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid coupon data" });
    }
    const coupon = await storage.createCoupon(result.data);
    res.json(coupon);
  });

  app.post("/api/coupons/:id/redeem", async (req, res) => {
    try {
      const coupon = await storage.redeemCoupon(req.params.id);
      res.json(coupon);
    } catch (error) {
      res.status(404).json({ error: "Coupon not found or already redeemed" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: "Coupon not found or cannot be deleted" });
    }
  });

  // Attractions
  app.get("/api/attractions", async (_req, res) => {
    const attractions = await storage.getAttractions();
    res.json(attractions);
  });

  app.post("/api/attractions", async (req, res) => {
    const result = insertAttractionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid attraction data" });
    }
    const attraction = await storage.createAttraction(result.data);
    res.json(attraction);
  });

  const httpServer = createServer(app);
  return httpServer;
}