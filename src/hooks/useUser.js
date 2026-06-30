import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/authContext"
import { userLogin } from "../services/authService"
import Swal from "sweetalert2";
import toast from 'react-hot-toast';

export default function useUser() {
  const { token, setToken } = useContext(AuthContext)
  const { user, setUser } = useContext(AuthContext)
  const [state, setState] = useState({
    loading: false,
    error: false
  })

  const login = useCallback(({ email, password }) => {
    setState({ isLoading: true, error: false })
    userLogin({ email, password })
      .then((data) => {
        window.localStorage.setItem("token", JSON.stringify(data.token))
        window.localStorage.setItem("user", JSON.stringify(data.user))
        setState({ isLoading: false, error: false })
        setToken(data.token)
        setUser(data.user)
      })
      .catch((err) => {
        window.localStorage.removeItem("token")
        window.localStorage.removeItem("user")
        setState({ isLoading: false, error: true })
        setTimeout(() => setState({ isLoading: false, error: false }), 3000)
        Swal.fire({
          icon: 'warning',
          title: 'Acceso Denegado',
          text: 'Las credenciales no coinden, verificalas y vuelve a intentar.',
          timer: 5000,
          showConfirmButton: false
        })
      })
  }, [setToken, setUser])

  const logout = useCallback(() => {
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }, [setToken, setUser])

  return {
    isLogged: Boolean(token),
    isLoginLoading: state.loading,
    hasLoginError: state.error,
    login,
    logout
  }
}