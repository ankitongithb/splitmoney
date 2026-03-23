import client from './axiosClient'
export const login    = data => client.post('/auth/login', data)
export const register = data => client.post('/auth/register', data)
