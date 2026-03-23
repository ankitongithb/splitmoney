import client from './axiosClient'
export const getBudgets    = ()       => client.get('/budgets')
export const setBudget     = data     => client.post('/budgets', data)
export const getBudgetStatus = (m, y) => client.get(`/budgets/status?month=${m}&year=${y}`)
