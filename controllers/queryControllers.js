const Query = require("../Models/queryModel");
const logger = require("../logger");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

exports.queryCreation = catchAsyncErrors(async (req, res) => {
    logger.info(`Creating new query from IP: ${req.ip}`);
    const { description, query_category, order, tags, reason_not_ordered, created_by, updated_By } = req.body;
  
    // Check if description is provided (customer_id will be generated automatically)
    if (!description) {
        return res.status(400).json({
            success: false,
            message: 'Description is required',
        });
    }
  
    const lastQuery = await Query.findOne().sort({ created_at: -1 });
  
    let newCustomerId = "Qu101";
    if (lastQuery && lastQuery.customer_id) {
        const lastCustomerIdNumber = parseInt(lastQuery.customer_id.slice(2)) + 1;
        newCustomerId = `Qu${lastCustomerIdNumber}`;
    }
  
    // Create the new query with the generated customer_id
    const newQuery = await Query.create({
        customer_id: newCustomerId, // Generated customer ID
        description,                // Required
        query_category,             // Optional
        order,                      // Optional
        tags,                       // Optional
        reason_not_ordered,         // Optional
        created_by,                 // Optional
        updated_By                  // Optional
    });
  
    res.status(201).json({
        success: true,
        message: 'Query created successfully',
        query: newQuery
    });

  }); 
exports.getQuery = catchAsyncErrors(async (req, res) => {
    const { lot = 1, size = 10 } = req.query;

    let queries;
    let totalQueries;
    let totalLots;

    if (!lot && !size) {
        // Fetch all queries if no pagination parameters are provided
        queries = await Query.find();

        totalQueries = queries.length;  // Total number of queries
        totalLots = 1; // Since we're fetching all, we can consider it as 1 lot
    } else {
        // Pagination logic if lot and size are provided
        const pageSize = parseInt(size) || 10;         // Number of queries per lot (default: 10)
        const currentLot = parseInt(lot) || 1;         // Current lot (default: 1)
        const skip = (currentLot - 1) * pageSize;      // Skip the previous lots' queries

        // Fetch queries based on the current lot
        queries = await Query.find().skip(skip).limit(pageSize);

        // Count the total number of queries for pagination
        totalQueries = await Query.countDocuments();   // Total number of queries
        totalLots = Math.ceil(totalQueries / pageSize); // Calculate total lots
    }

    // If no queries found, return a 404 response
    if (queries.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No queries found',
        });
    }

    // Return the queries along with pagination information
    res.status(200).json({
        success: true,
        queries,
        totalLots,  // Total number of lots (pages)
        currentLot: lot ? parseInt(lot) : 1,  // Current lot number (defaults to 1)
        totalQueries,  // Total number of queries
    });
});

exports.searchQuery = catchAsyncErrors(async (req, res) => {
    const { queryId } = req.params; // Get queryId from URL

    // Find the query with the given queryId
    const query = await Query.findOne({ customer_id: queryId });

    // If the query does not exist, return a 404 error
    if (!query) {
        return res.status(404).json({
            success: false,
            message: `Query with customer_id ${queryId} not found`,
        });
    }

    // Return the query details
    res.status(200).json({
        success: true,
        query
    });
});
exports.deleteQuery = catchAsyncErrors(async (req, res) => {
  
    console.log('Request query:', req.query);
  
  
    const { customer_id } = req.query;
  
    if (!customer_id) {
        return res.status(400).json({
            success: false,
            message: 'Customer ID must be provided to delete a query',
        });
    }
    const query = await Query.findOneAndDelete({ customer_id });
  
    if (!query) {
        return res.status(404).json({
            success: false,
            message: 'Query not found for the given customer ID',
        });
    }
  
    return res.status(200).json({
        success: true,
        message: 'Query successfully deleted',
    });
});
exports.updateQuery = catchAsyncErrors(async (req, res) => {
    const { customer_id } = req.query;
    const updateData = req.body;
  
    if (!customer_id || Object.keys(updateData).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Customer ID and update data are required',
        });
    }
  
    let query = await Query.findOne({ customer_id });
    if (!query) {
        return res.status(404).json({
            success: false,
            message: 'Query not found for the given customer ID',
        });
    }
  
    query.updated_history.push({
        updated_at: new Date(),
        updated_data: updateData,
        updated_by: req.body.updated_By
    });
  
    Object.assign(query, updateData);
    await query.save();
  
    return res.status(200).json({
        success: true,
        message: 'Query successfully updated',
        query
    });
});
  
