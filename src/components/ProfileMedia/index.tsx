import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';
import { ReadyStatus } from '../../types/enums/readyStatus';

import { IPeerSummary } from '../../types/interfaces/peerSummary';
import { IContentCollection } from '../../types/interfaces/contentCollection';
import { IMediaItem } from '../../types/interfaces/mediaItem';

import UrlBuilderService from '../../services/UrlBuilderService';
import TranslationService from '../../services/TranslationService';
import ContentCollectionService from '../../services/ContentCollectionService';
import MediaItemService from '../../services/MediaItemService';
import UserService from '../../services/UserService';

import { Link } from 'react-router-dom';
import { ProfileAlbumsGrid } from '../ProfileAlbumsGrid';
import { MediaItemsGrid } from '../MediaItemGrid';
import { InteractionsPanel } from '../InteractionsPanel';

import "./ProfileMedia.scss";
import { Tabs } from '../Tabs';
import { ITab } from '../../types/interfaces/tabs';
import { IImage } from '../../types/interfaces/image';
import { IVideo } from '../../types/interfaces/video';

export function ProfileMedia(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	tab?: "items" | "albums" | "album";	
	mediaType?: MediaType; 
	profileId?: string; 
	instancePeerSummary?: IPeerSummary;
	albumId?: string; 
	pageSize?: number;
}) 
{
	
	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [contentCollection, setContentCollection] = React.useState<IContentCollection>();
	const [mediaItems, setMediaItems] = React.useState<IMediaItem[]>([]);

	const urlBuilder = UrlBuilderService();
	const trxService = TranslationService();
	const contentCollectionService = ContentCollectionService();
	const mediaItemService = MediaItemService();
	const userService = UserService();

	const hasInitialDataLoaded = () => 
	{
		return (loadStatus !== ReadyStatus.Loaded && preloadCount === 1);
	}

	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		if(props.albumId && !_.isEmpty(props.albumId))
		{
			await contentCollectionService.getContentCollection(props.albumId, true).then(async (album: IContentCollection) => 
			{
				if(album)
					setContentCollection(album);
				
				setLoadStatus(ReadyStatus.Loaded);
				countPreloadCompletionAsync();
			})
			.catch((error: Error) => 
			{
				// show warning
				console.log(error); 
				
				setLoadStatus(ReadyStatus.LoadError);
			});
		}
		else
		{
			if(props.mediaType === MediaType.Image)
			{
				await mediaItemService.getPhotos().then(async (images: IImage[]) => 
				{
					if(images)
					{
						const mediaItems: IMediaItem[] = [];

						for(const image of images)
						{
							mediaItems.push({
								id: image.id ?? "",
								typeId: MediaType.Image,
								address: image.location,
								width: image.width,
								height: image.height,
								fileSizeBytes: image.fileSizeBytes
							});
						}

						setMediaItems(mediaItems);
					}

					setLoadStatus(ReadyStatus.Loaded);
					countPreloadCompletionAsync();
				})
				.catch((error: Error) => 
				{
					// show warning
					console.log(error); 
					
					setLoadStatus(ReadyStatus.LoadError);
				});
			}
			else if(props.mediaType === MediaType.Video)
			{
				await mediaItemService.getVideos().then(async (videos: IVideo[]) => 
				{
					if(videos)
					{
						const mediaItems: IMediaItem[] = [];

						for(const video of videos)
						{
							mediaItems.push({
								id: video.id ?? "",
								typeId: MediaType.Video,
								address: video.location,
								width: video.width,
								height: video.height,
								fileSizeBytes: video.fileSizeBytes
							});
						}

						setMediaItems(mediaItems);
					}

					setLoadStatus(ReadyStatus.Loaded);
					countPreloadCompletionAsync();
				})
				.catch((error: Error) => 
				{
					// show warning
					console.log(error); 
					
					setLoadStatus(ReadyStatus.LoadError);
				});
			}
		}
	};

	const isReady = () => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}
	
	if(hasInitialDataLoaded()) { setLoadStatus(ReadyStatus.Loaded); }

	if(loadStatus === ReadyStatus.Ready)
	{
		loadInitialData();
	}

	let heading = "";	
	const tabs: ITab[] = [];

	if(props.albumId && !_.isEmpty(props.albumId))
	{
		heading =  contentCollection?.name ?? trxService.trx(props.translations, "unnamed_album");
	}
	else
	{
		if(props.mediaType === MediaType.Video)
		{
			heading = trxService.trx(props.translations, "heading_videos");
			
			tabs.push({ id: "items", title: trxService.trx(props.translations, "your_videos"), url: urlBuilder.profileUrl("videos", props.profileId) });
			tabs.push({ id: "albums", title: trxService.trx(props.translations, "your_albums"), url: urlBuilder.profileUrl("videos_albums", props.profileId) });
		}
		else
		{
			heading = trxService.trx(props.translations, "heading_photos");

			tabs.push({ id: "items", title: trxService.trx(props.translations, "your_photos"), url: urlBuilder.profileUrl("photos", props.profileId) });
			tabs.push({ id: "albums", title: trxService.trx(props.translations, "your_albums"), url: urlBuilder.profileUrl("photos_albums", props.profileId) });
		}
	}

	const getMediaItems = (contentCollection?: IContentCollection) => 
	{
		const mediaItems: IMediaItem[] = [];

		if(!contentCollection)
			return mediaItems;

		for(const contentItem of contentCollection.contentItems)
		{
			if(contentItem.imageId && contentItem.image)
			{
				mediaItems.push({
					id: contentItem.imageId,
					typeId: contentItem.mediaType,
					address: contentItem.image?.location,
					displayOrder: contentItem.displayOrder
				});
			}

			if(contentItem.videoId && contentItem.video)
			{
				mediaItems.push({
					id: contentItem.videoId,
					typeId: contentItem.mediaType,
					address: contentItem.video?.location,
					displayOrder: contentItem.displayOrder
				});
			}

			if(contentItem.audioId && contentItem.audio)
			{
				mediaItems.push({
					id: contentItem.audioId,
					typeId: contentItem.mediaType,
					address: contentItem.audio?.location,
					displayOrder: contentItem.displayOrder
				});
			}
		}

		return mediaItems;
	};
	
	const displayMode = props.displayMode === DisplayMode.Normal ? (!isReady() ? DisplayMode.Stencil : DisplayMode.Normal) : props.displayMode;

	const cssClasses: string[] = ["media-list", "rounded", "mt-3 mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	if(displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;
	
	return (
		<div className={cssClasses.join(" ")}>
			
			{ props.tab !== "album" && 
			<div className="card mb-5">
				<div className="media-list-head">
					<h2 className="mb-0">
						{heading}
						{ props.tab === "albums" && <Link to="/media/set/create" className="btn btn-sm btn-link float-end">{trxService.trx(props.translations, "add_album")}</Link> }
						<span className="btn btn-sm btn-link float-end">{trxService.trx(props.translations, "add_photos_slash_videos")}</span>
					</h2>
				</div>
				<div className="media-list-body">
					{(!props.albumId || !_.isEmpty(props.albumId)) && 
					<Tabs tabs={tabs} cssClassNames="media-list-body-tabs" displayMode={props.displayMode} />}
					
					<div className="media-list-body-content">
						<div className="media-grid">
							{ props.tab === "items" && <MediaItemsGrid profileId={props.profileId} mediaItems={mediaItems} displayMode={displayMode} translations={props.translations} /> }
							{ props.tab === "albums" && props.profileId && <ProfileAlbumsGrid profileId={props.profileId} displayMode={displayMode} translations={props.translations} /> }							
						</div>
					</div>
				</div>
			</div>}

			{ props.tab === "album" && <>
				<div className="card mb-4">
					<div className="media-list-head">
						<h2 className="mb-0">
							{heading}							
							<span className="btn btn-sm btn-link float-end">{trxService.trx(props.translations, "add_photos_slash_videos")}</span>
						</h2>
					</div>

					<div className="media-list-body">
						<div className="media-list-body-content">				
							<div className="media-details">
								<div className="media-details-caption">
								{ contentCollection?.contentItems.length } <span>{trxService.trx(props.translations, "items")}</span>
								{ (contentCollection?.caption && !_.isEmpty(contentCollection?.caption)) && <div className="ablum-caption"> { contentCollection?.caption } </div>}
								</div>
								{ props.instancePeerSummary && contentCollection && contentCollection?.id && 
									<InteractionsPanel peer={props.instancePeerSummary} targetContentId={contentCollection?.id} targetContentTypeId={"ContentCollection"} displayMode={displayMode} translations={props.translations} /> 
								}
							</div>
						</div>
					</div>
				</div>

				<div className="card mb-5">
					<div className="media-list-body">
						<div className="media-list-body-content">
							<div className="media-grid">
								{ props.tab === "album" && contentCollection && <MediaItemsGrid profileId={props.profileId} albumId={contentCollection.id} mediaItems={getMediaItems(contentCollection)} displayMode={displayMode} translations={props.translations} /> }
							</div>
						</div>
					</div>
				</div></>
			}
		</div>
	);
};