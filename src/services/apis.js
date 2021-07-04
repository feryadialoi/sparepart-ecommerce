import axios from 'axios'

import { CART } from './urls'
import config from './apiConfig'

export const getCarts = (urlParams) => {
  let newConfig = { ...config }
  newConfig.method = 'GET'
  newConfig.url = `${newConfig.url}${CART}?${urlParams || ''}`
  return axios(newConfig)
}
