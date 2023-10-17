import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import { Link } from 'react-router-dom';
import { Icon } from "./../../components/Icon";

import "./LeftDrawerNavigationMenu.scss";

export interface ILeftDrawerNavigationMenuItem {
    text: string;
    href: string;
    iconName?: null | string;
}

export function LeftDrawerNavigationMenu(props: {
    displayMode?: DisplayMode;
    menuItems: ILeftDrawerNavigationMenuItem[]; 
}) 
{
    let cssClasses = "left-drawer-navigation";

    if(props.displayMode !== DisplayMode.Normal)
    {
        return (        
            <React.Fragment>Loading</React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <nav className={cssClasses}>
                <ul>
                    {props.menuItems.map((menuItem, index) => 
                        <li key={index}>
                            <Link to={"/" + menuItem.href} className="rounded">
                                {menuItem.iconName && <Icon name={menuItem.iconName} marginEnd={2} />}
                                <span>{menuItem.text}</span>
                            </Link>
                        </li>)
                    }
                </ul>
            </nav>
        </React.Fragment>
    );
};