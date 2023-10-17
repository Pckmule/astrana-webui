import React, { useRef } from 'react';
import _ from 'lodash';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';

import { IMediaItem } from '../../types/interfaces/mediaItem';
import { IImage } from '../../types/interfaces/image';
import { IVideo } from '../../types/interfaces/video';
import { IAudio } from '../../types/interfaces/audio';
import { IContentCollection, IContentCollectionItem } from '../../types/interfaces/contentCollection';
import { IPeerSummary } from '../../types/interfaces/peerSummary';

import UuidUtility from '../../services/UuidUtility';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import UserService from '../../services/UserService';
import MediaItemService from '../../services/MediaItemService';
import ContentCollectionService from '../../services/ContentCollectionService';

import { Link, useLocation } from 'react-router-dom';
import { Image } from './../../components/Image';
import { Video } from '../../components/Video';
import { Icon } from '../../components/Icon';
import { Heading } from '../../components/Heading';
import { InteractionsPanel } from '../../components/InteractionsPanel';

import './MediaPage.scss';

export function MediaPage() 
{	
	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });
	const [instancePeerSummary, setInstancePeerSummary] = React.useState<IPeerSummary>();
	const [currentUserProfile, setCurrentUserProfile] = React.useState<any>({ __loading: true });

	const [expandedMode, setExpandedMode] = React.useState<"collapsed" | "expanded">("collapsed");
	const [mediaItemOriginalHeight, setMediaItemOriginalHeight] = React.useState<number>(-1);
	
	const [currentMediaItemId, setCurrentMediaItemId] = React.useState<string>("");	
	const [currentMediaType, setCurrentMediaType] = React.useState<MediaType>();
	
	const [currentMediaItemImage, setActiveMediaItemImage] = React.useState<IImage>();
	const [currentMediaItemVideo, setActiveMediaItemVideo] = React.useState<IVideo>();
	const [currentMediaItemAudio, setActiveMediaItemAudio] = React.useState<IAudio>();

	const [mediaSetId, setMediaSetId] = React.useState<string>("");
	const [mediaCollection, setMediaCollection] = React.useState<IContentCollection>();
	
	const uuidUtility = UuidUtility();
	const settingsService = SettingsService();
	const trxService = TranslationService();
	const urlBuilder = UrlBuilderService();
	const userService = UserService();
	const mediaItemService = MediaItemService();
	const contentCollectionService = ContentCollectionService();
	
	const location = useLocation();
	const backUrl = location.state?.backUrl ?? "/";

	const getMediaItemId = () => 
	{
		if(location.state?.itemId && !_.isEmpty(location.state?.itemId))
			return location.state?.itemId;

		let id = (document.location.toString().split("/").pop() ?? "").split("?")[0];
		
		if(id && !_.isEmpty(id))
			return id;

		id = (new URL(document.location.toString())).searchParams.get("id") ?? "";
		
		if(id && !_.isEmpty(id))
			return id;

		return "";
	};
	
	const getMediaItemType = () => 
	{
		if(location.state?.itemMediaType && !_.isEmpty(location.state?.itemMediaType))
		{
			switch(location.state?.itemMediaType)
			{
				case MediaType.Image:
					return MediaType.Image;
			
				case MediaType.Video:
					return MediaType.Video;
			
				case MediaType.Audio:
						return MediaType.Audio;
			}
		}

		return undefined;
	};
	
	const getMediaItemAddress = () => 
	{
		if(location.state?.itemUrl && !_.isEmpty(location.state?.itemUrl))
			return location.state?.itemUrl;

		return location.state?.itemUrl ?? "";
	};
	
	const getMediaSetId = () => 
	{
		if(location.state?.setId && !_.isEmpty(location.state?.setId))
			return location.state?.setId;

		let id = (new URL(document.location.toString())).searchParams.get("set") ?? "";
		
		if(id && !_.isEmpty(id))
			return id;

		return "";
	};

	const hasInitialDataLoaded = () => 
	{
		return (loadStatus !== ReadyStatus.Loaded && preloadCount === 4);
	}

	const setActiveMediaItem = (itemType: MediaType, itemId: string, address: string) => 
	{
		if(itemType === MediaType.Image)
		{
			setActiveMediaItemImage({
				id: itemId,
				location: address
			});
		}
		else if(itemType === MediaType.Video)
		{
			setActiveMediaItemVideo({
				id: itemId,
				location: address
			});
		}
		else if(itemType === MediaType.Audio)
		{
			setActiveMediaItemAudio({
				id: itemId,
				location: address
			});
		}
	}

	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		const activeItemId = getMediaItemId();
		const activeItemType = getMediaItemType() ?? MediaType.Image;
		const activeItemAddress = getMediaItemAddress();

		setCurrentMediaItemId(activeItemId);
		setCurrentMediaType(activeItemType);

		setActiveMediaItem(activeItemType, activeItemId, activeItemAddress);

		const activeItemSetId = getMediaSetId();

		setMediaSetId(activeItemSetId);

		if(activeItemSetId && !_.isEmpty(activeItemSetId))
		{
			await contentCollectionService.getContentCollection(activeItemSetId, true).then(async (contentCollection: IContentCollection) => 
			{
				setMediaCollection(contentCollection);

				const contentItem =_.find(contentCollection.contentItems, function(o) 
				{ 
					return o.imageId === activeItemId || o.videoId === activeItemId || o.audioId === activeItemId; 
				});

				if(contentItem?.mediaType === MediaType.Image)
				{
					if(contentItem && contentItem.image)
						setActiveMediaItemImage(contentItem.image);
				}
				else if(contentItem?.mediaType === MediaType.Video)
				{
					if(contentItem && contentItem.video)
						setActiveMediaItemVideo(contentItem.video);
				}
				else if(contentItem?.mediaType === MediaType.Audio)
				{
					if(contentItem && contentItem.audio)
						setActiveMediaItemAudio(contentItem.audio);
				}

				countPreloadCompletionAsync();
			})
			.catch((error: Error) => { console.log(error); });
		}
		else
		{
			setMediaCollection({
				name: "",
				contentItems: [{
					mediaType: activeItemType,
					
					image: activeItemType === MediaType.Image ? { id: activeItemId, location: activeItemAddress } : undefined,
					imageId: activeItemType === MediaType.Image ? activeItemId : undefined,
	
					video: activeItemType === MediaType.Video ? { id: activeItemId, location: activeItemAddress } : undefined,
					videoId: activeItemType === MediaType.Video ? activeItemId : undefined,
	
					audio: activeItemType === MediaType.Audio ? { id: activeItemId, location: activeItemAddress } : undefined,
					audioId: activeItemType === MediaType.Audio ? activeItemId : undefined
				}]
			});	
			
			countPreloadCompletionAsync();	
		}

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
			.catch((error: Error | undefined) => { console.log(error); });
			
			await userService.getInstancePeerSummary().then((instancePeerSummary: IPeerSummary) => 
			{
				setInstancePeerSummary(instancePeerSummary);
				countPreloadCompletionAsync();
			})
			.catch((error: Error) => { console.log(error); });
			
			await userService.getProfile().then(async (userProfileData: any | undefined) => 
			{
				setCurrentUserProfile(() => userProfileData);
				countPreloadCompletionAsync();
			})
			.catch((error: Error | undefined) => { console.log(error); });
		})
		.catch((error: Error | undefined) => { console.log(error); });
	};

	const isPageReady = () => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}
	
	if(hasInitialDataLoaded()) {  setLoadStatus(ReadyStatus.Loaded);  }
	
	if(loadStatus === ReadyStatus.Ready)
	{
		loadInitialData();
	}

	const handleExpand = () => 
	{
		setExpandedMode("expanded");
	};
	
	const handleCollapse = () => 
	{
		setExpandedMode("collapsed");
	};
	
	const getCurrentItemIndex = () => 
	{
		if(!mediaCollection)
			return 0;

		const index = _.findIndex(mediaCollection?.contentItems, { id: currentMediaItemId, mediaType: currentMediaType });

		const itemCount = mediaCollection ? mediaCollection.contentItems.length : 0;

		return (index > -1 && index < itemCount) ? index : 0;
	};

	const getPreviousItemIndex = () => 
	{
		if(!mediaCollection)
			return 0;

		const currentIndex = getCurrentItemIndex();
		
		if(currentIndex > 0)
			return currentIndex - 1;
		
		return mediaCollection?.contentItems.length - 1;
	};

	const getNextItemIndex = () => 
	{
		if(!mediaCollection)
			return 0;

		const currentIndex = getCurrentItemIndex();
		
		if(currentIndex < mediaCollection.contentItems.length - 1)
			return currentIndex + 1;

		return 0;
	};
	
	const getMediaItemByIndex = (itemIndex: number) : IContentCollectionItem | undefined => 
	{
		if(mediaCollection && mediaCollection.contentItems && itemIndex < mediaCollection.contentItems.length && itemIndex >= 0)
			return mediaCollection.contentItems[itemIndex];
		
		return undefined;
	}

	const getMediaItemUrl = (itemIndex: number) => 
	{
		const mediaItem = getMediaItemByIndex(itemIndex);
		
		if(!mediaItem)
			return window.location.toString();

		switch(mediaItem.mediaType)
		{
			case MediaType.Image:
			{
				const id = mediaItem.image?.id ?? mediaItem.imageId;

				return (id && id !== uuidUtility.emptyGuid ? urlBuilder.pictureUrl(id, mediaSetId) : mediaItem.image?.location) ?? "";
			}
			case MediaType.Video:
			{
				const id = mediaItem.video?.id ?? mediaItem.videoId;

				return (id && id !== uuidUtility.emptyGuid ? urlBuilder.videoUrl(id, mediaSetId) : mediaItem.video?.location) ?? "";
			}
			case MediaType.Audio:
			{
				const id = mediaItem.audio?.id ?? mediaItem.audioId;

				return (id && id !== uuidUtility.emptyGuid ? urlBuilder.audioUrl(id, mediaSetId) : mediaItem.audio?.location) ?? "";
			}
		}

		return "/";
	}

	interface ITargetContent
	{
		id: string;
		type: string;
	}

	const getTargetContent = (mediaItem?: IContentCollectionItem) : ITargetContent | undefined => 
	{
		if(!mediaItem)
			return undefined

		switch(mediaItem.mediaType)
		{
			case MediaType.Image:
				return { id: mediaItem.image?.id ?? mediaItem.imageId ?? "", type: "Image" };
		
			case MediaType.Video:
				return { id: mediaItem.video?.id ?? mediaItem.videoId ?? "", type: "Video" };
		
			case MediaType.Audio:
				return { id: mediaItem.audio?.id ?? mediaItem.audioId ?? "", type: "Audio" };
		}
		
		return undefined;
	}
	
	const mediaContentContainer = useRef<HTMLDivElement>(null);
	
	const mediaContentContainerDims = mediaContentContainer?.current?.getBoundingClientRect();
	const constrainHeight = mediaContentContainerDims && mediaItemOriginalHeight > -1 && mediaContentContainerDims?.height <= mediaItemOriginalHeight;

	function handleCurrentImageLoaded(e: any) 
	{
		if(e && e.target)
		{
			setMediaItemOriginalHeight(e.target.getBoundingClientRect().height);
		}
		else
			setMediaItemOriginalHeight(-1);
	}

	function handleCurrentImageErrored(e: any) 
	{
		setMediaItemOriginalHeight(-1);
	}

	console.dir(mediaCollection?.contentItems);
	console.dir("getPreviousItemIndex: " + getPreviousItemIndex());
	console.dir("getCurrentItemIndex: " + getCurrentItemIndex());
	console.dir(getMediaItemUrl(getPreviousItemIndex()));
	console.dir("---------------");

	const handleNav = (event: React.MouseEvent<HTMLAnchorElement>, url: string, mediaItem?: IContentCollectionItem) => 
	{
		event.preventDefault();
		
		window.history.replaceState({}, "", url);
		
		if(!mediaItem)
			return;

		switch(mediaItem.mediaType)
		{
			case MediaType.Image:
				setActiveMediaItem(mediaItem.mediaType, (mediaItem.image?.id ?? mediaItem.imageId ?? ""), mediaItem.image?.location ?? "");
				break;
		
			case MediaType.Video:
				setActiveMediaItem(mediaItem.mediaType, (mediaItem.video?.id ?? mediaItem.videoId ?? ""), mediaItem.video?.location ?? "");
				break;
		
			case MediaType.Audio:
				setActiveMediaItem(mediaItem.mediaType, (mediaItem.audio?.id ?? mediaItem.audioId ?? ""), mediaItem.audio?.location ?? "");
				break;
		}
	};

	const previousItemIndex = getPreviousItemIndex();
	const nextItemIndex = getNextItemIndex();
	const currentItemIndex = getCurrentItemIndex();

	const targetContent = getTargetContent(getMediaItemByIndex(currentItemIndex));

	const displayMode = !isPageReady() ? DisplayMode.Stencil : DisplayMode.Normal;

	const mediaSummaryCssClasses: string[] = ["media-summary", "col-12 col-sm-2 col-md-2 col-lg-2 col-xl-2"];

	if(displayMode === DisplayMode.Stencil)
		mediaSummaryCssClasses.push("stencil");

	return(
		<React.Fragment>
			<div className="container-fluid g-0 mediaitem-page-content">
				<div className="row g-0">				
					<div ref={mediaContentContainer} className={"media-lightbox " + (expandedMode === "expanded" ? "col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" : "col-12 col-sm-12 col-md-10 col-lg-10 col-xl-10")}>
						<div className="media-lightbox-controlbar">
							<div className="media-lightbox-controlbar-start">
								<span className="btn btn-back">
									<Link to={backUrl} state={{backUrl: backUrl, useCachedData: true }}><Icon name="close" altText={trxService.trx(translations, "back")} /></Link>
								</span>
							</div>

							<div className="media-lightbox-controlbar-end">
								<span className="btn">
									<Icon name="magnify-plus-outline" altText={trxService.trx(translations, "zoom_in")} />
								</span>
								
								<span className="btn">
									<Icon name="magnify-minus-outline" altText={trxService.trx(translations, "zoom_out")} />
								</span>

								<span className="btn">
									<Icon name="tag" altText={trxService.trx(translations, "tag")} />
								</span>

								{ expandedMode === "collapsed" && 
								<span className="btn" onClick={handleExpand}>
									<Icon name="arrow-expand" altText={trxService.trx(translations, "fullscreen")} />
								</span>}
								
								{ expandedMode === "expanded" && 
								<span className="btn" onClick={handleCollapse}>
									<Icon name="arrow-collapse" altText={trxService.trx(translations, "exit_fullscreen")} />
								</span>}
							</div>
						</div>
						
						<div className="media-lightbox-previous">							
							<a href={getMediaItemUrl(previousItemIndex)} onClick={(e) => handleNav(e, getMediaItemUrl(previousItemIndex), getMediaItemByIndex(currentItemIndex))}>
								<span className="btn">
									<Icon name="chevron-left" altText={trxService.trx(translations, "previous")} />
								</span>
							</a>
						</div>

						<div className="media-lightbox-next">
							<a href={getMediaItemUrl(nextItemIndex)} onClick={(e) => handleNav(e, getMediaItemUrl(nextItemIndex), getMediaItemByIndex(currentItemIndex))}>
								<span className="btn">
									<Icon name="chevron-right" altText={trxService.trx(translations, "next")} />
								</span>
							</a>
						</div>

						<span className="media-lightbox-content">
							{(currentMediaType === MediaType.Image && currentMediaItemImage && constrainHeight) && 
								<Image location={currentMediaItemImage.location} height={mediaContentContainerDims?.height} />}
								
							{(currentMediaType === MediaType.Image && currentMediaItemImage && !constrainHeight) && 
								<Image location={currentMediaItemImage?.location} />}

							{(currentMediaType === MediaType.Video && currentMediaItemVideo && constrainHeight) && 
								<Video sources={[mediaItemService.buildVideoSource(currentMediaItemVideo?.location ?? "")]} height={mediaContentContainerDims?.height} />}
								
							{(currentMediaType === MediaType.Video && currentMediaItemVideo && !constrainHeight && currentMediaItemImage) && 
								<Video sources={[mediaItemService.buildVideoSource(currentMediaItemVideo?.location ?? "")]} />}
								
							{(currentMediaType === MediaType.Video && currentMediaItemAudio && constrainHeight) && 
								<Video sources={[mediaItemService.buildVideoSource(currentMediaItemAudio?.location ?? "")]} height={mediaContentContainerDims?.height} />}
								
							{(currentMediaType === MediaType.Video && currentMediaItemAudio && !constrainHeight && currentMediaItemImage) && 
								<Video sources={[mediaItemService.buildVideoSource(currentMediaItemAudio?.location ?? "")]} />}
						</span>
					</div>

					{expandedMode === "collapsed" &&
					<div className={mediaSummaryCssClasses.join(" ")}>
						<div className="media-summary-content">
							{ mediaCollection?.name && !_.isEmpty(mediaCollection?.name) && <Heading size={1} text={mediaCollection?.name} displayMode={displayMode} /> }							
						</div>
						{ instancePeerSummary && targetContent && targetContent?.id && targetContent?.type && 
							<InteractionsPanel peer={instancePeerSummary} targetContentId={targetContent?.id} targetContentTypeId={targetContent.type} displayMode={displayMode} translations={translations} /> 
						}
					</div>}
				</div>
			</div>
			
			<img src={currentMediaItemImage?.location} alt={"Loading"} onLoad={handleCurrentImageLoaded} onError={handleCurrentImageErrored} style={{ position: "absolute", top: -10000, left: -10000 }} />
		</React.Fragment>
	);
}