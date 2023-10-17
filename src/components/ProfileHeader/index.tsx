import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { Axis } from '../../types/enums/axis';

import { INavigationMenuItem } from '../../types/interfaces/navigationMenuItem';
import { IPeerSummary } from '../../types/interfaces/peerSummary';
import { IImage } from '../../types/interfaces/image';

import UrlBuilderService from "./../../services/UrlBuilderService";
import TranslationService from "./../../services/TranslationService";
import PeerService from '../../services/PeerService';

import { Link } from 'react-router-dom';
import { Button } from '../Button';
import { Image } from './../../components/Image';
import { CoverPhotoEditButton } from '../CoverPhotoEditButton';
import { ProfilePhotoEditButton } from '../ProfilePhotoEditButton';
import { NavigationMenu } from '../NavigationMenu';
import { Heading } from '../Heading';

import "./ProfileHeader.scss";

export function ProfileHeader(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId?: string; 
	coverPicture?: IImage; 
	profilePicture?: IImage; 
	profileUserFullName?: string; 
	peersSample: IPeerSummary[]; 
	currentPageName: string; 
})
{
    const namespaceClassName = "profile-header";

	const [coverPictureLocation, setCoverPictureUrl] = React.useState<string>();
	const [profilePictureLocation, setProfilePictureUrl] = React.useState<string>();

	const urlBuilder = UrlBuilderService();
	const trxService = TranslationService();
	const peerService = PeerService();
	
	const menuItems: INavigationMenuItem[] = [
		{ name: "posts", href: urlBuilder.profileUrl("posts", props.profileId, true),	text: trxService.trx(props.translations, "heading_posts") },
		{ name: "about", href: urlBuilder.profileUrl("about", props.profileId, true),	text: trxService.trx(props.translations, "heading_about") },
		{ name: "peers", href: urlBuilder.profileUrl("peers", props.profileId, true),	text: trxService.trx(props.translations, "heading_peers") },
		{ name: "photos", href: urlBuilder.profileUrl("photos", props.profileId, true),	text: trxService.trx(props.translations, "heading_photos") },
		{ name: "videos", href: urlBuilder.profileUrl("videos", props.profileId, true),	text: trxService.trx(props.translations, "heading_videos")	}
	];

	const onCoverPhotoChanged = (url: string) =>
	{
		setCoverPictureUrl(url);
	};

	const onProfilePhotoChanged = (url: string) =>
	{
		setProfilePictureUrl(url);
	};

	let coverPictureUrl = props.coverPicture?.location;
	
	if(coverPictureLocation && !_.isEmpty(coverPictureLocation))
		coverPictureUrl = coverPictureLocation;

	if(!coverPictureUrl || _.isEmpty(coverPictureUrl))
		coverPictureUrl = "/images/placeholder-profile-cover-picture.png";
	
	let profilePictureUrl = props.profilePicture?.location;
	
	if(profilePictureLocation && !_.isEmpty(profilePictureLocation))
		profilePictureUrl = profilePictureLocation;

	if(!profilePictureUrl || _.isEmpty(profilePictureUrl))
		profilePictureUrl = "/images/placeholder-profile-picture.png";
	
	const cssClasses: string[] = [namespaceClassName, "rounded", "mt-3 mb-4"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<div className={cssClasses.join(" ")}>
			<div className={`${namespaceClassName}-cover`}>
				
				<div className={`${namespaceClassName}-cover-picture`}>
					{props.displayMode === DisplayMode.Normal && <React.Fragment>
						<Link to={urlBuilder.pictureUrl("12345")} state={{backUrl: window.location.toString(), itemUrl: coverPictureUrl }}>
							<Image location={coverPictureUrl} height={350} maximumHeight={350} preload={false} />
						</Link>
						<CoverPhotoEditButton profileId={props.profileId} currentPageName={props.currentPageName} onUpload={onCoverPhotoChanged} displayMode={props.displayMode} translations={props.translations} />
					</React.Fragment>}
				</div>
			
				<div className={`${namespaceClassName}-summary`}>
					<div className={`${namespaceClassName}-profile-picture float-start`}>			 						
						<div className={`${namespaceClassName}-profile-picture2`}>
							<Link to={urlBuilder.pictureUrl("12345")} state={{backUrl: window.location.toString(), itemUrl: profilePictureUrl }}>
								<Image location={profilePictureUrl} width={150} height={150} maximumHeight={150} preload={false} />
							</Link>
							<ProfilePhotoEditButton profileId={props.profileId} currentPageName={props.currentPageName} onUpload={onProfilePhotoChanged} displayMode={props.displayMode} translations={props.translations} />
						</div>
					</div>

					<div className={`${namespaceClassName}-profile-name`}>
						<Heading size={1} text={props.profileUserFullName ?? ""} displayMode={props.displayMode} />
						
						<div className={`${namespaceClassName}-profile-peers-count`}>
							{(props.displayMode === DisplayMode.Stencil) ? <span className="text-placeholder" style={{width: 300}}>&nbsp;</span> : trxService.trx(props.translations, "friends_family_and_connections").replace("{{count}}", 'X') }		
						</div>
						
						<div className={`${namespaceClassName}-profile-peers`}>
							{props.peersSample && _.isArray(props.peersSample) && props.peersSample.map((peerSample, index) => (
								<Image location={peerService.getPeerProfilePictureUrlOrDefaultUrl(peerSample)} caption={peerService.buildPeerFullName(peerSample)} width={32} height={32} maximumHeight={32} preload={false} key={peerSample.id} />
							))}
						</div>
					</div>

					<div className={`${namespaceClassName}-profile-controls float-end`}>
						<Button displayMode={props.displayMode} hierarchy="secondary" iconName="pencil" label={trxService.trx(props.translations, "btn_edit_profile")} cssClassNames="btn-secondary-light" />
					</div>
				</div>

				<div className={`${namespaceClassName}-nav`}>
					<NavigationMenu displayMode={props.displayMode} displayStyle="pills" menuItems={menuItems} activeItemName={props.currentPageName} axis={Axis.Horizontal} spacing={2} />
				</div>

			</div>
		</div>
	);
};