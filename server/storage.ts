import { 
  type Task, type Truth, type Dare, type Point, type Bucketlist, type Coupon, type Attraction,
  type InsertTask, type InsertTruth, type InsertDare, type InsertPoint, type InsertBucketlist,
  type InsertCoupon, type InsertAttraction
} from "@shared/schema";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  completeTask(id: string): Promise<Task>;
  deleteTask(id: string): Promise<void>; 
  // Game
  getTruths(intensity?: number): Promise<Truth[]>;
  getDares(intensity?: number): Promise<Dare[]>;
  createTruth(truth: InsertTruth): Promise<Truth>;
  createDare(dare: InsertDare): Promise<Dare>;
  // Points
  getPoints(partner?: string): Promise<Point[]>;
  addPoints(points: InsertPoint): Promise<Point>;
  getTotalPoints(partner: string): Promise<number>;
  // Bucketlist
  getBucketlist(): Promise<Bucketlist[]>;
  createBucketlistItem(item: InsertBucketlist): Promise<Bucketlist>;
  completeBucketlistItem(id: string): Promise<Bucketlist>;
  // Love Coupons
  getCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  redeemCoupon(id: string): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>; // New method
  // Attractions
  getAttractions(): Promise<Attraction[]>;
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private truths: Map<string, Truth>;
  private dares: Map<string, Dare>;
  private points: Map<string, Point>;
  private bucketlist: Map<string, Bucketlist>;
  private coupons: Map<string, Coupon>;
  private attractions: Map<string, Attraction>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.tasks = new Map();
    this.truths = new Map();
    this.dares = new Map();
    this.points = new Map();
    this.bucketlist = new Map();
    this.coupons = new Map();
    this.attractions = new Map();
    this.currentIds = { 
      tasks: 1, truths: 1, dares: 1, points: 1, 
      bucketlist: 1, coupons: 1, attractions: 1 
    };

    // Seed initial truths and dares
    this.seedGameData();
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = `task_${this.currentIds.tasks++}`;
    const newTask: Task = {
      id,
      title: task.title,
      description: task.description || null,
      points: task.points,
      completed: false,
      completedAt: null,
      assignedTo: task.assignedTo,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async completeTask(id: string): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");

    const updatedTask: Task = {
      ...task,
      completed: true,
      completedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);

    // Add points for completing task
    await this.addPoints({
      amount: task.points,
      reason: `Completed task: ${task.title}`,
      partner: task.assignedTo,
    });

    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    this.tasks.delete(id);
  }

  async getTruths(intensity?: number): Promise<Truth[]> {
    let truths = Array.from(this.truths.values());
    if (intensity) {
      truths = truths.filter(t => t.intensity === intensity);
    }
    return truths;
  }

  async getDares(intensity?: number): Promise<Dare[]> {
    let dares = Array.from(this.dares.values());
    if (intensity) {
      dares = dares.filter(d => d.intensity === intensity);
    }
    return dares;
  }

  async createTruth(truth: InsertTruth): Promise<Truth> {
    const id = `truth_${this.currentIds.truths++}`;
    const newTruth: Truth = {
      id,
      question: truth.question,
      intensity: truth.intensity,
      cost: truth.cost || 5,
      createdBy: truth.createdBy,
    };
    this.truths.set(id, newTruth);
    return newTruth;
  }

  async createDare(dare: InsertDare): Promise<Dare> {
    const id = `dare_${this.currentIds.dares++}`;
    const newDare: Dare = {
      id,
      challenge: dare.challenge,
      intensity: dare.intensity,
      cost: dare.cost || 10,
      createdBy: dare.createdBy,
    };
    this.dares.set(id, newDare);
    return newDare;
  }

  async getPoints(partner?: string): Promise<Point[]> {
    let points = Array.from(this.points.values());
    if (partner) {
      points = points.filter(p => p.partner === partner);
    }
    return points;
  }

  async addPoints(pointData: InsertPoint): Promise<Point> {
    const id = `point_${this.currentIds.points++}`;
    const point: Point = {
      id,
      amount: pointData.amount,
      reason: pointData.reason,
      partner: pointData.partner,
      createdAt: new Date(),
    };
    this.points.set(id, point);
    return point;
  }

  async getTotalPoints(partner: string): Promise<number> {
    return Array.from(this.points.values())
      .filter(p => p.partner === partner)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  async getBucketlist(): Promise<Bucketlist[]> {
    return Array.from(this.bucketlist.values());
  }

  async createBucketlistItem(item: InsertBucketlist): Promise<Bucketlist> {
    const id = `bucketlist_${this.currentIds.bucketlist++}`;
    const bucketlistItem: Bucketlist = {
      id,
      title: item.title,
      description: item.description || null,
      completed: false,
      completedAt: null,
      createdBy: item.createdBy,
      createdAt: new Date(),
    };
    this.bucketlist.set(id, bucketlistItem);
    return bucketlistItem;
  }

  async completeBucketlistItem(id: string): Promise<Bucketlist> {
    const item = this.bucketlist.get(id);
    if (!item) throw new Error("Bucketlist item not found");

    const updatedItem: Bucketlist = {
      ...item,
      completed: true,
      completedAt: new Date(),
    };
    this.bucketlist.set(id, updatedItem);
    return updatedItem;
  }

  // Love Coupons methods
  async getCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = `coupon_${this.currentIds.coupons++}`;
    const newCoupon: Coupon = {
      id,
      title: coupon.title,
      description: coupon.description || null,
      points: coupon.points,
      redeemed: false,
      redeemedAt: null,
      createdBy: coupon.createdBy,
      createdAt: new Date(),
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }

  async redeemCoupon(id: string): Promise<Coupon> {
    const coupon = this.coupons.get(id);
    if (!coupon) throw new Error("Coupon not found");
    if (coupon.redeemed) throw new Error("Coupon already redeemed");

    const updatedCoupon: Coupon = {
      ...coupon,
      redeemed: true,
      redeemedAt: new Date(),
    };
    this.coupons.set(id, updatedCoupon);

    // Deduct points when redeeming a coupon
    await this.addPoints({
      amount: -coupon.points,
      reason: `Redeemed coupon: ${coupon.title}`,
      partner: coupon.createdBy,
    });

    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = this.coupons.get(id);
    if (!coupon) throw new Error("Coupon not found");
    if (!coupon.redeemed) throw new Error("Cannot delete unredeemed coupon");
    this.coupons.delete(id);
  }

  // Attractions methods
  async getAttractions(): Promise<Attraction[]> {
    return Array.from(this.attractions.values());
  }

  async createAttraction(attraction: InsertAttraction): Promise<Attraction> {
    const id = `attraction_${this.currentIds.attractions++}`;
    const newAttraction: Attraction = {
      id,
      detail: attraction.detail,
      type: attraction.type,
      createdBy: attraction.createdBy,
      createdAt: new Date(),
    };
    this.attractions.set(id, newAttraction);
    return newAttraction;
  }

  private seedGameData() {
    // Seed some initial truths
    const truths: InsertTruth[] = [
      { question: "What's your favorite feature about your partner?", intensity: 1, createdBy: "partner1", cost: 5 },
      { question: "What was your first impression of me?", intensity: 1, createdBy: "partner2", cost: 5 },
      { question: "What's your most memorable date with me?", intensity: 2, createdBy: "partner1", cost: 10 },
      { question: "What's something you'd like to try together?", intensity: 3, createdBy: "partner2", cost: 15 },
      { question: "What's your biggest fantasy?", intensity: 4, createdBy: "partner1", cost: 20 },
    ];

    // Seed some initial dares
    const dares: InsertDare[] = [
      { challenge: "Give your partner a sweet compliment", intensity: 1, createdBy: "partner1", cost: 10 },
      { challenge: "Share a romantic dance together", intensity: 2, createdBy: "partner2", cost: 15 },
      { challenge: "Give your partner a 5-minute massage", intensity: 3, createdBy: "partner1", cost: 20 },
      { challenge: "Kiss your partner for 30 seconds", intensity: 3, createdBy: "partner2", cost: 25 },
      { challenge: "Whisper something seductive", intensity: 4, createdBy: "partner1", cost: 30 },
    ];

    truths.forEach(truth => {
      const id = `truth_${this.currentIds.truths++}`;
      this.truths.set(id, { ...truth, id });
    });

    dares.forEach(dare => {
      const id = `dare_${this.currentIds.dares++}`;
      this.dares.set(id, { ...dare, id });
    });
  }
}

export const storage = new MemStorage();