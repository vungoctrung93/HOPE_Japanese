const express = require('express');

const questionController = require('../controllers/QuestionController');

const router = express.Router();

router.get('/', questionController.getQuestions);
router.get('/questionsData', questionController.getQUESTIONSData);
router.post('/', questionController.postAnswer);
router.get('/nextquestion/:set', questionController.nextQuestions);
// router.get('/nextquestionselfpractice/:set', questionController.nextQuestionsSelfPractice);
router.get('/resetquestion/:set', questionController.resetQuestions);
router.get('/backupfirebase', questionController.backupFirebase);

module.exports = router;