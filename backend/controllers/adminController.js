const pool = require('../config/db');
async function list(req, res) {
  const { search = '', status = '', category = '' } = req.query;
  const [rows] = await pool.execute(`SELECT c.id, c.category, c.title, c.status, c.assigned_department, c.due_date, c.created_at, s.student_id AS student_number, s.name AS student_name FROM complaints c JOIN students s ON s.id = c.student_id WHERE (c.title LIKE ? OR s.name LIKE ? OR s.student_id LIKE ?) AND (? = '' OR c.status = ?) AND (? = '' OR c.category = ?) ORDER BY c.created_at DESC`, [`%${search}%`, `%${search}%`, `%${search}%`, status, status, category, category]);
  res.json(rows);
}
async function dashboard(req, res) {
  const [rows] = await pool.execute('SELECT status, COUNT(*) AS count FROM complaints GROUP BY status');
  const stats = { total: 0, Pending: 0, 'Under Review': 0, 'In Progress': 0, Resolved: 0, Rejected: 0, Closed: 0 };
  rows.forEach(row => { stats[row.status] = row.count; stats.total += row.count; });
  res.json(stats);
}
async function students(req, res) {
  const { search = '' } = req.query;
  const [rows] = await pool.execute(`SELECT s.id, s.student_id, s.name, s.email, s.department, s.year, s.phone, s.created_at, COUNT(c.id) AS complaint_count FROM students s LEFT JOIN complaints c ON c.student_id = s.id WHERE s.name LIKE ? OR s.email LIKE ? OR s.student_id LIKE ? GROUP BY s.id ORDER BY s.created_at DESC`, [`%${search}%`, `%${search}%`, `%${search}%`]);
  res.json(rows);
}
async function updateStudent(req, res) {
  const { name, email, department, year, phone } = req.body;
  if (!name || !email || !department || !year) return res.status(400).json({ message: 'Name, email, department, and year are required.' });
  try {
    const [result] = await pool.execute('UPDATE students SET name = ?, email = ?, department = ?, year = ?, phone = ? WHERE id = ?', [name, email, department, year, phone || null, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student updated.' });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'That email is already in use.' : 'Student update failed.' });
  }
}
async function removeStudent(req, res) {
  const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Student not found.' });
  res.json({ message: 'Student and their complaints deleted.' });
}
module.exports = { list, dashboard, students, updateStudent, removeStudent };
