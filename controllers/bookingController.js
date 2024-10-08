const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const tour = await Tour.findById(req.params.tourId);
    const transformedItems = [{
        quantity: 1,
        price_data: {
            currency: "usd",
            unit_amount: tour.price * 100,
            product_data: {
                name: `${tour.name} Tour`,
                description: tour.description, //description here
                // `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //only accepts live images (images hosted on the internet),
            },
        },
    }]
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        // line_items: [
        //     {
        //         name: `${tour.name} Tour`,
        //         description: tour.summary,
        //         images: [`https://www.natours.dev/imf/tours/${tour.imageCover}`],
        //         amount: tour.price * 100,
        //         currency: 'usd',
        //         quantity: 1
        //     }
        // ]
        line_items: transformedItems,
        mode: 'payment'
    });
    // 3) Crate session as response 
    res.status(200).json({
        status: 'success',
        session
    });
});


exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();
    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
});


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
