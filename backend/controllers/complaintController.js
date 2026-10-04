const path = require('path');
const pool = require('../config/db');
const { sendComplaintStatusEmail } = require('../services/emailService');

async function listStudent(req, res) {
  const [rows] = await pool.execute('SELECT id, category, title, description, status, assigned_department, due_date, admin_remarks, attachment, created_at, updated_at, resolved_at FROM complaints WHERE student_id = ? ORDER BY created_at DESC', [req.session.user.id]);
  res.json(rows);
}
async function getOne(req, res) {
  const condition = req.session.user.role === 'student' ? 'c.student_id = ?' : '1 = 1';
  const params = req.session.user.role === 'student' ? [req.params.id, req.session.user.id] : [req.params.id];
  const [rows] = await pool.execute(`SELECT c.*, s.student_id AS student_number, s.name AS student_name, s.email AS student_email, s.department AS student_department FROM complaints c JOIN students s ON s.id = c.student_id WHERE c.id = ? AND ${condition}`, params);
  if (!rows[0]) return res.status(404).json({ message: 'Complaint not found.' });
  const [updates] = await pool.execute('SELECT u.*, a.name AS admin_name FROM complaint_updates u JOIN admins a ON a.id = u.admin_id WHERE complaint_id = ? ORDER BY created_at ASC', [req.params.id]);
  res.json({ complaint: rows[0], updates });
}
async function create(req, res) {
  const { category, title, description, assignedDepartment } = req.body;
  if (!category || !title || !description) return res.status(400).json({ message: 'Category, title, and description are required.' });
  const attachment = req.file ? path.basename(req.file.path) : null;
  const [result] = await pool.execute('INSERT INTO complaints (student_id, category, title, description, assigned_department, attachment) VALUES (?, ?, ?, ?, ?, ?)', [req.session.user.id, category, title, description, assignedDepartment || null, attachment]);
  await pool.execute('INSERT INTO complaint_updates (complaint_id, admin_id, old_status, new_status, remarks) SELECT ?, id, NULL, ?, ? FROM admins ORDER BY id LIMIT 1', [result.insertId, 'Pending', 'Complaint submitted by student.']);
  res.status(201).json({ id: result.insertId, message: 'Complaint submitted successfully.' });
}
async function update(req, res) {
  const { status, remarks, assignedDepartment, dueDate } = req.body;
  const normalizedDueDate = dueDate === '' ? null : dueDate || null;
  if (normalizedDueDate && Number.isNaN(new Date(normalizedDueDate).getTime())) return res.status(400).json({ message: 'Due date must be a valid date.' });
  const [existing] = await pool.execute('SELECT c.status, c.title, s.name AS student_name, s.email AS student_email FROM complaints c JOIN students s ON s.id = c.student_id WHERE c.id = ?', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ message: 'Complaint not found.' });
  await pool.execute('UPDATE complaints SET status = COALESCE(?, status), admin_remarks = COALESCE(?, admin_remarks), assigned_department = COALESCE(?, assigned_department), due_date = COALESCE(?, due_date), resolved_at = IF(? = \'Resolved\', CURRENT_TIMESTAMP, resolved_at) WHERE id = ?', [status || null, remarks || null, assignedDepartment || null, normalizedDueDate, status, req.params.id]);
  if (status || remarks || dueDate) await pool.execute('INSERT INTO complaint_updates (complaint_id, admin_id, old_status, new_status, remarks) VALUES (?, ?, ?, ?, ?)', [req.params.id, req.session.user.id, existing[0].status, status || existing[0].status, remarks || (dueDate ? `Due date set to ${normalizedDueDate}.` : null)]);
  if (status && status !== existing[0].status) {
    void sendComplaintStatusEmail({
      to: existing[0].student_email,
      studentName: existing[0].student_name,
      complaintTitle: existing[0].title,
      complaintId: req.params.id,
      oldStatus: existing[0].status,
      newStatus: status
    }).catch(error => console.error('Complaint status email failed:', error));
  }
  res.json({ message: 'Complaint updated.' });
}
async function remove(req, res) { const [result] = await pool.execute('DELETE FROM complaints WHERE id = ?', [req.params.id]); if (!result.affectedRows) return res.status(404).json({ message: 'Complaint not found.' }); res.json({ message: 'Complaint deleted.' }); }
module.exports = { listStudent, getOne, create, update, remove };
