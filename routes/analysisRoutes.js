const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { saveAnalysisSession, getUserAnalysisHistory } = require('../controllers/analysisController');

const router = express.Router();

router.post('/', protect, saveAnalysisSession);
router.get('/', protect, getUserAnalysisHistory); // Corrected line: added a comma between '/' and protect


module.exports = router;