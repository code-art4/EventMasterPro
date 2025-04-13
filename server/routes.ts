import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import passportLocal from "passport-local";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertTicketTypeSchema, 
  insertPurchaseSchema, 
  insertPurchaseItemSchema,
  User 
} from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      secret: process.env.SESSION_SECRET || "eventify-secret",
      saveUninitialized: false,
    })
  );

  // Configure passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new passportLocal.Strategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const newUser = await storage.createUser(userData);
      
      // Auto login the user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in" });
        }
        return res.status(201).json({ user: newUser });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      
      const events = await storage.getEvents({ categoryId, search });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (req, res) => {
    try {
      const featuredEvents = await storage.getFeaturedEvents();
      res.json(featuredEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.get("/api/events/trending", async (req, res) => {
    try {
      const trendingEvents = await storage.getTrendingEvents();
      res.json(trendingEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = Number(req.params.id);
      const event = await storage.getEventWithDetails(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      if (!user.isOrganizer) {
        return res.status(403).json({ message: "Only organizers can create events" });
      }
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: user.id
      });
      
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events/organizer/me", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const events = await storage.getEventsByOrganizer(user.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer events" });
    }
  });

  // Ticket type routes
  app.get("/api/events/:eventId/ticket-types", async (req, res) => {
    try {
      const eventId = Number(req.params.eventId);
      const ticketTypes = await storage.getTicketTypesByEvent(eventId);
      res.json(ticketTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket types" });
    }
  });

  app.post("/api/events/:eventId/ticket-types", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const eventId = Number(req.params.eventId);
      
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.organizerId !== user.id) {
        return res.status(403).json({ message: "Only the event organizer can add ticket types" });
      }
      
      const ticketTypeData = insertTicketTypeSchema.parse({
        ...req.body,
        eventId
      });
      
      const newTicketType = await storage.createTicketType(ticketTypeData);
      res.status(201).json(newTicketType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create ticket type" });
    }
  });

  // Purchase routes
  app.post("/api/purchases", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      const { purchase, items } = req.body;
      const purchaseData = insertPurchaseSchema.parse({
        ...purchase,
        userId: user.id
      });
      
      // Validate each purchase item
      const parsedItems = [];
      for (const item of items) {
        const parsedItem = insertPurchaseItemSchema.parse(item);
        parsedItems.push(parsedItem);
        
        // Check ticket availability
        const ticketType = await storage.getTicketTypesByEvent(purchaseData.eventId)
          .then(types => types.find(t => t.id === parsedItem.ticketTypeId));
        
        if (!ticketType) {
          return res.status(400).json({ message: `Ticket type ${parsedItem.ticketTypeId} not found` });
        }
        
        if (ticketType.available < parsedItem.quantity) {
          return res.status(400).json({ message: `Not enough tickets available for ${ticketType.name}` });
        }
      }
      
      const newPurchase = await storage.createPurchase(purchaseData, parsedItems);
      const purchaseWithDetails = await storage.getPurchaseWithDetails(newPurchase.id);
      
      res.status(201).json(purchaseWithDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  app.get("/api/purchases/me", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const purchases = await storage.getPurchasesByUser(user.id);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get("/api/purchases/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const purchaseId = Number(req.params.id);
      
      const purchase = await storage.getPurchaseWithDetails(purchaseId);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      if (purchase.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
