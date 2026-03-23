import client from './axiosClient'
export const downloadExcel = (m, y) => client.get(`/reports/excel?month=${m}&year=${y}`, { responseType: 'blob' })
export const downloadPdf   = (m, y) => client.get(`/reports/pdf?month=${m}&year=${y}`,   { responseType: 'blob' })
