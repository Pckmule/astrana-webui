import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { IImage } from '../../types/interfaces/image';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import MediaItemService from '../../services/MediaItemService';

import { Image } from './../../components/Image';
import { Heading } from '../Heading';

import "./ProfilePhotos.scss";

export function ProfilePhotos(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId?: string; 
}) 
{
    const [photos, setPhotos] = React.useState<IImage[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    const mediaItemService = MediaItemService();
    
    const loadInitialData = async () => 
    {
		await mediaItemService.getPhotos(undefined, undefined, 1, 9).then((images: IImage[]) => 
		{
			if(images)
				setPhotos(images);
		})
		.catch((error: Error) => {
			console.dir(error);
		});
    };

    useEffect(() => {
		loadInitialData();
    }, []);

    const cssClasses: string[] = ["card", "profile-section", "rounded", "mt-3 mb-3"];

    if(props.displayMode === DisplayMode.Stencil)
		  cssClasses.push("stencil");

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;
  
	return (
		<div className={cssClasses.join(" ")}>
			<div className="profile-section-head">
				<Heading size={2} text={trxService.trx(props.translations, "heading_photos")} btnLinkUrl={urlBuilder.profileUrl("photos", props.profileId)} btnText={trxService.trx(props.translations, "heading_all_photos")} displayMode={props.displayMode} />
			</div>
			<div className="profile-section-body">
				<div className="photos-grid">
				{
					(photos).map((photo: IImage) => (
						<span key={photo.id} className="photo">
							<Image id={photo.id} location={photo.location} width={150} height={150} enableViewer={true} displayMode={props.displayMode} />
						</span>
					))
				}
				</div>
			</div>
		</div>
	);
};