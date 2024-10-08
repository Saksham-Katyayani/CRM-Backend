const logger = require("../logger");

exports.generatedErrors = (err,req,res,next) => {
 
    const statusCode = err.statusCode ||500;
    if(err.name === 'MongoServerError' && err.message.includes("E11000 duplicate key error collection: CRM-Database.agents")){
        err.message= 'Agent with Already Exists please try with different details';
        logger.warn(err.message);  
    }
    if(err.name === 'ValidationError' && err.message.includes("First Name is required")){
        err.message= 'First Name is required';
        logger.warn(err.message);

    }
    if(err.name === 'ValidationError' && err.message.includes("Last Name is required")){
        err.message= 'Last Name is required';
        logger.warn(err.message);

    }
    if(err.name === 'ValidationError' && err.message.includes("Last Name should be at least 3 characters long")){
        err.message= 'Last Name should be at least 3 characters long';
        logger.warn(err.message);

    }
    if(err.name === 'ValidationError' && err.message.includes("Email Address is Required")){
        err.message= 'Please Provide Email Address'
        logger.warn(err.message);
    }
    if(err.name === 'MongoServerError' && err.message.includes("CRM-Database.customerleads contact_1 dup key")){
        err.message= 'Lead Already Exists with this contact please try with different contact'
        logger.warn(err.message);
    }
    if(err.name === 'MongoServerError' && err.message.includes("CRM-Database.customerleads index: email_1 dup key")){
        err.message= 'Lead Already Exists with this email please try with different email'
        logger.warn(err.message);
    }
    res.status(statusCode).json({
        message:err.message,
        errName:err.name,
        statusCode,
        // stack:err.stack,     
    })


}