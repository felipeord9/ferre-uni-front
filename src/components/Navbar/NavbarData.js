import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import { CgFileAdd } from "react-icons/cg";
import { FaUsersGear } from "react-icons/fa6";
import { ImInsertTemplate } from "react-icons/im";
import { FiHome } from "react-icons/fi";
import { IoIosTrendingUp } from "react-icons/io";
import { CgSearchFound } from "react-icons/cg";
import { FiPackage } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";

export const NavBarData = [
  {
    id: 1,
    title: "Inicio",
    path: "/inicio",
    icon: <FiHome />,
    cName: "nav-text",
    description: 'Resumen ejecutivo del portal.',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin', 'usuario']
  },
  {
    id: 2,
    title: "Ventas",
    path: "/ventas",
    icon: <IoIosTrendingUp />,
    cName: "nav-text",
    description: 'Dashboard avanzado de ventas.',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin', 'usuario']
  },
  {
    id: 3,
    title: "Inventario",
    path: "/inventario",
    icon: <FiPackage />,
    cName: "nav-text",
    description: 'Resumen inventario del portal.',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 4,
    title: "Control Interno",
    path: "/control/interno",
    icon: <CgSearchFound />,
    cName: "nav-text",
    description: 'Resumen control interno del portal.',
    type: 'native',
    version: '1.0.0',
    active: false,
    access: ['admin']
  },
  {
    id: 5,
    title: "Administración",
    path: "/administracion",
    icon: <CiSettings />,
    cName: "nav-text",
    description: 'Administración del portal.',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin']
  },
];