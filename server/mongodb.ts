import { MongoClient, ObjectId } from "mongodb";
import { IStorage } from "./storage";
import {
  type Task, type Truth, type Dare, type Point, type Bucketlist,
  type InsertTask, type InsertTruth, type InsertDare, type InsertPoint, type InsertBucketlist
} from "@shared/schema";

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private dbName = "relationtrack";
  private connected = false;

  constructor(uri: string) {
    this.client = new MongoClient(uri, {
      // Add MongoDB connection options for better reliability
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      maxConnecting: 1,
    });
  }

  async connect() {
    if (this.connected) return;

    try {
      await this.client.connect();
      // Test the connection by making a simple query
      await this.client.db(this.dbName).command({ ping: 1 });
      this.connected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  private get db() {
    if (!this.connected) {
      throw new Error("MongoDB is not connected");
    }
    return this.client.db(this.dbName);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const docs = await this.db.collection("tasks").find().toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      points: doc.points,
      completed: doc.completed,
      completedAt: doc.completedAt,
      assignedTo: doc.assignedTo,
    }));
  }

  async getTasksByPartner(partner: string): Promise<Task[]> {
    const docs = await this.db.collection("tasks")
      .find({ assignedTo: partner })
      .toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      points: doc.points,
      completed: doc.completed,
      completedAt: doc.completedAt,
      assignedTo: doc.assignedTo,
    }));
  }

  async createTask(task: InsertTask): Promise<Task> {
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
      assignedTo: newTask.assignedTo,
    };
  }

  async completeTask(id: string): Promise<Task> {
    const task = await this.db.collection("tasks").findOne({ _id: new ObjectId(id) });
    if (!task) throw new Error("Task not found");

    const updatedTask = {
      ...task,
      completed: true,
      completedAt: new Date()
    };

    await this.db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true, completedAt: new Date() } }
    );

    // Add points
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
      completedAt: new Date(),
      assignedTo: task.assignedTo,
    };
  }

  // Game
  async getTruths(intensity?: number): Promise<Truth[]> {
    const query = intensity ? { intensity } : {};
    const docs = await this.db.collection("truths").find(query).toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      question: doc.question,
      intensity: doc.intensity,
      cost: doc.cost,
      createdBy: doc.createdBy,
    }));
  }

  async getDares(intensity?: number): Promise<Dare[]> {
    const query = intensity ? { intensity } : {};
    const docs = await this.db.collection("dares").find(query).toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      challenge: doc.challenge,
      intensity: doc.intensity,
      cost: doc.cost,
      createdBy: doc.createdBy,
    }));
  }

  async createTruth(truth: InsertTruth): Promise<Truth> {
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
      createdBy: newTruth.createdBy,
    };
  }

  async createDare(dare: InsertDare): Promise<Dare> {
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
      createdBy: newDare.createdBy,
    };
  }

  // Points
  async getPoints(partner?: string): Promise<Point[]> {
    const query = partner ? { partner } : {};
    const docs = await this.db.collection("points")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      amount: doc.amount,
      reason: doc.reason,
      partner: doc.partner,
      createdAt: doc.createdAt,
    }));
  }

  async addPoints(points: InsertPoint): Promise<Point> {
    const newPoint = {
      ...points,
      createdAt: new Date(),
      _id: new ObjectId()
    };
    await this.db.collection("points").insertOne(newPoint);
    return {
      id: newPoint._id.toHexString(),
      amount: newPoint.amount,
      reason: newPoint.reason,
      partner: newPoint.partner,
      createdAt: newPoint.createdAt,
    };
  }

  async getTotalPoints(partner: string): Promise<number> {
    const result = await this.db.collection("points").aggregate([
      { $match: { partner } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  // Bucketlist
  async getBucketlist(): Promise<Bucketlist[]> {
    const docs = await this.db.collection("bucketlist")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(doc => ({
      id: doc._id.toHexString(),
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      completedAt: doc.completedAt,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
    }));
  }

  async createBucketlistItem(item: InsertBucketlist): Promise<Bucketlist> {
    const newItem = {
      ...item,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
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
      createdAt: newItem.createdAt,
    };
  }

  async completeBucketlistItem(id: string): Promise<Bucketlist> {
    const item = await this.db.collection("bucketlist").findOne({ _id: new ObjectId(id) });
    if (!item) throw new Error("Bucketlist item not found");

    await this.db.collection("bucketlist").updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true, completedAt: new Date() } }
    );

    return {
      id: item._id.toHexString(),
      title: item.title,
      description: item.description,
      completed: true,
      completedAt: new Date(),
      createdBy: item.createdBy,
      createdAt: item.createdAt,
    };
  }
}