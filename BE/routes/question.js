const express = require('express');

const questionController = require('../controllers/QuestionController');

const router = express.Router();

router.get('/', questionController.getQuestions);
router.post('/', questionController.postAnswer);
router.get('/nextquestion/:set', questionController.nextQuestions);

module.exports = router;