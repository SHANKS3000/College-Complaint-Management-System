const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Complaint portal running at http://localhost:${port}`));
