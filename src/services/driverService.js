import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/drivers`;

const findDrivers = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOneDriver = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findBycedula = async (cedula) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/cedula/${cedula}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createDriver = (body) => {
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

const updateDriver = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const deleteDriver = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};

export { 
  findDrivers,
  findOneDriver,
  findBycedula,
  createDriver,
  updateDriver,
  deleteDriver 
};
