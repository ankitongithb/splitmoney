import client from './axiosClient'
export const getExpenses   = ()       => client.get('/expenses')
export const addExpense    = data     => client.post('/expenses', data)
export const updateExpense = (id, d)  => client.put(`/expenses/${id}`, d)
export const deleteExpense = id       => client.delete(`/expenses/${id}`)
export const getRates      = ()       => client.get('/expenses/rates')
