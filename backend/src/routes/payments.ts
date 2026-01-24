import express from 'express';
import axios from 'axios';

const router = express.Router();

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

// Crear preferencia de MercadoPago
router.post('/create-preference', async (req, res) => {
    try {
        const { amount, currency = 'COP', description = 'Suscripción RapiCréditos Pro' } = req.body;

        const preference = {
            items: [
                {
                    title: description,
                    quantity: 1,
                    unit_price: amount,
                    currency_id: currency
                }
            ],
            back_urls: {
                success: `${req.headers.origin}/pricing?status=success`,
                failure: `${req.headers.origin}/pricing?status=failure`,
                pending: `${req.headers.origin}/pricing?status=pending`
            },
            auto_return: 'approved'
        };

        const response = await axios.post(
            'https://api.mercadopago.com/checkout/preferences',
            preference,
            {
                headers: {
                    'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ preferenceId: response.data.id, initPoint: response.data.init_point });
    } catch (error: any) {
        console.error('Error creating MercadoPago preference:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al crear preferencia de pago' });
    }
});

// Webhook de MercadoPago
router.post('/webhook/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;
            // Aquí verificarías el pago y activarías la suscripción del usuario
            console.log('Pago recibido:', paymentId);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error');
    }
});

// Crear orden de PayPal
router.post('/create-paypal-order', async (req, res) => {
    try {
        const { amount = '7.00' } = req.body;

        // Obtener token de acceso
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        const tokenResponse = await axios.post(
            `${PAYPAL_API_URL}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Crear orden
        const orderResponse = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: amount
                    },
                    description: 'Suscripción RapiCréditos Pro'
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ orderId: orderResponse.data.id });
    } catch (error: any) {
        console.error('Error creating PayPal order:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al crear orden de PayPal' });
    }
});

export default router;
