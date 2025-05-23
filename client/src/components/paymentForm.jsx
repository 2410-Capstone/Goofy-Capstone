import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import styles from '../styles/scss/payment_components/_payment_form.module.scss';
import { useNavigate } from 'react-router-dom';
import { clearGuestCart } from '../utils/cart';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function StripeForm({ cartItems, shippingInfo }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [status, setStatus] = useState('default');
  const [emailInput, setEmailInput] = useState(() => shippingInfo?.email || '');
  const [phone, setPhone] = useState(shippingInfo?.phone || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const isGuest = !localStorage.getItem('token');

  useEffect(() => {
    if (!emailInput && shippingInfo?.email) {
      setEmailInput(shippingInfo.email);
    }
  }, [shippingInfo?.email]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoadingUser(false);
      return;
    }
    const payload = parseJwt(storedToken);
    const extractedId = payload?.id || payload?.userId;
    if (!extractedId) {
      setErrorMessage('User ID missing in token');
    } else {
      setUserId(extractedId);
      setToken(storedToken);
    }
    setIsLoadingUser(false);
  }, []);

  useEffect(() => {
    const maybeFillMissingBillingInfo = async () => {
      if (!shippingInfo.name || !shippingInfo.addressLine1) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (res.ok) {
            const user = await res.json();
            if (!shippingInfo.name) shippingInfo.name = user.name;
            if (!shippingInfo.addressLine1) shippingInfo.addressLine1 = user.address;
          }
        } catch (err) {
          console.error('Could not fetch fallback billing info:', err);
        }
      }
    };
    if (userId) {
      maybeFillMissingBillingInfo();
    }
  }, [userId]);

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Failed to parse JWT:', err);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe not initialized');
      return;
    }

    if (!cardComplete) {
      setErrorMessage('Please complete your card details');
      return;
    }

    if (!emailInput || !shippingInfo.addressLine1 || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (phone && !/^[0-9]{10,15}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid phone number (numbers only).');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    if (!userId) {
      localStorage.setItem('guestEmail', emailInput.trim());
      clearGuestCart();
    }

    setStatus('processing');
    shippingInfo.phone = phone;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          userId,
          cartItems,
          shippingInfo: {
            ...shippingInfo,
            email: emailInput.trim(),
            phone: phone.trim() || undefined,
          },
        }),
      });

      const { clientSecret, error: backendError, orderId: confirmedOrderId } = await res.json();

      if (backendError) throw new Error(backendError);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: emailInput,
            address: {
              line1: shippingInfo.addressLine1,
              line2: shippingInfo.addressLine2 || undefined,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.zip,
            },
            name: shippingInfo.name,
            phone: phone.trim() || undefined,
          },
        },
        receipt_email: emailInput,
      });

      if (error) throw error;

      if (paymentIntent.status === 'succeeded') {
        setStatus('succeeded');
        try {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: confirmedOrderId,
              amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
              billing_name: shippingInfo.name,
              billing_address: `${shippingInfo.addressLine1}${shippingInfo.addressLine2 ? ', ' + shippingInfo.addressLine2 : ''}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`,
            }),
          });
        } catch (err) {
          console.error('Failed to save payment to backend:', err);
        }

        try {
          if (!userId) {
            clearGuestCart();
          } else {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/clear`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userId }),
            });
          }
          localStorage.removeItem('cart');
          navigate('/order-confirmation', {
            state: { orderId: confirmedOrderId },
          });
        } catch (clearErr) {
          console.error('Cart clear failed:', clearErr);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Payment failed. Please try again.');
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setErrorMessage(event.error?.message || '');
  };

  if (!stripe || !elements) {
    return <div className={styles.loadingMessage}>Loading payment system...</div>;
  }

  return (
    <div className={styles.container}>
      {status === 'succeeded' ? (
        <div className={styles.successMessage}>
          Payment successful!
          <p>Redirecting to confirmation page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor='email' className={styles.label}>Email</label>
            {isGuest ? (
              <input
                id='email'
                type='email'
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className={styles.input}
              />
            ) : (
              <div className={styles.disabledField}>
                {emailInput?.trim() || shippingInfo?.email?.trim() || 'Loading...'}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='phone' className={styles.label}>Phone Number</label>
            <input
              id='phone'
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
              placeholder='e.g. 1234567890'
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Card Details</label>
            <div className='stripe-element-container'>
              <CardElement className='stripe-element-card' onChange={handleCardChange} />
            </div>
          </div>

          {errorMessage && <div className={styles.error}>{errorMessage}</div>}

          <button
            type='submit'
            disabled={!stripe || status === 'processing' || !cardComplete}
            className={`pay-button ${styles.button}`}
          >
            {status === 'processing' ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      )}
    </div>
  );
}

StripeForm.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  shippingInfo: PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    addressLine1: PropTypes.string.isRequired,
    addressLine2: PropTypes.string,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    zip: PropTypes.string.isRequired,
    phone: PropTypes.string,
  }).isRequired,
};

export default function PaymentForm(props) {
  return (
    <Elements stripe={stripePromise}>
      <StripeForm {...props} />
    </Elements>
  );
}
