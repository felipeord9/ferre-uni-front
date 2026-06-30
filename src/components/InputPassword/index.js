import { useState, useCallback } from "react";
import { FaLock } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";
import * as Bs from "react-icons/bs";

export default function InputPassword({ id, label, password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback((e) => {
    setShowPassword(!showPassword);
  });

  const handleChange = useCallback((e) => {
    const { value } = e.target;
    setPassword(value);
  });

  return (
    <div className="input-group ms-0 ps-0 w-100 d-flex" style={{fontSize: 13.5}}>
      <span 
        onClick={togglePasswordVisibility}
        style={{ right: 10, cursor: "pointer" }}
        className="input-group-text bg-white ms-0"
      ><i class="bi bi-person-fill">
        {showPassword ? <FaUnlock /> : <FaLock />}
      </i></span>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder= {showPassword ? 'Contraseña' : "**********"}
        className="form-control form-control-sm shadow-sm"
        onChange={handleChange}
        style={{ paddingRight: 33 }}
        autoComplete="off"
        required
      />
    </div>
  );
}