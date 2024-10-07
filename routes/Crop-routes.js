const express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {CropsCreation,allCrops,searchCrop,updateCrop,deleteCrop} = require('../controllers/cropControllers');
const { logRequest } = require('../middlewares/logDetails');

// Create a new crop
router.post('/create',logRequest,CropsCreation );

//all crops
router.get('/all',logRequest,verifyToken,allCrops);

//all crops by id
router.get('/all/:cropId',logRequest,verifyToken,allCrops);

//search crop
router.get('/search',logRequest,verifyToken,searchCrop);

//Update Crop
router.put("/:cropId",logRequest,verifyToken,updateCrop);

//Delete Crop
router.delete("/:cropId",logRequest, deleteCrop);

module.exports = router;
