import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import { CgFileAdd } from "react-icons/cg";
import { FaUsersGear } from "react-icons/fa6";
import { ImInsertTemplate } from "react-icons/im";

export const NavBarData = [
  {
    title: "Nuevo servicio",
    path: "/form",
    icon: <CgFileAdd />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
    title: "Tabla servicios",
    path: "/inicio",
    icon: <MdIcons.MdOutlineInventory />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
    title: "Conductores",
    path: "/drivers",
    icon: <FaUsersGear />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Placas",
    path: "/plates",
    icon: <ImInsertTemplate />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
    access: ['admin']
  },
];