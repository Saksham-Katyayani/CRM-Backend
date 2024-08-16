var express = require('express');
const { createLead } = require('../controllers/LeadControllers');

const { agentCreation, queryCreation, CallDetailsCreation, CropsCreation } = require('../controllers/indexControllers');
var router = express.Router();


router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/createLead',createLead);



router.get('/forgot-password', (req,res)=>{
  res.render('forgotpassword');
});

router.get('/reset-password', (req,res)=>{
   res.render('resetpassword');
})

// Create a new agent
router.post('/agents',agentCreation);

// Create a new query
router.post('/queries', queryCreation);

// Create a new call detail
router.post('/calls',CallDetailsCreation );

// Create a new crop
router.post('/crops',CropsCreation );


module.exports = router;
 