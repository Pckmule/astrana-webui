import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { INavigationMenuItem } from '../../types/interfaces/navigationMenuItem';
import { IPeerInformation } from '../../types/interfaces/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import { NavigationMenu } from './../../components/NavigationMenu';
import { ProfileDetails } from '../ProfileDetails';
import { ProfileIntro } from '../ProfileIntro';

import "./ProfileAbout.scss";

export function ProfileAbout(props: 
{ 
	displayMode?: DisplayMode;
	translations: any;
	profileId?: string; 
}) 
{
	const [profileInformation, setProfileAbout] = React.useState<IPeerInformation[]>([]);

	const trxService = TranslationService();
	const urlBuilder = UrlBuilderService();
	
	const loadInitialData = async () => 
	{
		//setProfileAbout(await videoService.getPeers(1, props.pageSize ?? 20));
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const cssClasses: string[] = ["card", "profile-about", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	const menuItems: INavigationMenuItem[] = [
	  { name: "basic_info", text: trxService.trx(props.translations, "about_nav_menuitem_basic_info"), href: urlBuilder.profileUrl("about_basic_info") },
	  { name: "contact_info", text: trxService.trx(props.translations, "about_nav_menuitem_contact_info"), href: urlBuilder.profileUrl("about_contact_info") }
	];

	const activeItemName = "basic_info";

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

	return (
		<div className={cssClasses.join(" ")}>
			<div className="profile-about-head">
				<h2>
					{trxService.trx(props.translations, "heading_about")}
					<button className="btn btn-sm btn-link float-end">{trxService.trx(props.translations, "add_photos_slash_videos")}</button>
				</h2>
			</div>
			<div className="profile-about-body">
				<div className="profile-about">

					<div className="row">
						<div className="col-12 col-sm-4 col-md-3 col-lg-3 col-xl-3">
							<NavigationMenu menuItems={menuItems} activeItemName={activeItemName} displayMode={props.displayMode} />
						</div>

						<div className="col-12 col-sm-8 col-md-9 col-lg-9 col-xl-9">
						{activeItemName === "basic_info" &&
							<React.Fragment>
								<ProfileIntro mode="view" profileId={props.profileId} displayMode={props.displayMode} translations={props.translations} />
								<ProfileDetails mode="view" profileId={props.profileId} displayMode={props.displayMode} translations={props.translations} />
							</React.Fragment>
						}
						</div>
					</div>

				</div>
			</div>
		</div>
	);
};