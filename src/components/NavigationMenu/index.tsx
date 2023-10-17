import _ from 'lodash';
import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';
import { Axis } from '../../types/enums/axis';

import { INavigationMenuItem } from '../../types/interfaces/navigationMenuItem';

import { Link } from 'react-router-dom';
import { Icon } from "./../../components/Icon";

import "./NavigationMenu.scss";

export function NavigationMenu(props: { displayMode?: DisplayMode; axis?: Axis ; menuItems: INavigationMenuItem[]; activeItemName?: string; displayStyle?: string; spacing?: number; iconSize?: number; })
{
    const getMenuItemCssClasses = (menuItem: INavigationMenuItem) => 
    {
        let classes = ["nav-link"];
        
        if(menuItem.name === props.activeItemName)
            classes.push("active");
        
        return classes.join(" ");
    };

    const getAriaCurrent = (menuItem: INavigationMenuItem) => 
    {
        if(menuItem.name === props.activeItemName)
            return "page";

        return undefined;
    };

    const buildMenuItem = (menuItem: INavigationMenuItem, displayMode?: DisplayMode) => 
    {
        if(displayMode === DisplayMode.Stencil)
            return <span className="btn placeholder" aria-description="menu item placeholder">
                <span><Icon displayMode={displayMode} name={"information-box-outline"} marginEnd={2} size={props.iconSize} /></span>
                <span className="text-placeholder" aria-description="text placeholder">
                    &nbsp;
                </span>
            </span>;
            
        return <Link to={menuItem.href} className={getMenuItemCssClasses(menuItem)} aria-description={menuItem.name} aria-current={getAriaCurrent(menuItem)}>
            {menuItem.iconName && <Icon name={menuItem.iconName} marginEnd={2} /> }
            <span>{_.isEmpty(menuItem.text) ? menuItem.name : menuItem.text}</span>
        </Link>;
    };

    const cssClasses: string[] = ["navigation-menu"];
    const listCssClasses: string[] = ["nav"];

    const buildListItemCssClasses = (isLast: boolean) => 
    {
        const listItemCssClasses: string[] = ["nav-item"];

        if(props.spacing && props.spacing > 0)
        {
            if(!isLast && props.spacing < 4)
                listItemCssClasses.push(`${(props.axis === Axis.Horizontal) ? "me" : "mb" }-${props.spacing}`);
        }

        return listItemCssClasses.join(" ")
    };

    if(props.displayStyle === "pills")
    {
        listCssClasses.push("nav-pills");
    }
    else
        listCssClasses.push("flex-column");

    if(props.axis === Axis.Horizontal)
        listCssClasses.push("axis-h");
    else
        listCssClasses.push("axis-v");

    return (
        <React.Fragment>
            <nav className={cssClasses.join(" ")}>
                <ul className={listCssClasses.join(" ")} role="navigation">
                    {props.menuItems.map((menuItem, index) => 
                        <li key={menuItem.name} className={buildListItemCssClasses(index === props.menuItems.length - 1)}>
                            {buildMenuItem(menuItem, props.displayMode)}
                        </li>
                    )}
                </ul>
            </nav>
        </React.Fragment>
    );
};