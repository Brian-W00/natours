/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51Q46vvP6OJpOhzrty7EmMdEWlkl08DFU6LuvwWPM9TPRNCTXCowdCCASA6RCiYZqiuD6VhtJygPMylZh301h0JXW004htoPcFA');

    try {
        // 1) Get checkout sseesion from API
        const session = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`);
        // 2) Create checkout form + charge credit card 
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
        // window.location.replace(session.data.session.url);
    } catch(err) {
        console.log(err);
        showAlert('error', err);
    }


}