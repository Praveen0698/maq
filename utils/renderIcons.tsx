import { BsPersonWorkspace } from "react-icons/bs";
import { HiViewBoards, HiDotsHorizontal } from "react-icons/hi";
import { HiUserGroup } from "react-icons/hi2";
import { RiSettings5Fill, RiDeleteBinLine } from "react-icons/ri";
import { RxOpenInNewWindow } from "react-icons/rx";
import { MdOutlineManageAccounts, MdOutlineHub, MdSecurity } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { GrRadialSelected, GrMore, GrResources, GrShieldSecurity } from "react-icons/gr";
import { FaStarOfLife, FaMinus } from "react-icons/fa";
import { TbApi } from "react-icons/tb";
import { GiServerRack } from "react-icons/gi";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { PiWebhooksLogoFill, PiUsersThreeFill } from "react-icons/pi";
import { AiOutlineDashboard } from "react-icons/ai";
import { LiaQuestionSolid } from "react-icons/lia";
import { FaComputer } from "react-icons/fa6";
import React, { ReactNode } from 'react';

type IconName =
    | "BsPersonWorkspace"
    | "HiViewBoards"
    | "HiUserGroup"
    | "RiSettings5Fill"
    | "HiDotsHorizontal"
    | "RxOpenInNewWindow"
    | "MdOutlineManageAccounts"
    | "RiDeleteBinLine"
    | "IoMdAdd"
    | "GrRadialSelected"
    | "GrMore"
    | "FaStarOfLife"
    | "FaMinus"
    | "TbApi"
    | "MdOutlineHub"
    | "MdSecurity"
    | "GrResources"
    | "GiServerRack"
    | "SiAmazonsimpleemailservice"
    | "GrShieldSecurity"
    | "AiOutlineDashboard"
    | "LiaQuestionSolid"
    | "PiUsersThreeFill"
    | "FaComputer"
    | "PiWebhooksLogoFill";

interface IconProps {
    size?: number;
    color?: string;
    style?: React.CSSProperties; // Add style prop
}

const iconMap: Record<IconName, React.FC<IconProps>> = {
    "BsPersonWorkspace": BsPersonWorkspace,
    "HiViewBoards": HiViewBoards,
    "HiUserGroup": HiUserGroup,
    "RiSettings5Fill": RiSettings5Fill,
    "HiDotsHorizontal": HiDotsHorizontal,
    "RxOpenInNewWindow": RxOpenInNewWindow,
    "MdOutlineManageAccounts": MdOutlineManageAccounts,
    "RiDeleteBinLine": RiDeleteBinLine,
    "IoMdAdd": IoMdAdd,
    "GrRadialSelected": GrRadialSelected,
    "GrMore": GrMore,
    "FaStarOfLife": FaStarOfLife,
    "FaMinus": FaMinus,
    "TbApi": TbApi,
    "MdOutlineHub": MdOutlineHub,
    "MdSecurity": MdSecurity,
    "GrResources": GrResources,
    "GiServerRack": GiServerRack,
    "SiAmazonsimpleemailservice": SiAmazonsimpleemailservice,
    "GrShieldSecurity": GrShieldSecurity,
    "AiOutlineDashboard": AiOutlineDashboard,
    "LiaQuestionSolid": LiaQuestionSolid,
    "PiUsersThreeFill": PiUsersThreeFill,
    "FaComputer": FaComputer,
    "PiWebhooksLogoFill": PiWebhooksLogoFill,
};

export default function renderIcons(
    icon: IconName,
    size: number = 20,
    color: string = "#000",
    style?: React.CSSProperties // Make style optional
): ReactNode { // Change return type to ReactNode
    const IconComponent = iconMap[icon];
    if (!IconComponent) {
        return null; // Or throw an error:  throw new Error(`Icon ${icon} not found`);
    }
    return <IconComponent size={size} color={color} style={style} />;
}
