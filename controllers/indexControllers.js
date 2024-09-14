const Query = require("../Models/queryModel");
const Crop = require("../Models/cropModel");
const Source = require("../Models/sourceModel");
const Tags = require("../Models/tagsModel");
const Disease = require("../Models/diseaseModel");
const logger = require("../logger");
const UserRoles = require('../Models/userRolesModel');
const Agent = require("../Models/agentModel")
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

exports.queryCreation = catchAsyncErrors(async (req, res) => {
  logger.info("You made a POST Request on Query creation Route");

  const {
    customer_id,
    query_category,
    order,
    tags,
    reason_not_ordered,
    description,
    created_by,
  } = req.body;
  const query = new Query({
    customer_id,
    query_category,
    order,
    tags,
    reason_not_ordered,
    description,
    created_by,
  });
  await query.save();

  res
    .status(201)
    .send({ success: true, message: "Query created successfully" });
  logger.info(query);
});

exports.CropsCreation = catchAsyncErrors(async (req, res) => {
  logger.info("You made a POST Request on Crops creation Route");

  // Fetch the last created crop to increment the ID
  const lastCrop = await Crop.findOne().sort({ cropId: -1 }).exec();

  let newCropId = "CS-01";
  if (lastCrop) {
    const lastCropNumber = parseInt(lastCrop.cropId.split("-")[1], 10);
    const newCropNumber = lastCropNumber + 1;
    newCropId = `CS-${newCropNumber.toString().padStart(2, "0")}`;
  }

  const stages = req.body.stages; // Fetch stages from the request body
  const cropStages = [];

  // Loop through each stage and create diseases dynamically
  for (let stage of stages) {
    const diseaseIds = [];
    for (let diseaseData of stage.diseases) {
      const disease = new Disease({
        diseaseName: diseaseData.name,
        diseaseImage: diseaseData.image,
        solution: diseaseData.solutions,
        prevention: diseaseData.prevention,
        products: diseaseData.products,
      });

      await disease.save();
      diseaseIds.push(disease._id); // Add the saved disease ID to the stage
    }

    // Add the dynamically created diseases to each stage
    cropStages.push({
      name: stage.Name,
      stage: stage.stage,
      duration: stage.duration,
      diseases: diseaseIds,
    });
  }

  // Create the new crop with dynamic stages
  const crop = new Crop({
    ...req.body,
    cropId: newCropId,
    cropImage: req.body.cropImage,
    stages: cropStages,
  });

  await crop.save();

  res.status(201).send({ success: true, message: "Crop created successfully", crop });
  logger.info(crop);
});

exports.allCrops = catchAsyncErrors(async (req, res) => {

  const allCrops = await Crop.find().populate({
    path: 'stages.diseases', 
    model: 'Disease',
  });

  res.status(200).json({
    success: true,
    message: "All Crops that are available",
    allCrops,
  });
});

exports.searchCrop = catchAsyncErrors(async (req, res) => {
  const query = {};

  // Loop through the query parameters and add them to the search query
  for (let key in req.query) {
    if (req.query[key]) {
      if (key === "cropId" || key === "name") {
        query[key] = { $regex: req.query[key], $options: "i" }; // Case-insensitive partial match
      }
    }
  }

  // If the user searches by disease name
  if (req.query.diseaseName) {
    // Find disease IDs that match the search criteria
    const diseases = await Disease.find({
      diseaseName: { $regex: req.query.diseaseName, $options: "i" }, // Case-insensitive partial match
    }).select("_id"); // Get only the IDs of the matching diseases

    if (diseases.length > 0) {
      const diseaseIds = diseases.map(d => d._id);

      // Add a condition to search crops where any stage's diseases field contains the found disease IDs
      query['stages.diseases'] = { $in: diseaseIds };
    } else {
      // If no diseases are found, return an empty array
      return res.json([]);
    }
  }

  // Fetch crops and populate the diseases in the stages array
  const crops = await Crop.find(query).populate({
    path: 'stages.diseases', // Path to populate nested diseases within stages
    model: 'Disease',        // Model name of Disease
  });

  res.json(crops);
});

exports.updateCrop = catchAsyncErrors(async (req, res) => {
  const { cropId } = req.params;
  const updateCropData = req.body;
  const agentId = req.user.id;  
  // console.log(agentId)

    // Add the user who is updating the crop to the update data
    updateCropData.updatedBy = agentId;   

    // Find the customer lead by leadId and update it
    const updatedCrop = await Crop.findOneAndUpdate(
      { cropId },
      updateCropData,
      { new: true, runValidators: true }
    );

    if (!updatedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.json(updatedCrop);
    console.log(updatedCrop); 
    
});

exports.deleteCrop = catchAsyncErrors(async (req, res) => {
  const { cropId } = req.params;

  // Find the customer lead by leadId and delete it
  const deletedCrop = await Crop.findOneAndDelete({ cropId });

  if (!deletedCrop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  res.json({ message: "Crop deleted successfully" });
});

exports.createSource = catchAsyncErrors(async (req, res) => {
  logger.info("You made a POST Request on Source creation Route");

  if (Array.isArray(req.body)) {
    const sources = await Source.insertMany(req.body);
    // await sources.save();
    res
      .status(201)
      .send({ success: true, message: "Sources Created in Bulk successfully" });
    logger.info(sources);
  } else {
    const source = new Source(req.body);
    await source.save();
    res
      .status(201)
      .send({ success: true, message: "Sources Created successfully" });
    logger.info(source);
  }
});

exports.createTags = catchAsyncErrors(async (req, res) => {
  logger.info("You made a POST )Request on Tags creation Route");

  const { name } = req.body;
  const tag = new Tags({ name });
  await tag.save();
  res.status(201).send({ success: true, message: "Tags Created successfully" });
  logger.info(tag);
});

// Role creation logic, controlled by Super Admin or Admin
exports.createRole = catchAsyncErrors(async (req, res) => {
  const { role_name } = req.body;

  const agent = await Agent.findById(req.user.id)
  if (agent.user_role) {
    const userRole = await UserRoles.findOne({ UserRoleId: agent.user_role }).select('UserRoleId  role_name');
    agent.user_role = userRole;  // Replace with the populated user role
  }

    // Check if the user is an Admin and trying to create a Super Admin role
    if (agent.user_role.role_name === "Admin" && role_name === "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Admins are not allowed to create the Super Admin role"
      });
    }

    // If Super Admin, prevent creating another Super Admin
    if (agent.user_role.role_name === "Super Admin" && role_name === "Super Admin") {
      const existingSuperAdmin = await UserRoles.findOne({ role_name: "Super Admin" });
      if (existingSuperAdmin) {
        return res.status(400).json({ success: false, message: "Super Admin role already exists" });
      }
    }
  const lastUserRoles = await UserRoles.findOne().sort({ UserRoleId: -1 }).exec();

  let newUserRoleId = "USR-1000"; // Default starting ID
 
  if (lastUserRoles) {
    // Extract the numeric part from the last leadId and increment it
    const lastUserRolesNumber = parseInt(lastUserRoles.UserRoleId.split("-")[1]);
    newUserRoleId = `USR-${lastUserRolesNumber + 1}`;
  }
  // Create a new role
  const newRole = new UserRoles({
    role_name,
    UserRoleId:newUserRoleId
  });

  await newRole.save();

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    data: newRole
  });
});

exports.getAlluserRoles = catchAsyncErrors(async (req, res) => {
  
  const userRoles = await UserRoles.find();
  res.status(200).json(userRoles);

});

exports.updateUserRole = catchAsyncErrors(async (req, res) => {
  const { agentId, newRoleId } = req.body;

  // Find the new role
  const newRole = await UserRoles.findById(newRoleId);
  if (!newRole) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  // Find the agent and update the user_role
  const agent = await Agent.findByIdAndUpdate(agentId, {
    user_role: newRole._id
  }, { new: true }); // `new: true` returns the updated agent

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent not found' });
  }

  res.status(200).json({ success: true, message: 'User role updated successfully', agent });
});
