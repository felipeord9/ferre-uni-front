import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import AuthContext from '../../context/authContext'; 
import KpiCard from '../../components/KpiCard';
import { NavBarData } from "../../components/Navbar/NavbarData";
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import * as Icons from 'lucide-react';

export default function Inventario() {

    return(
        <div>
            Inventario
        </div>
    )
}