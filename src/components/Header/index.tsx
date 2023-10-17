import React, { useRef } from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import { INavigationMenuItem } from '../../types/interfaces/navigationMenuItem';
import { INotification } from '../../types/interfaces/notification';

import TranslationService from '../../services/TranslationService';

import { Link } from 'react-router-dom';
import { ProfileImage } from '../ProfileImage';
import { Button } from './../../components/Button';
import { Icon } from './../../components/Icon';
import { NavigationMenu } from '../NavigationMenu';
import { NotificationsList } from '../NotificationsList';

import './Header.scss';

export function Header(props: { displayMode?: DisplayMode; translations: any; user?: any; }) 
{
    const [windowScrollTop, setWindowScrollTop] = React.useState<number>(0);

    const [currentMenuName, setCurrentMenuName] = React.useState<string>("");
    const [menuTop, setMenuTop] = React.useState<number>(0);
    const [menuLeft, setMenuLeft] = React.useState<number>(0);
    const [menuVisible, setMenuVisible] = React.useState<boolean>(false);

	const trxService = TranslationService();
	
	const accountMenuItems: INavigationMenuItem[] = [
		{ name: "profile", text: trxService.trx(props.translations, "nav_menuitem_profile"), href: "/profile", iconName: "account" },
		{ name: "settings_and_privacy", text: trxService.trx(props.translations, "settings_and_privacy"), href: "/settings", iconName: "cog" },
		{ name: "display_and_accessibility", text: trxService.trx(props.translations, "display_and_accessibility"), href: "/settings", iconName: "moon-waning-crescent" },
		{ name: "logout", text: trxService.trx(props.translations, "logout"), href: "/logout", iconName: "logout" }
	];

	const notifications: INotification[] = [
		{ type: "general", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", data: {} },
		{ type: "general", text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", data: {} },
		{ type: "general", text: "When an unknown printer took a galley of type and scrambled it to make a type specimen book.test", data: {} },
		{ type: "general", text: "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.", data: {} },
		{ type: "general", text: "It was popularised in the 1960s.", data: {} }
	];

    const handleLogout = () => {};

    const profilePictureUrl = props.user?.profilePicture?.location ?? undefined;

    const menuRef = React.useRef<HTMLDivElement>(null);

	const setMenuPostion = (controlNode: HTMLElement, menuNode: HTMLDivElement) => {

		const menuWidth = menuNode?.clientWidth ?? 0;
		const bounds = controlNode.getBoundingClientRect();

		setMenuTop(() => bounds.y + bounds.height + 5 + windowScrollTop);
		setMenuLeft(() => bounds.x - menuWidth + bounds.width); 		
	};

    const showMenu = (event: React.MouseEvent<HTMLElement>) =>
    {
        if(event.target)
        {
			const controlNode = event.currentTarget;

			if(menuVisible)
			{
				setMenuPostion(controlNode, menuRef.current!);

				if(menuRef.current)
					menuRef.current.focus();
			}
			else
			{			
            	setMenuVisible(true);

				setMenuTop(() => -10000);
				setMenuLeft(() => -10000); 

				setTimeout(() => {
					setMenuPostion(controlNode, menuRef.current!);

					if(menuRef.current)
						menuRef.current.focus();
				}, 1);
			}

			window.addEventListener("resize", () => { setMenuPostion(controlNode, menuRef.current!); });
        }
    }

    const handleMenuBlur = () => 
    {
       	setMenuVisible(false);
		setCurrentMenuName("");
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => 
    {
        event.preventDefault();
    };

	const showAccountMenu = (event: React.MouseEvent<HTMLElement>) => 
	{
		setCurrentMenuName("account");
		showMenu(event);
	}

	const showNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => 
	{
		setCurrentMenuName("notifications");
		showMenu(event);
	}

    return (
		<React.Fragment>
			<header>
				<div className="wrapper">
					<div>
					<Link to="/">
						<img width="32" height="32" src = "/logo192.png" style={{border: "1px solid white", borderRadius: "8px"}} />
						<h1>Astrana</h1>
					</Link>
					</div>
					<div>
					{props.user && 
						<span className="main-nav">
							<a className="nav-item" href="#add"><Icon name="plus-circle-outline"></Icon></a>
							<span className="nav-item" onClick={(event) => showNotificationsMenu(event) }><Icon name="bell"></Icon></span>
							<span className="instance-user rounded" onClick={(event) => showAccountMenu(event) }>
								<ProfileImage displayMode={props.displayMode} translations={props.translations} peerName={props.user.fullName} imageAddress={profilePictureUrl} width={32} height={32} />
							</span>
						</span>
					}
					</div>
				</div>
			</header>
			
			{menuVisible &&
				<div ref={menuRef} className="header-menu rounded" style={{top: menuTop + "px", left: menuLeft + "px"}} onBlur={handleMenuBlur} tabIndex={-1} onMouseDown={handleMenuClick}>
					{currentMenuName === "account" && <NavigationMenu displayMode={props.displayMode} menuItems={accountMenuItems} spacing={2} iconSize={2} />}
					{currentMenuName === "notifications" && 
						<React.Fragment>
							<div className="header-menu-header">
								Notifications
							</div>
							<div className="header-menu-scroll">
								<NotificationsList displayMode={props.displayMode} notifications={notifications} spacing={2} iconSize={2} />
							</div>
							<div className="view-all-notifications">
								<Link to="/notifications">All Notifcations</Link>
							</div>
						</React.Fragment>
					}
				</div>
			}
		</React.Fragment>
    );
}