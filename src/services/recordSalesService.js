import axios from 'axios';

const { config } = require('../config')

const url = `${config.apiUrl2}/record/sales`;

export const findRecords = async () => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneRecord = async (id) => {
const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createRecordSale = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateRecordSale = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const deleteRecordSale = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};