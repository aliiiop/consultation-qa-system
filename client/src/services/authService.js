import axios from 'axios'

const API_URL = '/api'

export const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'))
  },

  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default authService
