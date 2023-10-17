import React, { useEffect } from "react";
import _ from "lodash";

import { ReadyStatus } from "../../types/enums/readyStatus";
import { DisplayMode } from "../../types/enums/displayMode";

import ApiService from "../../services/ApiService";
import SignalRService from "../../services/SignalRService";
import ToastService from '../../services/ToastService';
import UrlBuilderService from '../../services/UrlBuilderService';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import UserService from '../../services/UserService';
import PeerService from '../../services/PeerService';

import { INavigationMenuItem } from "../../types/interfaces/navigationMenuItem";
import { ISystemSetting } from "../../types/interfaces/settings";
import { IPeerProfile } from "../../types/interfaces/peerProfile";
import { IPeerConnectionDetails } from "../../types/interfaces/peerConnectionDetails";

import { Header } from "./../../components/Header";
import { NavigationMenu } from "../../components/NavigationMenu";
import { PostEditor } from "./../../components/PostEditor";
import { Feed } from "./../../components/Feed";
import { ProfileCard } from "./../../components/ProfileCard";
import { ConnectPeerForm } from "./../../components/ConnectPeerForm";
import { RemindersCard } from "../../components/RemindersCard";
import { PillBox } from "../../components/PillBox";
import { FormDropdownBox } from "../../components/FormDropdownBox";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
// import { DatePicker } from "react-datepicker";

import "./HomePage.scss";

export function HomePage(props: { }) 
{
	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	
	const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });
	const [peerProfile, setPeerProfile] = React.useState<IPeerProfile>();
	const [peerConnectionDetails, setPeerConnectionDetails] = React.useState<IPeerConnectionDetails>();
	
	const [feedSortDirection, setFeedSortDirection] = React.useState<string>("asc");
	const [showFilters, setShowFilters] = React.useState<boolean>(false);
	const [startDateFilter, setStartDateFilter] = React.useState<boolean>(false);

	const toastService = ToastService();
	const signalRService = SignalRService();
	const urlBuilder = UrlBuilderService();

	const settingsService = SettingsService();
	const trxService = TranslationService();
	const userService = UserService();
	const peerService = PeerService();
		
	useEffect(() => {
        signalRService.addListener("receivedMessage", () => { alert("registered") });
    }, []);

	const hasInitialDataLoaded = () => 
	{
		return (loadStatus !== ReadyStatus.Loaded && preloadCount === 3);
	}

	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		ApiService().canConnect().then(async () => 
		{
			await settingsService.getAll().then(async (settings: ISystemSetting[]) => 
			{
				setCurrentUserSettings(settings);
				countPreloadCompletionAsync();
	
				await trxService.getTranslations(settingsService.findValue(settings, "Language Code", settingsService.defaults.languageCode)).then((trx: any | undefined) => 
				{
					setTranslations(trx);
					countPreloadCompletionAsync();
				})
				.catch((error: Error) => { console.log(error); });
				
				await userService.getProfile().then(async (userProfileData: any | undefined) => 
				{
					setPeerProfile(() => userProfileData);
					countPreloadCompletionAsync();
				})
				.catch((error: Error) => { console.log(error); });
			})
			.catch((error: Error) => { console.log(error); });
		})
		.catch((error: Error) => 
		{ 
			// show warning
			console.log(error); 
			
			toastService.notify("Unable to connecto API.");

			setLoadStatus(ReadyStatus.LoadError);
		});		
	};

	const isPageReady = () => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}
	
	if(hasInitialDataLoaded()) { setLoadStatus(ReadyStatus.Loaded); }
  
	if(loadStatus === ReadyStatus.Ready)
	{
		loadInitialData();
	}

	const menuItems: INavigationMenuItem[] = [
	  { name: "community_feed", text: trxService.trx(translations, "nav_menuitem_community_feed"), href: "", iconName: "card-text-outline" },
	  { name: "pin_boards", text: trxService.trx(translations, "nav_menuitem_pin_boards"), href: "pinboards", iconName: "view-dashboard" },
	  { name: "news_reader", text: trxService.trx(translations, "nav_menuitem_news_reader"), href: "newsfeed", iconName: "newspaper-variant-outline" }, 
	  { name: "profile", text: trxService.trx(translations, "nav_menuitem_profile"), href: "profile", iconName: "account-circle" }
	];

	const onPostEditorPost = (data: any) => 
	{
		console.dir(data);
	}

	const toggleFilters = () =>
	{
		setShowFilters(showFilters === true ? false : true);
	}

	const filterPeers = () =>
	{
		
	}

	const changeSortDirection = () =>
	{
		setFeedSortDirection(feedSortDirection === "asc" ? "desc" : "asc");
	}

	const sortByOptions: any[] = [
		{label: trxService.trx(translations, "time"), value: "time"},
		{label: trxService.trx(translations, "popularity"), value: "popularity"}
	];

	const profilePictureUrl = _.first(peerProfile?.profilePicturesCollection?.contentItems)?.image?.location ?? undefined;
	const profileCoverPictureUrl = _.first(peerProfile?.coverPicturesCollection?.contentItems)?.image?.location ?? undefined;

	const displayMode = !isPageReady() ? DisplayMode.Stencil : DisplayMode.Normal;
	
	return(
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} user={peerProfile} />
			
			<div className="container-fluid page-content">
				<div className="row g-0">
					<div className={"drawer-l col-1 col-sm-2 col-md-2 col-lg-3 col-xl-2 d-none d-md-block" + (displayMode === DisplayMode.Stencil ? " stencil" : "")}>
						<NavigationMenu displayMode={displayMode} menuItems={menuItems} spacing={2} />
					</div>

					<div className="main-content col-12 col-sm-12 col-md-7 col-lg-6 col-xl-8">
						<main>
							<PostEditor displayMode={displayMode} peerProfile={peerProfile} translations={translations} onPostCallback={onPostEditorPost} />

							<div className="feed-settings mb-3">
								<div className="controls float-start pb-2 mb-3">
									<span className="controls-start float-start">									
										<IconButton displayMode={displayMode} buttonStyle="light" classNames="btn-sm filter-control me-1" iconName="filter-cog" onClick={toggleFilters} popoverText="Showing text, photos and link posts, from  Peer 1, Peer 2 and Peer 3, between start date/time and end date/time." />
										
										<PillBox displayMode={displayMode} translations={translations} />
									</span>
									<span className="controls-end float-end">									
										<span>
											<FormDropdownBox options={sortByOptions} value="" placeholder={trxService.trx(translations, "sort_by")} translations={translations} cssClasses="me-1" />
										</span>
										<IconButton displayMode={displayMode} buttonStyle="light" classNames="btn-sm" iconName={feedSortDirection === "asc" ? "sort-ascending" : "sort-descending"} onClick={changeSortDirection} />
									</span>
								</div>
								
								{showFilters && 
									<div className="feed-filters float-start mb-3">
										<div className="card">
											<div className="tabbed-container rounded">
												<ul className="tabbed-container-tabs">
													<li className="tabbed-container-tab">
														<span><Icon displayMode={displayMode} name="tag-multiple" /></span>
													</li>
													<li className="tabbed-container-tab">
														<span><Icon displayMode={displayMode} name="account-group" /></span>
													</li>
													<li className="tabbed-container-tab active">
														<span><Icon displayMode={displayMode} name="calendar-clock" /></span>
													</li>
													<li className="tabbed-container-tab">
														<span><Icon displayMode={displayMode} name="shape-plus" /></span>
													</li>
												</ul>
												<div className="tabbed-container-content">
												</div>
											</div>
										</div>
									</div>
								}
							</div>

							<div className="feed-content">
								<Feed displayMode={displayMode} translations={translations} />
							</div>
						</main>
					</div>

					<div className="drawer-r col-1 col-sm-1 col-md-3 col-lg-3 col-xl-2 d-none d-md-block">
						<ProfileCard fullName={peerService.buildPeerFullName(peerProfile)} url={urlBuilder.profileUrl()} description={peerProfile?.introduction} profilePicture={profilePictureUrl} coverPicture={profileCoverPictureUrl} displayMode={displayMode} translations={translations} /> 
						<ConnectPeerForm sourcePeerId={peerConnectionDetails?.id} sourcePeerFullName={peerConnectionDetails?.fullName} sourcePeerAddress={peerConnectionDetails?.address} displayMode={displayMode} translations={translations} />
						<RemindersCard displayMode={displayMode} translations={translations} />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}