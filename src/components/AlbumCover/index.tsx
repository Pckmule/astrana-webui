import React, { useRef } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';
import { UploadStatus } from '../../types/enums/uploadStatus';

import { IAlbumItem } from '../../types/interfaces/albumItem';
import { IVideo, IVideoSource } from '../../types/interfaces/video';

import MediaItemService from '../../services/MediaItemService';

import { Image } from '../Image';
import { Video } from '../Video';

import "./AlbumCover.scss";

export function AlbumCover(props: { displayMode?: DisplayMode; maxWidth: number; maxWidthUnit: string; maxHeight?: number; mediaItems: IAlbumItem[]; setId?: string; enableViewer?: boolean }) 
{
    const namespaceClassName = "album-cover-item";

	const placeholderBrokenImage = "/images/placeholder-broken-image.png";
	const placeholderBrokenVideo = "/images/placeholder-broken-video.png";
	const placeholderBrokenAudio = "/images/placeholder-broken-audio.png";
	const placeholderBrokenFile = "/images/placeholder-broken-file.png";

	const maximumItemDisplayCount = 5;

	const mediaItemService = MediaItemService();

	const cssClasses: string[] = ["album-cover"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	if(!props.displayMode || props.displayMode === DisplayMode.Normal)
	{
		cssClasses.push("ix" + (props.mediaItems.length < maximumItemDisplayCount ? props.mediaItems.length : maximumItemDisplayCount));
	}

	const sortedItems = _.sortBy(props.mediaItems, ['width', 'fileSizeBytes']);

	const getOverlayText = (itemIndex: number) => 
	{
		if(sortedItems.length < maximumItemDisplayCount + 1)
			return undefined;

		if(itemIndex > maximumItemDisplayCount - 1)
			return `${sortedItems.length - maximumItemDisplayCount + 1}+`;

		return undefined;
	};

	const calculateWidthRatioType = (width: number, height: number) => 
	{
		if(width === height)
			return "square"

		return width > height ? "wide" : "narrow";
	}

	const calculateItemDimensions = (itemIndex: number, parentWidth?: number, originalWidth?: number, originalHeight?: number) => 
	{
		const aspectRatio = (originalWidth && originalHeight) ? originalHeight / originalWidth : 1;

		let calculatedParentHeight = Math.ceil((parentWidth ?? props.maxWidth) * aspectRatio);
		let parentHeight = props.maxHeight && calculatedParentHeight > props.maxHeight ? props.maxHeight : calculatedParentHeight;
		let defaultWidth = parentWidth ?? props.maxWidth;
		let defaultHeight = !props.maxHeight || props.maxHeight < parentHeight ? parentHeight : props.maxHeight;

		let availableWidth = defaultWidth + 6;
		let availableHeight = defaultHeight;

		if(props.mediaItems.length === 2)
		{
			availableWidth = (defaultWidth * 0.5) - 1;

			if(itemIndex === 1)
			{
				availableWidth--;
			}
			
			availableHeight = defaultHeight;
		}
		else if(props.mediaItems.length === 3)
		{
			if(itemIndex === 1)
			{
				availableWidth = defaultWidth;
				availableHeight = (defaultHeight * 0.6) - 1;
			}
			else
			{
				availableWidth = (defaultWidth * 0.5) - 1;
				availableHeight = defaultHeight * 0.4;
			}
		}
		else if(props.mediaItems.length === 4)
		{
			if(itemIndex === 1)
			{
				availableWidth = defaultWidth;
				availableHeight = (defaultHeight * 0.6) - 1;
			}
			else
			{
				availableWidth = (defaultWidth * 0.33) - 1;
				availableHeight = defaultHeight * 0.4;
			}
		}
		else if(props.mediaItems.length > 4)
		{
			if(itemIndex < 3)
			{
				availableWidth = (defaultWidth * 0.6) - 1;
				availableHeight = defaultHeight * 0.5;
				
				if(itemIndex === 2) 
				availableHeight--;
			}
			else
			{
				availableWidth = defaultWidth * 0.4;
				availableHeight = defaultHeight * 0.3333;

				if(itemIndex < 5) 
				availableHeight--;
			}
		}
		
		return {
			width: Math.floor(availableWidth),
			height: Math.floor(availableHeight)
		};
	}

	const getFailedUploadImage = (mediaType: MediaType) =>
	{
		switch(mediaType)
		{
			case MediaType.Image:
				return placeholderBrokenImage;
			
			case MediaType.Video:
				return placeholderBrokenVideo;
					
			case MediaType.Audio:
				return placeholderBrokenAudio;
		}

		return placeholderBrokenFile;
	}

	const buildMediaItem = (item: IAlbumItem, itemIndex: number, availableWidth?: number, enableViewer?: boolean) => 
	{
		if(!item) return;

		const className = namespaceClassName + "-" + (itemIndex);
		
		const dimensions = calculateItemDimensions(itemIndex, availableWidth, item.width, item.height);

		const coverPictureUrl = item.previewUrl ? item.previewUrl : item.url ?? undefined;

		const videoSources: IVideoSource[] = [];
		
		if(item.mediaType === MediaType.Video && item.url)
			videoSources.push(mediaItemService.buildVideoSource(item.url));
		
		return <React.Fragment key={"ai-" + itemIndex}>
			{item.mediaType === MediaType.Image && item.uploadStatus === UploadStatus.Uploaded && coverPictureUrl && !_.isEmpty(coverPictureUrl) &&
				<Image id={item.referenceId} location={coverPictureUrl ?? ""} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} enableViewer={!_.isEmpty(item.referenceId) && enableViewer === true} setId={props.setId} />
			}
			
			{(item.mediaType === MediaType.Image && (item.uploadStatus === UploadStatus.Uploading || item.uploadStatus === UploadStatus.Pending) && (!coverPictureUrl || _.isEmpty(coverPictureUrl))) &&
				<Image id={item.referenceId} location={""} displayMode={DisplayMode.Working} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} />
			}
			
			{item.mediaType === MediaType.Image &&(item.uploadStatus === UploadStatus.Error) &&
				<Image id={item.referenceId} location={getFailedUploadImage(item.mediaType)} displayMode={DisplayMode.Normal} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} />
			}

			{item.mediaType === MediaType.Video && item.uploadStatus === UploadStatus.Uploaded && coverPictureUrl && !_.isEmpty(coverPictureUrl) &&
				<Video id={item.referenceId} poster={coverPictureUrl ?? ""} sources={videoSources} width={dimensions.width} height={dimensions.height} cssClassNames={className} enableViewer={!_.isEmpty(item.referenceId) && enableViewer === true} setId={props.setId} />
			}
			
			{(item.mediaType === MediaType.Video && (item.uploadStatus === UploadStatus.Uploading || item.uploadStatus === UploadStatus.Pending) && (!coverPictureUrl || _.isEmpty(coverPictureUrl))) &&
				<Video id={item.referenceId} poster="" sources={[]} displayMode={DisplayMode.Working} width={dimensions.width} height={dimensions.height} cssClassNames={className}  />
			}
			
			{item.mediaType === MediaType.Video &&(item.uploadStatus === UploadStatus.Error) &&
				<Video id={item.referenceId} poster={getFailedUploadImage(item.mediaType)} sources={[]} displayMode={DisplayMode.Normal} width={dimensions.width} height={dimensions.height} cssClassNames={className} />
			}

			{item.mediaType === MediaType.Audio && item.uploadStatus === UploadStatus.Uploaded && coverPictureUrl && !_.isEmpty(coverPictureUrl) &&
				<Image id={item.referenceId} location={coverPictureUrl ?? ""} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} enableViewer={!_.isEmpty(item.referenceId) && enableViewer === true} setId={props.setId} />
			}
			
			{(item.mediaType === MediaType.Audio && (item.uploadStatus === UploadStatus.Uploading || item.uploadStatus === UploadStatus.Pending) && (!coverPictureUrl || _.isEmpty(coverPictureUrl))) &&
				<Image id={item.referenceId} location={""} displayMode={DisplayMode.Working} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} />
			}
			
			{item.mediaType === MediaType.Audio &&(item.uploadStatus === UploadStatus.Error) &&
				<Image id={item.referenceId} location={getFailedUploadImage(item.mediaType)} displayMode={DisplayMode.Normal} width={dimensions.width} height={dimensions.height} cssClassNames={className} overlayText={getOverlayText(itemIndex)} />
			}
		</React.Fragment>
	};

	const buildItem = (enableViewer: boolean, item: IAlbumItem, itemIndex: number, availableWidth?: number) => 
	{
		if(!item) return;

		return buildMediaItem(item, itemIndex, availableWidth, enableViewer);
	};

	const buildLayout = (items: IAlbumItem[]) => 
	{
		const enableViewer = props.enableViewer === true;
		const availableWidth = nodeRef.current?.clientWidth;

		const column1: (JSX.Element | undefined)[] | null | undefined = [];
		const column2: (JSX.Element | undefined)[] | null | undefined = [];
		
		for(let i = 1; i < maximumItemDisplayCount + 1; i++)
		{
			if(items.length < 5)
			{
				column1.push(buildItem(enableViewer, items[i-1], i, availableWidth));
			}
			else
			{
				if(i < 3)
				{
					column1.push(buildItem(enableViewer, items[i-1], i, availableWidth));
				}
				else
				{
					column2.push(buildItem(enableViewer, items[i-1], i, availableWidth));
				}
			}
		}

		if(column1.length > 0 && column2.length > 0)
		{
			return <React.Fragment>
				<div className="album-cover-col-start">{column1}</div>
				<div className="album-cover-col-end">{column2}</div>
			</React.Fragment>;
		}

		return <React.Fragment>
			{column1}
		</React.Fragment>;
	};

	const nodeRef = useRef<HTMLDivElement>(null);

	return (
		<div ref={nodeRef} className={cssClasses.join(" ")}>
			{buildLayout(sortedItems)}
		</div>
	);
};