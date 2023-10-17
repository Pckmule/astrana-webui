import React, { useEffect } from 'react';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';

import { INotification } from '../../types/interfaces/notification';

import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import UserService from '../../services/UserService';

import { Header } from './../../components/Header';
import { NotificationsList } from '../../components/NotificationsList';
import { NavigationMenu } from '../../components/NavigationMenu';

import './NotificationsPage.scss';

export function NotificationsPage(props: {}) 
{
	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Loading);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });

	const [currentUserInformation, setCurrentUserInformation] = React.useState<any>({});

	const settingsService = SettingsService();
	const trxService = TranslationService();
	const userService = UserService();
	
	const loadInitialData = async () => 
	{
			await userService.getProfile().then(async (response: any | undefined) => 
			{
					setCurrentUserInformation(response);
					
					await settingsService.getAll().then(async (response: any | undefined) => 
					{
							setCurrentUserSettings(response);

							await trxService.getTranslations(settingsService.findValue(response, "Language Code") ?? "EN").then((response: any | undefined) => 
							{
									setTranslations(response);
									
									setLoadStatus(ReadyStatus.Loaded);
							})
							.catch((error: Error | undefined) => {
									console.log(error);
							});
					})
					.catch((error: Error | undefined) => {
							console.log(error);
					});
			})
			.catch((error: Error | undefined) => {
					console.log(error);
			});
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const menuItems = [
		{ text: trxService.trx(translations, "nav_menuitem_community_feed"), href: "", iconName: "card-text-outline" },
		{ text: trxService.trx(translations, "nav_menuitem_pin_boards"), href: "pinboards", iconName: "view-dashboard" },
		{ text: trxService.trx(translations, "nav_menuitem_news_reader"), href: "newsfeed", iconName: "newspaper-variant-outline" }, 
		{ text: trxService.trx(translations, "nav_menuitem_profile"), href: "profile", iconName: "account-circle" }
	];

	const notifications: INotification[] = [
		{ type: "general", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", data: {} },
		{ type: "general", text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", data: {} },
		{ type: "general", text: "When an unknown printer took a galley of type and scrambled it to make a type specimen book.test", data: {} },
		{ type: "general", text: "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.", data: {} },
		{ type: "general", text: "It was popularised in the 1960s.", data: {} }
	];

	const cssClasses: string[] = ["notifications-card", "rounded", "mb-3"];

	const isPageReady = loadStatus !== ReadyStatus.Loaded ? ReadyStatus.Loading : ReadyStatus.Ready;
	const displayMode = !isPageReady ? DisplayMode.Stencil : DisplayMode.Normal;

	return(
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} user={currentUserInformation} />
	
			<div className="container-fluid page-content">
				<div className="row g-0">
					<div className="main-content col-12 col-sm-12 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-6 offset-xl-3">
						<main>
							<div className={cssClasses.join(" ")}>
								<div className="profile-card-body">								
									<NotificationsList displayMode={displayMode} notifications={notifications} spacing={2} iconSize={2} />
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}