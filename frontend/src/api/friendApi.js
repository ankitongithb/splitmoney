import client from './axiosClient'
export const getFriends      = ()        => client.get('/friends')
export const addFriend       = data      => client.post('/friends/add', data)
export const recordTx        = data      => client.post('/friends/transaction', data)
export const getBalances     = ()        => client.get('/friends/balances')
export const settleUp        = friendId  => client.post(`/friends/settle/${friendId}`)
