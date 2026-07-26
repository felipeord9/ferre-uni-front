import axios from 'axios';

const { config } = require('../config')

const url = `${config.apiUrl2}/record/budget`;

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

export const createRecord = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateRecord = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const deleteRecord = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};