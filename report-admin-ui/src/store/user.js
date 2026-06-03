import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    menus: []
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUsername(username) {
      this.username = username
      localStorage.setItem('username', username)
    },
    setMenus(menus) {
      this.menus = menus
    },
    logout() {
      this.token = ''
      this.username = ''
      this.menus = []
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
  }
})
