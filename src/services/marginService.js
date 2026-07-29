import axios from 'axios';

const { config } = require('../config')

const url = `${config.apiUrl2}/margin`;

export const findMargins = async () => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneMargin = async (id) => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createMargin = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createMultipleMargin = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(`${url}/multiple`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const replaceMargin = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(`${url}/replace`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateMargin = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const deleteMargin = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};