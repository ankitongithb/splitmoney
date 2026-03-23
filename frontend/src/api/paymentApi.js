import client from './axiosClient'
export const getPayments    = ()             => client.get('/payments')
export const createOrder    = data           => client.post('/payments/create-order', data)
export const verifyPayment  = (id, pid)      => client.post(`/payments/${id}/verify`, { razorpayPaymentId: pid })
