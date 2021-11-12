import axios from 'axios'

export const setLightState = (state)=>{
  axios.get(`http://192.168.1.201/22/${state}`)
}