import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store
const store = {
  users: [] as any[],
  deposits: [] as any[],
  accounts: [
    { id: '1', type: 'bank', name: 'Chase Bank', accountNumber: '**** 4567', routingNumber: '021000021' },
    { id: '2', type: 'crypto', name: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }
  ] as any[],
  supportMessages: [] as any[]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    let user = store.users.find(u => u.email === email);
    if (!user) {
      user = {
        uid: Math.random().toString(36).substring(7),
        email,
        displayName: email.split('@')[0],
        buyingPower: 0,
        portfolioValue: 0,
        holdings: [],
        numericId: Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString()
      };
      store.users.push(user);
    }
    res.json({ user });
  });

  app.get("/api/users", (req, res) => {
    res.json(store.users);
  });

  app.patch("/api/users/:uid", (req, res) => {
    const { uid } = req.params;
    const updates = req.body;
    const index = store.users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      store.users[index] = { ...store.users[index], ...updates };
      res.json(store.users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Deposit/Withdrawal routes
  app.get("/api/deposits", (req, res) => {
    const { status, userId, type } = req.query;
    let deposits = store.deposits;
    if (status) deposits = deposits.filter(d => d.status === status);
    if (userId) deposits = deposits.filter(d => d.userId === userId);
    if (type) deposits = deposits.filter(d => d.type === type);
    res.json(deposits);
  });

  app.post("/api/deposits", (req, res) => {
    const deposit = {
      id: Math.random().toString(36).substring(7),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // If it's a withdrawal, we should check balance immediately (optional but good)
    if (deposit.type === 'withdrawal') {
      const userIndex = store.users.findIndex(u => u.uid === deposit.userId);
      if (userIndex !== -1 && store.users[userIndex].buyingPower < deposit.amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
    }
    
    store.deposits.push(deposit);
    res.json(deposit);
  });

  app.patch("/api/deposits/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = store.deposits.findIndex(d => d.id === id);
    if (index !== -1) {
      store.deposits[index].status = status;
      store.deposits[index].updatedAt = new Date().toISOString();
      
      if (status === 'completed') {
        const userIndex = store.users.findIndex(u => u.uid === store.deposits[index].userId);
        if (userIndex !== -1) {
          store.users[userIndex].buyingPower += Number(store.deposits[index].amount);
        }
      }
      res.json(store.deposits[index]);
    } else {
      res.status(404).json({ error: "Deposit not found" });
    }
  });

  // Account routes
  app.get("/api/accounts", (req, res) => {
    res.json(store.accounts);
  });

  app.post("/api/accounts", (req, res) => {
    const account = {
      id: Math.random().toString(36).substring(7),
      ...req.body
    };
    store.accounts.push(account);
    res.json(account);
  });

  app.delete("/api/accounts/:id", (req, res) => {
    const { id } = req.params;
    store.accounts = store.accounts.filter(a => a.id !== id);
    res.json({ success: true });
  });

  // Support routes
  app.get("/api/support", (req, res) => {
    const { userId } = req.query;
    let messages = store.supportMessages;
    if (userId) messages = messages.filter(m => m.userId === userId);
    res.json(messages);
  });

  app.post("/api/support", (req, res) => {
    const message = {
      id: Math.random().toString(36).substring(7),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    store.supportMessages.push(message);
    res.json(message);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
