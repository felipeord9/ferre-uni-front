import { config } from '../config'
const url = `${config.apiUrl}/mail/send`;

function sendMail(body) {
  return fetch(url, {
    method: 'POST',
    /* headers: {
      'Content-Type': 'application/json',
    }, */
    body: body
  })
  .then(res => res.json())
  .then(res => res.data)
}

const sendMail2 = (body, id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/${id}`, {
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

const sendMailAuthorization = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/answer/authorization`, {
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

const sendMailReject = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/answer/reject`, {
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

const sendMailCollect = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/answer/collect`, {
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

const sendMailEnd = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/answer/end`, {
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

export {
  sendMail,
  sendMail2,
  sendMailAuthorization,
  sendMailReject,
  sendMailCollect,
  sendMailEnd
}