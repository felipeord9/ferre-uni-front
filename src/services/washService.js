import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/washes`;

const findLavados = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOneLavado = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const verifyTokenById = async (token) => {
  const localToken = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/verify/${token}`, {
    headers: {
      Authorization: `Bearer ${localToken}`
    }
  })
  return data
}

const createLavado = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const updateLavado = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const deleteLavado = (id) => {
  return fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => res);
};

export { 
  findLavados,
  findOneLavado,
  createLavado,
  updateLavado,
  deleteLavado 
};
