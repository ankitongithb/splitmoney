import client from './axiosClient'
export const getWallet  = ()     => client.get('/wallet')
export const addMoney   = data   => client.post('/wallet/add', data)
export const sendMoney  = data   => client.post('/wallet/send', data)
