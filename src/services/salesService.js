import axios from 'axios';

const { config } = require('../config')

const url = `${config.apiUrl2}/sales`;

export const findSales = async () => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneSale = async (id) => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createSale = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createMultipleSales = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(`${url}/multiple`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const replaceSales = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(`${url}/replace`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateSale = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const deleteSale = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};