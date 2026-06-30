import { useState, useEffect } from "react";
import * as GoIcons from "react-icons/go"
import TableUsers from "../../components/TableUsers"
import ModalUsers from "../../components/ModalUsers";
import { findUsers } from "../../services/userService"

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalUsers, setShowModalUsers] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllUsers()
  }, []);

  const getAllUsers = () => {
    setLoading(true)
    findUsers()
      .then(({ data }) => {
        setUsers(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  const searchUsers = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = users.filter((elem) => {
        if(
          elem.rowId.includes(value) ||
          elem.name.toLowerCase().includes(value.toLowerCase()) ||
          elem.role.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(users)
     }
    } else {
      setSuggestions(users)
    }
    setSearch(value)
  }

  return (
    <div className="d-flex flex-column container mt-5">
      <ModalUsers 
        user={selectedUser}
        setUser={setSelectedUser}
        showModal={showModalUsers} 
        setShowModal={setShowModalUsers} 
        reloadInfo={getAllUsers} 
      />
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex justify-content-end mt-2 gap-3">
          <input
            type="search"
            value={search}
            className="form-control form-control-sm w-100"
            placeholder="Buscar usuario"
            onChange={searchUsers}
          />
          <button
            title="Nuevo usuario"
            className="d-flex align-items-center text-nowrap btn btn-sm btn-primary text-light gap-1" 
            onClick={(e) => setShowModalUsers(!showModalUsers)}>
              Nuevo usuario
              <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
          </button>
        </div>
        <TableUsers users={suggestions} setShowModal={setShowModalUsers} setSelectedUser={setSelectedUser} loading={loading}/>
      </div>
    </div>
  )
} 