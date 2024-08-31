var express = require('express');
const { createLead, searchLead ,allLeads, updateLead ,deleteLead } = require('../controllers/LeadControllers');
const {createSource,createTags,queryCreation, CallDetailsCreation, CropsCreation, searchCrop}=require('../controllers/indexControllers');
const { verifyToken } = require('../middlewares/authMiddleware');

var router = express.Router();


 //create lead
 router.post('/createLead',verifyToken,createLead);

//search lead
router.get('/searchLead',verifyToken,searchLead);

//all Leads
router.get('/getLeads',verifyToken,allLeads);
  
//Update leads
router.put("/updateLead/:leadId",updateLead);

//delete leads
router.delete("/deleteLead/:leadId", deleteLead);


// Create a new query
router.post('/queries', queryCreation);

// Create a new call detail
router.post('/calls',CallDetailsCreation );

// Create a new crop
router.post('/crops',CropsCreation );

//search crop
router.get('/searchCrops',verifyToken,searchCrop);

// Create a new source
router.post('/sources',createSource);

// Create a new tag
router.post('/tags', createTags);


module.exports = router;
 