require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
});

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // Ensure foreign keys are enforced
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    connection.release();
  }
}

// Helper: authenticate requests via JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Helper: only allow admin email to access certain routes
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

// Utility to generate JWT
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.email === 'admin@example.com',
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/* =========================
   Authentication routes
   ========================= */

// Register a new user
app.post('/api/v1/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  try {
    const conn = await pool.getConnection();
    try {
      // Check if email already exists
      const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        return res.status(400).json({ message: 'Email is already registered.' });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await conn.query(
        'INSERT INTO users (name, email, password, token_balance, join_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
        [name, email, hashedPassword, 100, 'active']
      );
      const newUser = { id: result.insertId, name, email, token_balance: 100 };
      const token = generateToken(newUser);
      res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, tokenBalance: newUser.token_balance }, token });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login user
app.post('/api/v1/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(400).json({ message: 'User not found.' });
      }
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ message: 'Invalid password.' });
      }
      const token = generateToken(user);
      res.json({ user: { id: user.id, name: user.name, email: user.email, tokenBalance: user.token_balance }, token });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Validate current user (client uses this to sync local user)
app.get('/api/v1/current-user', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, name, email, token_balance FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid session.' });
      }
      const user = rows[0];
      res.json({ name: user.name, email: user.email, tokenBalance: user.token_balance });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   User Management
   ========================= */

// Get list of all users (admin only)
app.get('/api/v1/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT id, name, email, DATE_FORMAT(join_date, "%Y-%m-%d") as joinDate, token_balance as tokenBalance, status FROM users'
      );
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get user by id (admin only)
app.get('/api/v1/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, name, email, DATE_FORMAT(join_date, "%Y-%m-%d") as joinDate, token_balance as tokenBalance, status FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
      res.json(rows[0]);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add new user (admin only)
app.post('/api/v1/users', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password, tokenBalance } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  const balance = parseInt(tokenBalance) || 0;
  try {
    const conn = await pool.getConnection();
    try {
      const [exists] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
      if (exists.length > 0) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await conn.query('INSERT INTO users (name, email, password, token_balance, join_date, status) VALUES (?, ?, ?, ?, NOW(), ?)', [name, email, hashedPassword, balance, 'active']);
      res.json({ id: result.insertId, name, email, tokenBalance: balance, joinDate: new Date().toISOString().split('T')[0], status: 'active' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update user (admin only)
app.put('/api/v1/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { name, tokenBalance, status } = req.body;
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
      await conn.query('UPDATE users SET name = COALESCE(?, name), token_balance = COALESCE(?, token_balance), status = COALESCE(?, status) WHERE id = ?', [name, tokenBalance, status, userId]);
      const [updated] = await conn.query('SELECT id, name, email, DATE_FORMAT(join_date, "%Y-%m-%d") as joinDate, token_balance as tokenBalance, status FROM users WHERE id = ?', [userId]);
      res.json(updated[0]);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete user (admin only)
app.delete('/api/v1/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM users WHERE id = ?', [userId]);
      res.json({ success: true, id: Number(userId) });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   Conversations & Messages
   ========================= */

// Get conversations for current user
app.get('/api/v1/conversations', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      // Admin sees all conversations; users see only their own
      const userFilter = req.user.isAdmin ? '' : 'WHERE c.user_id = ?';
      const params = req.user.isAdmin ? [] : [req.user.id];
      // Fetch conversations along with their messages
      const [convos] = await conn.query(
        `SELECT c.id, c.user_id as userId, c.marja_name as marja, c.title,
                m.id as messageId, m.sender, m.text, m.timestamp, m.status
         FROM conversations c
         LEFT JOIN messages m ON m.conversation_id = c.id
         ${userFilter}
         ORDER BY c.updated_at DESC, m.timestamp ASC`,
        params
      );
      // Transform flat result into nested structure
      const map = {};
      for (const row of convos) {
        if (!map[row.id]) {
          map[row.id] = {
            id: row.id,
            userId: row.userId,
            marja: row.marja,
            title: row.title,
            messages: [],
          };
        }
        if (row.messageId) {
          map[row.id].messages.push({
            id: row.messageId,
            sender: row.sender,
            text: row.text,
            timestamp: row.timestamp,
            status: row.status,
          });
        }
      }
      const result = Object.values(map);
      res.json(result);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get conversation messages
app.get('/api/v1/conversations/:id', authenticateToken, async (req, res) => {
  const convoId = req.params.id;
  try {
    const conn = await pool.getConnection();
    try {
      // verify conversation belongs to user or admin
      const [convRows] = await conn.query('SELECT id, user_id as userId, marja_name as marja, title FROM conversations WHERE id = ?', [convoId]);
      if (convRows.length === 0) return res.status(404).json({ message: 'Conversation not found.' });
      const convo = convRows[0];
      if (!req.user.isAdmin && convo.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      const [messages] = await conn.query('SELECT id, sender, text, timestamp, status FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [convoId]);
      res.json({ ...convo, messages });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create new conversation or send message to existing conversation
app.post('/api/v1/messages', authenticateToken, async (req, res) => {
  const { conversationId, marjaName, message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message content required.' });
  const userId = req.user.id;
  try {
    const conn = await pool.getConnection();
    try {
      let convoId = conversationId;
      // Start a transaction
      await conn.beginTransaction();
      if (!convoId) {
        // Create new conversation
        convoId = uuidv4();
        const title = message.substring(0, 40);
        await conn.query('INSERT INTO conversations (id, user_id, marja_name, title, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [convoId, userId, marjaName || null, title]);
      } else {
        // Ensure conversation belongs to user (unless admin)
        const [convRows] = await conn.query('SELECT user_id FROM conversations WHERE id = ?', [convoId]);
        if (convRows.length === 0) {
          await conn.rollback();
          return res.status(404).json({ message: 'Conversation not found.' });
        }
        if (!req.user.isAdmin && convRows[0].user_id !== userId) {
          await conn.rollback();
          return res.status(403).json({ message: 'Forbidden.' });
        }
        await conn.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [convoId]);
      }
      // Deduct a token from user token balance
      await conn.query('UPDATE users SET token_balance = GREATEST(token_balance - 1, 0) WHERE id = ?', [userId]);
      // Insert user message
      const messageId = uuidv4();
      await conn.query('INSERT INTO messages (id, conversation_id, sender, text, timestamp, status) VALUES (?, ?, ?, ?, NOW(), ?)', [messageId, convoId, 'user', message, 'sent']);
      // Insert AI response (simulate)
      const aiMessageId = uuidv4();
      const aiResponse = `پاسخ شبیه‌سازی شده برای سوال شما در مورد "${message}".`;
      await conn.query('INSERT INTO messages (id, conversation_id, sender, text, timestamp, status) VALUES (?, ?, ?, ?, NOW(), ?)', [aiMessageId, convoId, 'ai', aiResponse, 'sent']);
      await conn.commit();
      // Return updated conversation with messages
      const [messagesRows] = await conn.query('SELECT id, sender, text, timestamp, status FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [convoId]);
      res.json({ id: convoId, userId, marja: marjaName, title: message.substring(0, 40), messages: messagesRows });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   Reports
   ========================= */

// Get reports (admin only)
app.get('/api/v1/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT r.id, u.email, r.ip, r.marja, r.conversation_id as conversationId, r.feedback, DATE_FORMAT(r.date, "%Y-%m-%d") as date, r.report_text as reportText, r.category, r.refunded, r.status FROM reports r JOIN users u ON r.user_id = u.id'
      );
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get report details (admin only)
app.get('/api/v1/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  const reportId = req.params.id;
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT r.*, u.email FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = ?', [reportId]
      );
      if (rows.length === 0) return res.status(404).json({ message: 'Report not found.' });
      // Also fetch conversation messages
      const report = rows[0];
      const [conv] = await conn.query('SELECT id, user_id, marja_name as marja, title FROM conversations WHERE id = ?', [report.conversation_id]);
      const [messages] = await conn.query('SELECT id, sender, text, timestamp, status FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [report.conversation_id]);
      res.json({ ...report, conversation: { ...conv[0], messages } });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update report (admin only)
app.put('/api/v1/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  const reportId = req.params.id;
  const { status, refunded, category } = req.body;
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM reports WHERE id = ?', [reportId]);
      if (rows.length === 0) return res.status(404).json({ message: 'Report not found.' });
      const report = rows[0];
      await conn.beginTransaction();
      await conn.query('UPDATE reports SET status = COALESCE(?, status), refunded = COALESCE(?, refunded), category = COALESCE(?, category) WHERE id = ?', [status, refunded, category, reportId]);
      // If refunding token, add token back to user
      if (refunded === true && !report.refunded) {
        await conn.query('UPDATE users SET token_balance = token_balance + 1 WHERE id = ?', [report.user_id]);
      }
      await conn.commit();
      const [updated] = await conn.query('SELECT * FROM reports WHERE id = ?', [reportId]);
      res.json(updated[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   Admin Logs
   ========================= */

// Get admin logs (admin only)
app.get('/api/v1/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, admin_name as adminName, action, timestamp FROM admin_logs ORDER BY timestamp DESC');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add admin log (admin only)
app.post('/api/v1/logs', authenticateToken, requireAdmin, async (req, res) => {
  const { adminName, action } = req.body;
  if (!adminName || !action) return res.status(400).json({ message: 'adminName and action are required.' });
  try {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query('INSERT INTO admin_logs (admin_name, action, timestamp) VALUES (?, ?, NOW())', [adminName, action]);
      res.json({ id: result.insertId, adminName, action, timestamp: new Date().toISOString() });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   Financials
   ========================= */

// Get token packages (admin only)
app.get('/api/v1/token-packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, name, tokens, price, special FROM token_packages');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get discount codes (admin only)
app.get('/api/v1/discount-codes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, code, value, DATE_FORMAT(expiry, "%Y-%m-%d") as expiry, usage_limit as usageLimit, used_count as usedCount FROM discount_codes');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get gift cards (admin only)
app.get('/api/v1/gift-cards', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT id, title, code, tokens, used_by as usedBy FROM gift_cards');
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get transactions (admin only)
app.get('/api/v1/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        'SELECT t.id, u.email as userEmail, p.name as packageName, t.amount, t.status, DATE_FORMAT(t.date, "%Y-%m-%d") as date FROM transactions t JOIN users u ON t.user_id = u.id JOIN token_packages p ON t.package_id = p.id'
      );
      res.json(rows);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* =========================
   Settings
   ========================= */

// Return app settings (public)
app.get('/api/v1/settings', async (req, res) => {
  // In a real app these would be loaded from DB. For simplicity, return static settings.
  const settings = {
    logoUrl: null,
    adminAvatarUrl: null,
    defaultUserAvatarUrl: null,
    ai: {
      systemInstruction: 'You are a helpful, spiritual assistant with a calm and modern tone. Respond in Persian.',
      temperature: 0.7,
      suggestedPrompts: [
        'حکم شرعی گوش دادن به موسیقی چیست؟',
        'آیا پرداخت خمس بر حقوق کارمندان واجب است؟',
        'شرایط و نحوه خواندن نماز آیات چگونه است؟',
        'حکم روزه گرفتن در سفرهای کوتاه مدت چیست؟'
      ],
    },
    spiritualGift: {
      enabled: true,
      cooldownSeconds: 60,
      tokensPerClick: 1,
      maxDailyTokens: 10,
    },
    defaultUserTokens: 100,
    paymentGatewayLogo1: null,
    paymentGatewayLogo2: null,
    maraji: [
      { id: 1, name: 'آیت‌الله خامنه‌ای', active: true },
      { id: 2, name: 'آیت‌الله سیستانی', active: true },
      { id: 3, name: 'آیت‌الله مکارم شیرازی', active: true },
      { id: 4, name: 'آیت‌الله وحید خراسانی', active: false },
    ],
    seo: {
      title: 'پلتفرم چت مدرن',
      description: 'یک پلتفرم چت مدرن و معنوی با استفاده از هوش مصنوعی.',
      keywords: 'چت, هوش مصنوعی, معنوی, مدرن',
      faviconUrl: null,
    },
    loginPage: {
      title: 'به پلتفرم خوش آمدید',
      subtitle: 'برای ورود به پنل ادمین از ایمیل <code class="dir-ltr inline-block bg-gray-200 px-1 rounded text-sm">admin@example.com</code> و برای کاربر عادی از هر ایمیل دیگری استفاده کنید.',
      logoUrl: null,
    },
    shareCardTemplate: '',
    fontSettings: {
      uploadedFamilies: [],
      application: { body: 'default', headings: 'default', chatInput: 'default', shareCard: 'default' },
    },
  };
  res.json(settings);
});

// Update settings (admin only)
app.put('/api/v1/settings', authenticateToken, requireAdmin, async (req, res) => {
  // In a real app this would update DB. Here, just return success.
  res.json({ message: 'Settings updated successfully' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });