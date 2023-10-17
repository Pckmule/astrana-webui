import React from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';

import { IPeerProfile } from '../../types/interfaces/peerProfile';
import { IPeerSummary } from '../../types/interfaces/peerSummary';
import { IContentCollection } from '../../types/interfaces/contentCollection';
import { IImage } from '../../types/interfaces/image';

import DataLoadUtility from '../../services/DataLoadUtility';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import PeerService from '../../services/PeerService';
import UserService from '../../services/UserService';
import ContentCollectionService from '../../services/ContentCollectionService';
import UrlBuilderService from '../../services/UrlBuilderService';

import { Header } from './../../components/Header';

import { ProfileHeader } from '../../components/ProfileHeader';
import { ProfileSummary } from '../../components/ProfileSummary';
import { ProfilePhotos } from '../../components/ProfilePhotos';
import { ProfilePeers } from '../../components/ProfilePeers';

import { PostEditor } from './../../components/PostEditor';
import { ProfilePosts } from '../../components/ProfilePosts';

import { ProfileAbout } from '../../components/ProfileAbout';

import { PeersList } from '../../components/PeersList';
import { PeerRequestsList } from '../../components/PeerRequestsList';

import { ProfileMedia } from '../../components/ProfileMedia';

import './ProfilePage.scss';

export function ProfilePage() 
{	
	const urlBuilder = UrlBuilderService();
	const urlParts = urlBuilder.parseProfileUrl(useLocation().pathname);

	const getProfileId = () => 
	{
		if(urlParts && urlParts.profileId)
			return urlParts.profileId;

		return "me";
	};

	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });
	const [instancePeerSummary, setInstancePeerSummary] = React.useState<IPeerSummary>();

	const [profileId, setProfileId] = React.useState<string>(getProfileId());
	const [peerSummary, setPeerSummary] = React.useState<IPeerSummary>();
	const [peerProfile, setPeerProfile] = React.useState<IPeerProfile>();
	const [peerProfilePicture, setPeerProfilePicture] = React.useState<IImage>();
	const [peerProfileCoverPicture, setPeerProfileCoverPicture] = React.useState<IImage>();
	
	const [peersSample, setPeersSample] = React.useState<IPeerSummary[]>([]);
	
	const [refreshTimestamp, setRefreshTimestamp] = React.useState<string>("");

	const dataLoadUtility = DataLoadUtility();
	const settingsService = SettingsService();
	const trxService = TranslationService();
	const peerService = PeerService();
	const userService = UserService();
	const contentCollectionService = ContentCollectionService();
	
	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		await settingsService.getAll().then(async (settings: any | undefined) => 
		{
			if(settings)
				setCurrentUserSettings(settings);
				
			countPreloadCompletionAsync();

			await trxService.getTranslations(settingsService.findValue(settings, "Language Code", settingsService.defaults.languageCode)).then((trx: any | undefined) => 
			{
				setTranslations(trx);
				countPreloadCompletionAsync();
			})
			.catch((error: Error) => { console.log(error); });
			
			await userService.getInstancePeerSummary().then((instancePeerSummary: IPeerSummary) => 
			{
				setInstancePeerSummary(instancePeerSummary);
				countPreloadCompletionAsync();
				
				if(profileId === "me")
				{
					setPeerSummary(instancePeerSummary);
					countPreloadCompletionAsync();
				}
			})
			.catch((error: Error) => { console.log(error); });
			
			if(profileId && !_.isEmpty(profileId) && profileId !== "me")
			{
				await peerService.getSummary(profileId).then((peerSummary: IPeerSummary) => 
				{
					setPeerSummary(peerSummary);
					countPreloadCompletionAsync();
				})
				.catch((error: Error) => { console.log(error); });				
			}

			await userService.getProfile().then(async (peerProfile: IPeerProfile) => 
			{
				setPeerProfile(() => peerProfile);
				countPreloadCompletionAsync();
				
				if(peerProfile.profilePicturesCollection && peerProfile.profilePicturesCollection.id)
				{
					await contentCollectionService.getContentCollection(peerProfile.profilePicturesCollection.id, true).then(async (pictureCollection: IContentCollection) => 
					{
						if(pictureCollection?.contentItems && pictureCollection.contentItems.length > 0 && pictureCollection.contentItems[0].image)
							setPeerProfilePicture(() => pictureCollection.contentItems[0].image);

						countPreloadCompletionAsync();
					})
					.catch((error: Error) => { console.log(error); });
				}
				else
				{
					countPreloadCompletionAsync();
				}

				if(peerProfile.coverPicturesCollection && peerProfile.coverPicturesCollection.id)
				{
					await contentCollectionService.getContentCollection(peerProfile.coverPicturesCollection.id, true).then(async (pictureCollection: IContentCollection) => 
					{
						if(pictureCollection?.contentItems && pictureCollection.contentItems.length > 0 && pictureCollection.contentItems[0].image)
							setPeerProfileCoverPicture(() => pictureCollection.contentItems[0].image);

						countPreloadCompletionAsync();
					})
					.catch((error: Error) => { console.log(error); });
				}
				else
				{
					countPreloadCompletionAsync();
				}
			})
			.catch((error: Error) => { console.log(error); });
		})
		.catch((error: Error) => { 
			console.log(error); 
		});
	};

	dataLoadUtility.handleLoad(loadStatus, setLoadStatus, loadInitialData, 6, preloadCount);

	const isPageReady = () => 
	{
		return dataLoadUtility.isLoadComplete(loadStatus);
	}

	let currentPage = "posts";
	let navCurrentPage = currentPage;
	
	let albumId = undefined;

	if(urlParts)
	{
		const profileSection = urlParts.section && !_.isEmpty(urlParts.section) ? urlParts.section : "posts";
		const profileSectionContentId = urlParts.sectionContentId ?? "";
		
		currentPage = profileSection;
		navCurrentPage = currentPage;

		if(navCurrentPage.indexOf("_") > -1)
			navCurrentPage = navCurrentPage.substring(0, navCurrentPage.indexOf("_"));

		if(profileSection === "albums")
		{
			currentPage = "album";
			albumId = profileSectionContentId;
		}
	}

	const onPostEditorPost = (data: any) => 
	{
		setRefreshTimestamp(() => new Date().toString());
		console.dir(data);
	}

	const getProfileMediaTabName = () => 
	{
		if(currentPage === "photos" || currentPage === "videos")
			return "items";
			
		if(currentPage === "photos_albums" || currentPage === "videos_albums" || currentPage === "albums")
			return "albums";
		
		if(currentPage === "album")
			return "album";
		
		return undefined;
	};

	const getProfileMediaType = () => 
	{
		if(currentPage === "photos" || currentPage === "photos_albums" || currentPage === "albums")
			return MediaType.Image;
			
		if(currentPage === "videos" || currentPage === "videos_albums")
			return MediaType.Video;

		return undefined;
	};

	const profileFullName = peerService.buildPeerFullName(peerProfile);

	const displayMode = !isPageReady() ? DisplayMode.Stencil : DisplayMode.Normal;

	return(
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} user={peerProfile} />
		
			<div className="container-fluid page-content">
				<div className="row g-0">

					<div className="main-content col-12 col-sm-12 col-md-12 col-lg-10 col-xl-8 offset-lg-1 offset-xl-2">
						
					<div className="row">
						<div className="col-12">
							<ProfileHeader profileId={profileId} profileUserFullName={profileFullName} peersSample={peersSample} profilePicture={peerProfilePicture} coverPicture={peerProfileCoverPicture} currentPageName={navCurrentPage} translations={translations} displayMode={displayMode} />
						</div>
					</div>
						
					{ currentPage === "posts" &&
						<div className="row">
							<div className="col-12 col-sm-5 col-md-4 col-lg-5 col-xl-5">
								<ProfileSummary profileId={profileId} displayMode={displayMode} translations={translations} />
								<ProfilePhotos profileId={profileId} displayMode={displayMode} translations={translations} />
								{ instancePeerSummary && <ProfilePeers profileId={profileId} displayMode={displayMode} translations={translations} currentPeerConnectionDetails={instancePeerSummary} /> }
							</div>
							
							<div className="col-12 col-sm-7 col-md-8 col-lg-7 col-xl-7">
								<main>
									<PostEditor peerProfile={peerProfile} displayMode={displayMode} translations={translations} onPostCallback={onPostEditorPost} />
									
									{ profileId && instancePeerSummary && <ProfilePosts instancePeerSummary={instancePeerSummary} peerProfileId={profileId} displayMode={displayMode} translations={translations} refreshTimestamp={refreshTimestamp} /> }
								</main>
							</div>
						</div>
					}
					
					{ currentPage !== "posts" &&
						<div className="row">
							<div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
								<main>
									{ currentPage === "about" && <ProfileAbout profileId={peerSummary?.profileId} displayMode={displayMode} translations={translations} /> }
									{ currentPage === "peers" && <PeersList currentPeerConnectionDetails={instancePeerSummary} displayMode={displayMode} translations={translations} pageSize={100} /> }
									{ currentPage === "peers-requests" && <PeerRequestsList profileId={peerSummary?.profileId} displayMode={displayMode} translations={translations} pageSize={100} /> }
									{ ((currentPage === "photos" || currentPage === "photos_albums" || currentPage === "videos" || currentPage === "videos_albums" || currentPage === "album") && instancePeerSummary) && 
										<ProfileMedia profileId={peerSummary?.profileId} instancePeerSummary={instancePeerSummary} albumId={albumId} tab={getProfileMediaTabName()} mediaType={getProfileMediaType()} displayMode={displayMode} translations={translations} pageSize={100} /> 
									}							
								</main>
							</div>
						</div>
					}
					
					</div>

				</div>
			</div>
		</React.Fragment>
	);
}