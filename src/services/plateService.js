import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/plates`;

const findPlates = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOnePlate = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findByPlate = async (plate) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/plate/${plate}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createPlate = (body) => {
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

const updatePlate = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const deletePlate = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};

export { 
  findPlates,
  findOnePlate,
  findByPlate,
  createPlate,
  updatePlate,
  deletePlate,
};
