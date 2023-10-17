import _ from 'lodash';
import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import { INotification } from '../../types/interfaces/notification';

import { Link } from 'react-router-dom';
import { Icon } from "./../../components/Icon";

import "./NotificationsList.scss";

export function NotificationsList(props: { displayMode?: DisplayMode; notifications: INotification[]; spacing?: number; iconSize?: number; })
{
    const getMenuItemCssClasses = (menuItem: INotification) => 
    {
        let classes = ["notification"];
        
        return classes.join(" ");
    };

    const buildMenuItem = (menuItem: INotification, displayMode?: DisplayMode) => 
    {
        if(displayMode === DisplayMode.Stencil)
            return <span className="btn placeholder" aria-description="menu item placeholder">
                <span><Icon displayMode={displayMode} name={"information-box-outline"} size={props.iconSize} /></span>
                <span className="text-placeholder" aria-description="text placeholder">
                    &nbsp;
                </span>
            </span>;
            
        return <div className={getMenuItemCssClasses(menuItem)} aria-description={menuItem.type}>
            {menuItem.type && <Icon name={menuItem.type} /> }
            <span>{ menuItem.text }</span>
        </div>;
    };

    const cssClasses: string[] = ["notifications-list"];

    const buildListItemCssClasses = (isLast: boolean) => 
    {
        const listItemCssClasses: string[] = ["notification-item"];

        return listItemCssClasses.join(" ")
    };

    return (
        <React.Fragment>
            <div className={cssClasses.join(" ")}>
                <ul>
                    {props.notifications.map((notification, index) => 
                        <li key={notification.type} className={buildListItemCssClasses(index === props.notifications.length - 1)}>
                            {buildMenuItem(notification, props.displayMode)}
                        </li>
                    )}
                </ul>
            </div>
        </React.Fragment>
    );
};