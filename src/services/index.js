import { apiBaseUrl } from '../api'
import moment from 'moment'
import Axios from 'axios'

export const checkTokenExp = async () => {
  const auth = localStorage.getItem('auth')
  if (auth) {
    let { exp } = JSON.parse(auth)
    let now = Date.now().valueOf()

    exp = moment.unix(exp)
    now = moment(now)

    if (now >= exp) {
      // expired
      console.log('expired')
      const refresh = await refreshToken()
      console.log('refresh', refresh)
      return refresh
    } else {
      // valid
      return true
    }
  } else {
    return null
  }
}

export const refreshToken = async () => {
  try {
    const { token } = JSON.parse(localStorage.getItem('auth'))
    const config = {
      method: 'POST',
      url: `${apiBaseUrl}/api/auth/refresh-token`,
      data: { token },
    }
    const result = await Axios(config)
    const auth = result.data
    localStorage.setItem('auth', JSON.stringify(auth))

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
