const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const message = 'Dupicate name, use another name!';
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const message = 'Invalid input data';
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token, please log in again.', 401);
const handleJWTExpiredError = () => AppError('Your token has expired, please log in again.', 401);


const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // RENDERED WEBSITE
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
};


const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, Trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        // Programming or other unkown error: don't leak error details 
        } else {
            // 1) Log error
            console.error('Error', err);
            // 2) Send generic message
            res.status(500).json({
                status: 'error',
                message: 'something went very wrong!'
            });
        }
    } else {
        // RENDERED WEBSITE
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message
            });
        // Programming or other unkown error: don't leak error details 
        } else {
            // 1) Log error
            console.error('Error', err);
            // 2) Send generic message
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later.'
            });
        }
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err };
        let error = Object.assign({}, err, {
            name: err.name,
            message: err.message
        });
        console.log(error.name);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }
};