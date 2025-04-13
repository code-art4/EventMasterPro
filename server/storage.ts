import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  events, Event, InsertEvent,
  ticketTypes, TicketType, InsertTicketType,
  purchases, Purchase, InsertPurchase,
  purchaseItems, PurchaseItem, InsertPurchaseItem,
  EventWithDetails, PurchaseWithDetails
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Event operations
  getEvents(options?: { categoryId?: number, search?: string }): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  getTrendingEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventWithDetails(id: number): Promise<EventWithDetails | undefined>;
  getEventsByOrganizer(organizerId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;

  // Ticket type operations
  getTicketTypesByEvent(eventId: number): Promise<TicketType[]>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  updateTicketTypeAvailability(id: number, available: number): Promise<TicketType | undefined>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase>;
  getPurchasesByUser(userId: number): Promise<PurchaseWithDetails[]>;
  getPurchaseById(id: number): Promise<Purchase | undefined>;
  getPurchaseWithDetails(id: number): Promise<PurchaseWithDetails | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private events: Map<number, Event>;
  private ticketTypes: Map<number, TicketType>;
  private purchases: Map<number, Purchase>;
  private purchaseItems: Map<number, PurchaseItem[]>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private eventIdCounter: number;
  private ticketTypeIdCounter: number;
  private purchaseIdCounter: number;
  private purchaseItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.events = new Map();
    this.ticketTypes = new Map();
    this.purchases = new Map();
    this.purchaseItems = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.eventIdCounter = 1;
    this.ticketTypeIdCounter = 1;
    this.purchaseIdCounter = 1;
    this.purchaseItemIdCounter = 1;

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Concerts", icon: "music" },
      { name: "Theater", icon: "masks-theater" },
      { name: "Sports", icon: "futbol" },
      { name: "Food & Drink", icon: "utensils" },
      { name: "Workshops", icon: "graduation-cap" },
    ];

    defaultCategories.forEach(category => this.createCategory(category));
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "password123",
      email: "admin@example.com",
      fullName: "Admin User",
      isOrganizer: true,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create sample events
    this.createEvent({
      title: "Summer Music Festival 2023",
      description: "Join us for three days of amazing music featuring top artists, great food, and unforgettable experiences. The Summer Music Festival brings together the hottest acts in pop, rock, hip-hop, and electronic music for an unforgettable weekend.",
      imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      location: "Grand Park, Los Angeles, CA",
      startDate: new Date("2023-08-15"),
      endDate: new Date("2023-08-17"),
      organizerId: 1,
      categoryId: 1,
      isFeatured: true,
      isTrending: true,
      hasSeating: true,
      seatingMap: {
        rows: 10,
        cols: 20,
        unavailableSeats: [[2, 3], [2, 4], [5, 9], [5, 10]]
      },
    });

    this.createEvent({
      title: "NBA Finals 2023 - Game 7",
      description: "Witness history in the making as the two best teams in basketball face off in this decisive game.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      location: "Boston, MA",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-06-10"),
      organizerId: 1,
      categoryId: 3,
      isFeatured: false,
      isTrending: true,
      hasSeating: true,
      seatingMap: {
        rows: 20,
        cols: 30,
        unavailableSeats: []
      },
    });

    this.createEvent({
      title: "Taylor Swift: The Eras Tour",
      description: "Experience Taylor Swift's record-breaking tour celebrating all musical eras of her career.",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      location: "New York, NY",
      startDate: new Date("2023-07-22"),
      endDate: new Date("2023-07-22"),
      organizerId: 1,
      categoryId: 1,
      isFeatured: true,
      isTrending: true,
      hasSeating: true,
      seatingMap: {
        rows: 15,
        cols: 25,
        unavailableSeats: []
      },
    });

    this.createEvent({
      title: "International Food Festival",
      description: "Taste cuisine from over 30 countries, watch cooking demonstrations, and enjoy live entertainment.",
      imageUrl: "https://images.unsplash.com/photo-1560439514-e960a3ef5019?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      location: "Chicago, IL",
      startDate: new Date("2023-09-08"),
      endDate: new Date("2023-09-10"),
      organizerId: 1,
      categoryId: 4,
      isFeatured: false,
      isTrending: true,
      hasSeating: false,
      seatingMap: null,
    });

    // Create ticket types for events
    this.createTicketType({
      eventId: 1,
      name: "General Admission",
      description: "Access to all three days, general areas",
      price: 99,
      quantity: 1000,
      available: 850,
    });

    this.createTicketType({
      eventId: 1,
      name: "VIP Package",
      description: "Premium viewing areas, exclusive lounges, merchandise",
      price: 199,
      quantity: 200,
      available: 150,
    });

    this.createTicketType({
      eventId: 2,
      name: "Standard Seating",
      description: "Standard seating for the game",
      price: 180,
      quantity: 5000,
      available: 3200,
    });

    this.createTicketType({
      eventId: 2,
      name: "Premium Seating",
      description: "Premium seating with better views",
      price: 350,
      quantity: 2000,
      available: 1500,
    });

    this.createTicketType({
      eventId: 2,
      name: "Courtside",
      description: "Courtside seats for the ultimate experience",
      price: 1200,
      quantity: 100,
      available: 20,
    });

    this.createTicketType({
      eventId: 3,
      name: "Standard Ticket",
      description: "Standard admission",
      price: 95,
      quantity: 10000,
      available: 5000,
    });

    this.createTicketType({
      eventId: 3,
      name: "VIP Experience",
      description: "VIP package with merchandise and early entry",
      price: 450,
      quantity: 1000,
      available: 300,
    });

    this.createTicketType({
      eventId: 4,
      name: "One Day Pass",
      description: "Access for one day of your choice",
      price: 25,
      quantity: 5000,
      available: 4200,
    });

    this.createTicketType({
      eventId: 4,
      name: "Full Weekend Pass",
      description: "Access for all three days",
      price: 75,
      quantity: 2000,
      available: 1800,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Event operations
  async getEvents(options?: { categoryId?: number, search?: string }): Promise<Event[]> {
    let events = Array.from(this.events.values());
    
    if (options?.categoryId) {
      events = events.filter(event => event.categoryId === options.categoryId);
    }
    
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchLower) || 
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }
    
    return events;
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isFeatured);
  }

  async getTrendingEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isTrending);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventWithDetails(id: number): Promise<EventWithDetails | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const organizer = this.users.get(event.organizerId);
    const category = this.categories.get(event.categoryId);
    const ticketTypes = await this.getTicketTypesByEvent(id);

    if (!organizer || !category) return undefined;

    return {
      ...event,
      organizer,
      category,
      ticketTypes
    };
  }

  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      event => event.organizerId === organizerId
    );
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const newEvent: Event = { ...event, id, createdAt: new Date() };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Ticket type operations
  async getTicketTypesByEvent(eventId: number): Promise<TicketType[]> {
    return Array.from(this.ticketTypes.values()).filter(
      ticketType => ticketType.eventId === eventId
    );
  }

  async createTicketType(ticketType: InsertTicketType): Promise<TicketType> {
    const id = this.ticketTypeIdCounter++;
    const newTicketType: TicketType = { ...ticketType, id };
    this.ticketTypes.set(id, newTicketType);
    return newTicketType;
  }

  async updateTicketTypeAvailability(id: number, available: number): Promise<TicketType | undefined> {
    const ticketType = this.ticketTypes.get(id);
    if (!ticketType) return undefined;

    const updatedTicketType = { ...ticketType, available };
    this.ticketTypes.set(id, updatedTicketType);
    return updatedTicketType;
  }

  // Purchase operations
  async createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const newPurchase: Purchase = { 
      ...purchase, 
      id, 
      purchaseDate: new Date(),
      status: "completed" 
    };
    this.purchases.set(id, newPurchase);

    // Create purchase items
    const purchaseItems: PurchaseItem[] = items.map(item => {
      const itemId = this.purchaseItemIdCounter++;
      return { ...item, id: itemId, purchaseId: id };
    });
    this.purchaseItems.set(id, purchaseItems);

    // Update ticket type availability
    for (const item of items) {
      const ticketType = this.ticketTypes.get(item.ticketTypeId);
      if (ticketType) {
        const newAvailable = Math.max(0, ticketType.available - item.quantity);
        this.updateTicketTypeAvailability(item.ticketTypeId, newAvailable);
      }
    }

    return newPurchase;
  }

  async getPurchasesByUser(userId: number): Promise<PurchaseWithDetails[]> {
    const userPurchases = Array.from(this.purchases.values()).filter(
      purchase => purchase.userId === userId
    );

    const purchasesWithDetails = await Promise.all(
      userPurchases.map(async purchase => {
        return this.getPurchaseWithDetails(purchase.id);
      })
    );

    return purchasesWithDetails.filter((p): p is PurchaseWithDetails => p !== undefined);
  }

  async getPurchaseById(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchaseWithDetails(id: number): Promise<PurchaseWithDetails | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;

    const event = this.events.get(purchase.eventId);
    if (!event) return undefined;

    const purchaseItemsList = this.purchaseItems.get(id) || [];
    const items = purchaseItemsList.map(item => {
      const ticketType = this.ticketTypes.get(item.ticketTypeId);
      if (!ticketType) throw new Error(`Ticket type ${item.ticketTypeId} not found`);
      return { ...item, ticketType };
    });

    return {
      ...purchase,
      event,
      items
    };
  }
}

export const storage = new MemStorage();
