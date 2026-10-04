const bcrypt = require('bcrypt');
const pool = require('../config/db');

const cleanUser = (user, role) => ({ id: user.id, name: user.name, email: user.email, role, studentId: user.student_id, department: user.department });

async function register(req, res) {
  const { studentId, name, email, password, department, year, phone } = req.body;
  if (!studentId || !name || !email || !password || !department || !year || password.length < 6) return res.status(400).json({ message: 'Complete all fields. Password must be at least 6 characters.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO students (student_id, name, email, password, department, year, phone) VALUES (?, ?, ?, ?, ?, ?, ?)', [studentId, name, email, hash, department, year, phone || null]);
    req.session.user = { id: result.insertId, name, email, role: 'student', studentId, department };
    res.status(201).json({ user: req.session.user });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'Student ID or email already exists.' : 'Registration failed.' });
  }
}

async function login(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password || !['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Email, password, and role are required.' });
  try {
    const table = role === 'admin' ? 'admins' : 'students';
    const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE email = ? LIMIT 1`, [email]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password))) return res.status(401).json({ message: 'Invalid email or password.' });
    req.session.user = cleanUser(rows[0], role);
    res.json({ user: req.session.user });
  } catch (error) { res.status(500).json({ message: 'Login failed.' }); }
}

function logout(req, res) { req.session.destroy(() => res.json({ message: 'Logged out.' })); }
function me(req, res) { res.json({ user: req.session.user || null }); }
module.exports = { register, login, logout, me };
