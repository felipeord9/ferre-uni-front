import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/upload`;

export const sendEvidence= async(formData) =>{
  try {
    const { data } = await axios.post(`${url}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data;
  } catch (error) {
    throw error;
  }
}

export const getEvidence = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/file`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const verificarArchivo = async (directionUrl) => {
  try {
    const res = await fetch(`${directionUrl}`, { method: 'HEAD' });
    if(!res.ok){
      return null;
    }
    return directionUrl;
  } catch (error) {
    console.error('Error al verificar archivo:', url, error);
    return false;
  }
};
