// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  // Changed to text for MongoDB compatibility
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  assignedTo: text("assigned_to").notNull()
  // 'partner1' or 'partner2'
});
var truths = pgTable("truths", {
  id: text("id").primaryKey(),
  // Changed to text for MongoDB compatibility
  question: text("question").notNull(),
  intensity: integer("intensity").notNull(),
  // 1-5 scale
  cost: integer("cost").notNull().default(5),
  createdBy: text("created_by").notNull()
  // 'partner1' or 'partner2'
});
var dares = pgTable("dares", {
  id: text("id").primaryKey(),
  // Changed to text for MongoDB compatibility
  challenge: text("challenge").notNull(),
  intensity: integer("intensity").notNull(),
  // 1-5 scale
  cost: integer("cost").notNull().default(10),
  createdBy: text("created_by").notNull()
  // 'partner1' or 'partner2'
});
var points = pgTable("points", {
  id: text("id").primaryKey(),
  // Changed to text for MongoDB compatibility
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  partner: text("partner").notNull(),
  // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow()
});
var bucketlist = pgTable("bucketlist", {
  id: text("id").primaryKey(),
  // Changed to text for MongoDB compatibility
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdBy: text("created_by").notNull(),
  // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow()
});
var coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  redeemed: boolean("redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  createdBy: text("created_by").notNull(),
  // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow()
});
var attractions = pgTable("attractions", {
  id: text("id").primaryKey(),
  detail: text("detail").notNull(),
  type: text("type").notNull(),
  // 'physical', 'personality', 'quirk', etc.
  createdBy: text("created_by").notNull(),
  // 'partner1' or 'partner2'
  createdAt: timestamp("created_at").defaultNow()
});
var insertTaskSchema = createInsertSchema(tasks).omit({ id: true, completedAt: true });
var insertTruthSchema = createInsertSchema(truths).omit({ id: true });
var insertDareSchema = createInsertSchema(dares).omit({ id: true });
var insertPointSchema = createInsertSchema(points).omit({ id: true, createdAt: true });
var insertBucketlistSchema = createInsertSchema(bucketlist).omit({ id: true, completedAt: true, createdAt: true });
var insertCouponSchema = createInsertSchema(coupons).omit({ id: true, redeemedAt: true, createdAt: true });
var insertAttractionSchema = createInsertSchema(attractions).omit({ id: true, createdAt: true });

// server/routes.ts
async function registerRoutes(app2, storage2) {
  app2.get("/api/tasks", async (_req, res) => {
    const tasks2 = await storage2.getTasks();
    res.json(tasks2);
  });
  app2.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid task data" });
    }
    const task = await storage2.createTask(result.data);
    res.json(task);
  });
  app2.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const task = await storage2.completeTask(req.params.id);
      res.json(task);
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage2.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: "Task not found" });
    }
  });
  app2.get("/api/game/truths", async (req, res) => {
    const intensity = req.query.intensity ? parseInt(req.query.intensity) : void 0;
    const truths2 = await storage2.getTruths(intensity);
    res.json(truths2);
  });
  app2.post("/api/game/truths", async (req, res) => {
    const result = insertTruthSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid truth data" });
    }
    const truth = await storage2.createTruth(result.data);
    res.json(truth);
  });
  app2.get("/api/game/dares", async (req, res) => {
    const intensity = req.query.intensity ? parseInt(req.query.intensity) : void 0;
    const dares2 = await storage2.getDares(intensity);
    res.json(dares2);
  });
  app2.post("/api/game/dares", async (req, res) => {
    const result = insertDareSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid dare data" });
    }
    const dare = await storage2.createDare(result.data);
    res.json(dare);
  });
  app2.get("/api/points", async (req, res) => {
    const partner = req.query.partner;
    const points2 = await storage2.getPoints(partner);
    res.json(points2);
  });
  app2.get("/api/points/total", async (req, res) => {
    const partner = req.query.partner;
    if (!partner) {
      return res.status(400).json({ error: "Partner parameter is required" });
    }
    const total = await storage2.getTotalPoints(partner);
    res.json({ total });
  });
  app2.post("/api/points", async (req, res) => {
    const result = insertPointSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid points data" });
    }
    const points2 = await storage2.addPoints(result.data);
    res.json(points2);
  });
  app2.get("/api/bucketlist", async (_req, res) => {
    const items = await storage2.getBucketlist();
    res.json(items);
  });
  app2.post("/api/bucketlist", async (req, res) => {
    const result = insertBucketlistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid bucketlist data" });
    }
    const item = await storage2.createBucketlistItem(result.data);
    res.json(item);
  });
  app2.post("/api/bucketlist/:id/complete", async (req, res) => {
    try {
      const item = await storage2.completeBucketlistItem(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: "Bucketlist item not found" });
    }
  });
  app2.get("/api/coupons", async (_req, res) => {
    const coupons2 = await storage2.getCoupons();
    res.json(coupons2);
  });
  app2.post("/api/coupons", async (req, res) => {
    const result = insertCouponSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid coupon data" });
    }
    const coupon = await storage2.createCoupon(result.data);
    res.json(coupon);
  });
  app2.post("/api/coupons/:id/redeem", async (req, res) => {
    try {
      const coupon = await storage2.redeemCoupon(req.params.id);
      res.json(coupon);
    } catch (error) {
      res.status(404).json({ error: "Coupon not found or already redeemed" });
    }
  });
  app2.delete("/api/coupons/:id", async (req, res) => {
    try {
      await storage2.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: "Coupon not found or cannot be deleted" });
    }
  });
  app2.get("/api/attractions", async (_req, res) => {
    const attractions2 = await storage2.getAttractions();
    res.json(attractions2);
  });
  app2.post("/api/attractions", async (req, res) => {
    const result = insertAttractionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid attraction data" });
    }
    const attraction = await storage2.createAttraction(result.data);
    res.json(attraction);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/mongodb.ts
import { MongoClient, ObjectId } from "mongodb";
var MongoStorage = class {
  client;
  dbName = "relationtrack";
  connected = false;
  constructor(uri) {
    this.client = new MongoClient(uri, {
      // Add MongoDB connection options for better reliability
      connectTimeoutMS: 5e3,
      socketTimeoutMS: 5e3,
      serverSelectionTimeoutMS: 5e3,
      maxConnecting: 1
    });
  }
  async connect() {
    if (this.connected) return;
    try {
      await this.client.connect();
      await this.client.db(this.dbName).command({ ping: 1 });
      this.connected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
  get db() {
    if (!this.connected) {
      throw new Error("MongoDB is not connected");
    }
    return this.client.db(this.dbName);
  }
  // Tasks
  async getTasks() {
    const docs = await this.db.collection("tasks").find().toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      points: doc.points,
      completed: doc.completed,
      completedAt: doc.completedAt,
      assignedTo: doc.assignedTo
    }));
  }
  async getTasksByPartner(partner) {
    const docs = await this.db.collection("tasks").find({ assignedTo: partner }).toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      points: doc.points,
      completed: doc.completed,
      completedAt: doc.completedAt,
      assignedTo: doc.assignedTo
    }));
  }
  async createTask(task) {
    const newTask = {
      ...task,
      completed: false,
      completedAt: null,
      _id: new ObjectId()
    };
    await this.db.collection("tasks").insertOne(newTask);
    return {
      id: newTask._id.toHexString(),
      title: newTask.title,
      description: newTask.description,
      points: newTask.points,
      completed: newTask.completed,
      completedAt: newTask.completedAt,
      assignedTo: newTask.assignedTo
    };
  }
  async completeTask(id) {
    const task = await this.db.collection("tasks").findOne({ _id: new ObjectId(id) });
    if (!task) throw new Error("Task not found");
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: /* @__PURE__ */ new Date()
    };
    await this.db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true, completedAt: /* @__PURE__ */ new Date() } }
    );
    await this.addPoints({
      amount: task.points,
      reason: `Completed task: ${task.title}`,
      partner: task.assignedTo
    });
    return {
      id: task._id.toHexString(),
      title: task.title,
      description: task.description,
      points: task.points,
      completed: true,
      completedAt: /* @__PURE__ */ new Date(),
      assignedTo: task.assignedTo
    };
  }
  // Game
  async getTruths(intensity) {
    const query = intensity ? { intensity } : {};
    const docs = await this.db.collection("truths").find(query).toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      question: doc.question,
      intensity: doc.intensity,
      cost: doc.cost,
      createdBy: doc.createdBy
    }));
  }
  async getDares(intensity) {
    const query = intensity ? { intensity } : {};
    const docs = await this.db.collection("dares").find(query).toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      challenge: doc.challenge,
      intensity: doc.intensity,
      cost: doc.cost,
      createdBy: doc.createdBy
    }));
  }
  async createTruth(truth) {
    const newTruth = {
      ...truth,
      _id: new ObjectId()
    };
    await this.db.collection("truths").insertOne(newTruth);
    return {
      id: newTruth._id.toHexString(),
      question: newTruth.question,
      intensity: newTruth.intensity,
      cost: newTruth.cost,
      createdBy: newTruth.createdBy
    };
  }
  async createDare(dare) {
    const newDare = {
      ...dare,
      _id: new ObjectId()
    };
    await this.db.collection("dares").insertOne(newDare);
    return {
      id: newDare._id.toHexString(),
      challenge: newDare.challenge,
      intensity: newDare.intensity,
      cost: newDare.cost,
      createdBy: newDare.createdBy
    };
  }
  // Points
  async getPoints(partner) {
    const query = partner ? { partner } : {};
    const docs = await this.db.collection("points").find(query).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      amount: doc.amount,
      reason: doc.reason,
      partner: doc.partner,
      createdAt: doc.createdAt
    }));
  }
  async addPoints(points2) {
    const newPoint = {
      ...points2,
      createdAt: /* @__PURE__ */ new Date(),
      _id: new ObjectId()
    };
    await this.db.collection("points").insertOne(newPoint);
    return {
      id: newPoint._id.toHexString(),
      amount: newPoint.amount,
      reason: newPoint.reason,
      partner: newPoint.partner,
      createdAt: newPoint.createdAt
    };
  }
  async getTotalPoints(partner) {
    const result = await this.db.collection("points").aggregate([
      { $match: { partner } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    return result[0]?.total || 0;
  }
  // Bucketlist
  async getBucketlist() {
    const docs = await this.db.collection("bucketlist").find().sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      completedAt: doc.completedAt,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt
    }));
  }
  async createBucketlistItem(item) {
    const newItem = {
      ...item,
      completed: false,
      completedAt: null,
      createdAt: /* @__PURE__ */ new Date(),
      _id: new ObjectId()
    };
    await this.db.collection("bucketlist").insertOne(newItem);
    return {
      id: newItem._id.toHexString(),
      title: newItem.title,
      description: newItem.description,
      completed: newItem.completed,
      completedAt: newItem.completedAt,
      createdBy: newItem.createdBy,
      createdAt: newItem.createdAt
    };
  }
  async completeBucketlistItem(id) {
    const item = await this.db.collection("bucketlist").findOne({ _id: new ObjectId(id) });
    if (!item) throw new Error("Bucketlist item not found");
    await this.db.collection("bucketlist").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true, completedAt: /* @__PURE__ */ new Date() } }
    );
    return {
      id: item._id.toHexString(),
      title: item.title,
      description: item.description,
      completed: true,
      completedAt: /* @__PURE__ */ new Date(),
      createdBy: item.createdBy,
      createdAt: item.createdAt
    };
  }
};

// server/storage.ts
var MemStorage = class {
  tasks;
  truths;
  dares;
  points;
  bucketlist;
  coupons;
  attractions;
  currentIds;
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.truths = /* @__PURE__ */ new Map();
    this.dares = /* @__PURE__ */ new Map();
    this.points = /* @__PURE__ */ new Map();
    this.bucketlist = /* @__PURE__ */ new Map();
    this.coupons = /* @__PURE__ */ new Map();
    this.attractions = /* @__PURE__ */ new Map();
    this.currentIds = {
      tasks: 1,
      truths: 1,
      dares: 1,
      points: 1,
      bucketlist: 1,
      coupons: 1,
      attractions: 1
    };
    this.seedGameData();
  }
  async getTasks() {
    return Array.from(this.tasks.values());
  }
  async createTask(task) {
    const id = `task_${this.currentIds.tasks++}`;
    const newTask = {
      id,
      title: task.title,
      description: task.description || null,
      points: task.points,
      completed: false,
      completedAt: null,
      assignedTo: task.assignedTo
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  async completeTask(id) {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.tasks.set(id, updatedTask);
    await this.addPoints({
      amount: task.points,
      reason: `Completed task: ${task.title}`,
      partner: task.assignedTo
    });
    return updatedTask;
  }
  async deleteTask(id) {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    this.tasks.delete(id);
  }
  async getTruths(intensity) {
    let truths2 = Array.from(this.truths.values());
    if (intensity) {
      truths2 = truths2.filter((t) => t.intensity === intensity);
    }
    return truths2;
  }
  async getDares(intensity) {
    let dares2 = Array.from(this.dares.values());
    if (intensity) {
      dares2 = dares2.filter((d) => d.intensity === intensity);
    }
    return dares2;
  }
  async createTruth(truth) {
    const id = `truth_${this.currentIds.truths++}`;
    const newTruth = {
      id,
      question: truth.question,
      intensity: truth.intensity,
      cost: truth.cost || 5,
      createdBy: truth.createdBy
    };
    this.truths.set(id, newTruth);
    return newTruth;
  }
  async createDare(dare) {
    const id = `dare_${this.currentIds.dares++}`;
    const newDare = {
      id,
      challenge: dare.challenge,
      intensity: dare.intensity,
      cost: dare.cost || 10,
      createdBy: dare.createdBy
    };
    this.dares.set(id, newDare);
    return newDare;
  }
  async getPoints(partner) {
    let points2 = Array.from(this.points.values());
    if (partner) {
      points2 = points2.filter((p) => p.partner === partner);
    }
    return points2;
  }
  async addPoints(pointData) {
    const id = `point_${this.currentIds.points++}`;
    const point = {
      id,
      amount: pointData.amount,
      reason: pointData.reason,
      partner: pointData.partner,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.points.set(id, point);
    return point;
  }
  async getTotalPoints(partner) {
    return Array.from(this.points.values()).filter((p) => p.partner === partner).reduce((sum, p) => sum + p.amount, 0);
  }
  async getBucketlist() {
    return Array.from(this.bucketlist.values());
  }
  async createBucketlistItem(item) {
    const id = `bucketlist_${this.currentIds.bucketlist++}`;
    const bucketlistItem = {
      id,
      title: item.title,
      description: item.description || null,
      completed: false,
      completedAt: null,
      createdBy: item.createdBy,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.bucketlist.set(id, bucketlistItem);
    return bucketlistItem;
  }
  async completeBucketlistItem(id) {
    const item = this.bucketlist.get(id);
    if (!item) throw new Error("Bucketlist item not found");
    const updatedItem = {
      ...item,
      completed: true,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.bucketlist.set(id, updatedItem);
    return updatedItem;
  }
  // Love Coupons methods
  async getCoupons() {
    return Array.from(this.coupons.values());
  }
  async createCoupon(coupon) {
    const id = `coupon_${this.currentIds.coupons++}`;
    const newCoupon = {
      id,
      title: coupon.title,
      description: coupon.description || null,
      points: coupon.points,
      redeemed: false,
      redeemedAt: null,
      createdBy: coupon.createdBy,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }
  async redeemCoupon(id) {
    const coupon = this.coupons.get(id);
    if (!coupon) throw new Error("Coupon not found");
    if (coupon.redeemed) throw new Error("Coupon already redeemed");
    const updatedCoupon = {
      ...coupon,
      redeemed: true,
      redeemedAt: /* @__PURE__ */ new Date()
    };
    this.coupons.set(id, updatedCoupon);
    await this.addPoints({
      amount: -coupon.points,
      reason: `Redeemed coupon: ${coupon.title}`,
      partner: coupon.createdBy
    });
    return updatedCoupon;
  }
  async deleteCoupon(id) {
    const coupon = this.coupons.get(id);
    if (!coupon) throw new Error("Coupon not found");
    if (!coupon.redeemed) throw new Error("Cannot delete unredeemed coupon");
    this.coupons.delete(id);
  }
  // Attractions methods
  async getAttractions() {
    return Array.from(this.attractions.values());
  }
  async createAttraction(attraction) {
    const id = `attraction_${this.currentIds.attractions++}`;
    const newAttraction = {
      id,
      detail: attraction.detail,
      type: attraction.type,
      createdBy: attraction.createdBy,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.attractions.set(id, newAttraction);
    return newAttraction;
  }
  seedGameData() {
    const truths2 = [
      { question: "What's your favorite feature about your partner?", intensity: 1, createdBy: "partner1", cost: 5 },
      { question: "What was your first impression of me?", intensity: 1, createdBy: "partner2", cost: 5 },
      { question: "What's your most memorable date with me?", intensity: 2, createdBy: "partner1", cost: 10 },
      { question: "What's something you'd like to try together?", intensity: 3, createdBy: "partner2", cost: 15 },
      { question: "What's your biggest fantasy?", intensity: 4, createdBy: "partner1", cost: 20 }
    ];
    const dares2 = [
      { challenge: "Give your partner a sweet compliment", intensity: 1, createdBy: "partner1", cost: 10 },
      { challenge: "Share a romantic dance together", intensity: 2, createdBy: "partner2", cost: 15 },
      { challenge: "Give your partner a 5-minute massage", intensity: 3, createdBy: "partner1", cost: 20 },
      { challenge: "Kiss your partner for 30 seconds", intensity: 3, createdBy: "partner2", cost: 25 },
      { challenge: "Whisper something seductive", intensity: 4, createdBy: "partner1", cost: 30 }
    ];
    truths2.forEach((truth) => {
      const id = `truth_${this.currentIds.truths++}`;
      this.truths.set(id, { ...truth, id });
    });
    dares2.forEach((dare) => {
      const id = `dare_${this.currentIds.dares++}`;
      this.dares.set(id, { ...dare, id });
    });
  }
};
var storage = new MemStorage();

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function initializeStorage() {
  if (process.env.MONGODB_URI) {
    log("MongoDB URI found, attempting to connect...");
    const storage2 = new MongoStorage(process.env.MONGODB_URI);
    try {
      await Promise.race([
        storage2.connect(),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error("MongoDB connection timeout")), 5e3)
        )
      ]);
      log("Successfully connected to MongoDB");
      return storage2;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      log("Falling back to MemStorage");
    }
  } else {
    log("No MongoDB URI found, using MemStorage");
  }
  return new MemStorage();
}
async function startServer() {
  log("Starting server initialization...");
  const storage2 = await initializeStorage();
  log("Setting up routes...");
  const server = await registerRoutes(app, storage2);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ message });
  });
  process.env.NODE_ENV = "development";
  log("Setting up frontend...");
  try {
    log("Initializing Vite development server...");
    await setupVite(app, server);
    log("Vite development server initialized");
  } catch (error) {
    console.error("Failed to initialize Vite:", error);
    process.exit(1);
  }
  const port = process.env.PORT || 5e3;
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      log(`Server listening on port ${port}`);
      resolve(server);
    }).on("error", (err) => {
      log(`Failed to start server: ${err.message}`);
      reject(err);
    });
  });
}
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
