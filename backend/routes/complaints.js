const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/authMiddleware');
const controller = require('../controllers/complaintController');
const upload = multer({ dest: path.join(__dirname, '..', 'uploads'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/png', 'image/jpeg', 'application/pdf'].includes(file.mimetype)) });
router.get('/', (req, res, next) => {
	if (!req.session.user) return res.status(401).json({ message: 'Authentication required.' });
	return req.session.user.role === 'student' ? controller.listStudent(req, res, next) : controller.list(req, res, next);
});
router.get('/student', requireAuth('student'), controller.listStudent);
router.post('/', requireAuth('student'), upload.single('attachment'), controller.create);
router.get('/:id', requireAuth('student'), controller.getOne);
router.put('/:id', requireAuth('admin'), controller.update);
router.delete('/:id', requireAuth('admin'), controller.remove);
module.exports = router;
