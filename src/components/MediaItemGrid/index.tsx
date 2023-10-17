
import React, { useEffect, useRef } from 'react';
import { useWindowSize } from '../../hooks/useWindowResize';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';

import { IMediaItem } from '../../types/interfaces/mediaItem';

import UrlBuilderService from '../../services/UrlBuilderService';
import MediaItemService from '../../services/MediaItemService';

import { Image } from '../../components/Image';
import { Video } from '../Video';

import "./MediaItemGrid.scss";

export function MediaItemsGrid(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	mediaItems: IMediaItem[];
	albumId?: string; 
	profileId?: string; 
	pageSize?: number; 
}) 
{
	const namespaceClassName = "mediaitem";

	const [windowWidth, setWindowWidth] = React.useState<number>(0);
	const [itemsPerRowCount, setItemsPerRowCount] = React.useState<number>(0);

	const urlBuilder = UrlBuilderService();
	const mediaItemService = MediaItemService();
	
	useEffect(() => {
	if(window.innerWidth >= 1140)
		setItemsPerRowCount(7);
	else if(window.innerWidth > 960)
		setItemsPerRowCount(5);
	else if(window.innerWidth >= 720)
		setItemsPerRowCount(3);
	else if(window.innerWidth >= 540)
		setItemsPerRowCount(2);			
	else
		setItemsPerRowCount(1);
			
	}, [windowWidth]);

	const [newWindowWidth] = useWindowSize();
	
	if(newWindowWidth !== windowWidth)
		setWindowWidth(newWindowWidth);

	const gridContainerRef = useRef<HTMLDivElement>(null);	
	const gridContainerDims = gridContainerRef?.current?.getBoundingClientRect();

	const percentagePx = (gridContainerDims?.width ?? 600) / 100;

	const itemWidth = ((100 - itemsPerRowCount) / itemsPerRowCount);
	const itemHeight = (Math.floor(percentagePx * ((100 - itemsPerRowCount) / itemsPerRowCount)));

	const cssClasses: string[] = [namespaceClassName + "-grid"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");
	
	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;
	
	return (
		<div ref={gridContainerRef} className={cssClasses.join(" ")}>
		{
			(props.mediaItems).map((mediaItem: IMediaItem) => (
				<span className={namespaceClassName + " rounded"} key={mediaItem.id} style={{width: itemWidth + "%" }}>
					{ mediaItem.typeId === MediaType.Image && <Image id={mediaItem.id} location={mediaItem.address} setId={props.albumId} height={itemHeight} enableViewer={true} displayMode={props.displayMode} /> }
					{ mediaItem.typeId === MediaType.Video && <Video id={mediaItem.id} sources={[mediaItemService.buildVideoSource(mediaItem.address)]} setId={props.albumId} height={itemHeight} fit="cover" enableViewer={true} displayMode={props.displayMode} /> }
				</span>
			))
		}
		</div>
	);
};