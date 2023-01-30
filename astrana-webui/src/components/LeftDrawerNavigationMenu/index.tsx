import React from 'react';

import { Link } from 'react-router-dom';
import { Icon } from "./../../components/Icon";

import "./LeftDrawerNavigationMenu.scss";

export interface ILeftDrawerNavigationMenuItem {
    text: string;
    href: string;
    iconName: null | string;
}

export interface ILeftDrawerNavigationMenuState {
    menuItems: ILeftDrawerNavigationMenuItem[];
}

export function LeftDrawerNavigationMenu(props: {
    displayMode?: "normal" | "skeleton";
    menuItems: ILeftDrawerNavigationMenuItem[]; 
}) 
{
    let cssClasses = "left-drawer-navigation";

    return (
        <React.Fragment>
            <nav className={cssClasses}>
                <ul>
                    {props.menuItems.map((menuItem, index) => 
                        <li key={index}>
                            <Link to={"/" + menuItem.href} className="rounded">
                                {menuItem.iconName && <Icon name={menuItem.iconName} marginRight={2} />}
                                <span>{menuItem.text}</span>
                            </Link>
                        </li>)
                    }
                </ul>
            </nav>
        </React.Fragment>
    );
};