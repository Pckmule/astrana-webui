import React, { useEffect, useRef } from 'react';
import { useWindowSize } from '../../hooks/useWindowResize';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { ContentCollectionType } from '../../types/enums/contentCollectionType';
import { OrderByDirection } from '../../types/enums/orderByDirection';

import { IContentCollection } from '../../types/interfaces/contentCollection';

import UrlBuilderService from '../../services/UrlBuilderService';
import TranslationService from '../../services/TranslationService';
import ContentCollectionService from '../../services/ContentCollectionService';

import { Image } from '../Image';
import { Link } from 'react-router-dom';

import "./ProfileAlbumsGrid.scss";

export function ProfileAlbumsGrid(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId: string; 
	pageSize?: number; 
}) 
{
	const namespaceClassName = "album";
	const placeholderAlbumCoverUrl = "/images/placeholder-album-cover-picture.png";

	const [albums, setAlbums] = React.useState<IContentCollection[]>([]);

	const [windowWidth, setWindowWidth] = React.useState<number>(0);
	const [itemsPerRowCount, setItemsPerRowCount] = React.useState<number>(0);
	
	const urlBuilder = UrlBuilderService();
	const trxService = TranslationService();
	const contentCollectionService = ContentCollectionService();
	
	const loadInitialData = async () => 
	{
		 await contentCollectionService.getContentCollections(true, ContentCollectionType.Album, "CreatedTimestamp", OrderByDirection.Descending, 1, props.pageSize ?? 20).then((collectionResponse: IContentCollection[]) => 
		 {
			 if(collectionResponse)
			 {
				setAlbums(collectionResponse);
			 }
 
			 //setLoadingStatus(LoadStatus.Loaded);
		 })
		 .catch((error: Error) => {
			 //setLoadingStatus(LoadStatus.Loaded);
		 });
	};

	useEffect(() => {
		loadInitialData();
	}, []);

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

	const getAlbumCoverPictureUrlOrDefault = (album?: IContentCollection) => 
	{
		if(!album)
			return placeholderAlbumCoverUrl;
		
		if(album.contentItems && album.contentItems.length > 0 && album.contentItems[0].image && album.contentItems[0].image.location)
			return album.contentItems[0].image.location ?? placeholderAlbumCoverUrl;

		return placeholderAlbumCoverUrl;
	};

	const cssClasses: string[] = [namespaceClassName + "-grid"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;
	
	return (
		<div ref={gridContainerRef} className={cssClasses.join(" ")}>
			{
			(albums ?? []).map((album: IContentCollection) => (
				<span className={namespaceClassName + " rounded"} key={album.id} style={{ width: itemWidth + "%" }}>
					<Link to={urlBuilder.albumUrl(album.id ?? "", props.profileId)} state={{backUrl: window.location.toString() }}>
						<span className={namespaceClassName + "-cover-image"}>
							<Image location={getAlbumCoverPictureUrlOrDefault(album)} height={itemHeight} displayMode={props.displayMode} />
						</span>
						<span className={namespaceClassName + "-details"}>
							{ album.name && !_.isEmpty(album.name) && <span className={namespaceClassName + "-details-name"}>{album.name}</span> }
							<span className={namespaceClassName + "-details-itemcount"}>{ album.itemCount ?? album.contentItems.length } {trxService.trx(props.translations, (!album.itemCount || album.itemCount > 1) ? "items" :	"item")}</span>
						</span>
					</Link>
				</span>
			))
			}
		</div>
	);
};