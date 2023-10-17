import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import { Link } from 'react-router-dom';
import { ProfileImage } from '../ProfileImage';

import "./ProfileCard.scss";

export interface IProfileCardState {
	profilePicture: string;
	coverPicture: string;
	fullName: string;
	description?: string;
	profileUrl: string;
}

export function ProfileCard(props: { displayMode?: DisplayMode; translations: any; profilePicture?: string; coverPicture?: string; fullName: string; description?: string; url?: string; })
{
	const profilePictureUrl = props.profilePicture ?? "";
	const coverPictureUrl = props.coverPicture ?? "";
	const fullName = props.fullName ?? "";
	const description = props.description ?? "";
	const profileUrl = props.url ?? "";
	
	const cssClasses: string[] = ["card", "profile-card", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<React.Fragment>
			<div className={cssClasses.join(" ")}>
				<div className="profile-card-body">
				<div className="details">
					<div className="profile-bg-image" style={{backgroundImage: "url('" + coverPictureUrl + "')"}}></div>
				
					<Link to={profileUrl}>
						<div className="profile-picture rounded">
							<ProfileImage translations={props.translations} peerName={fullName} imageAddress={profilePictureUrl} width={64} height={64} />
						</div>
						<div className="name m-3">{fullName}</div>
					</Link>
				
					<p className="description m-3">
						{description}
					</p>
				</div>

				<div className="items pt-2">
					<a href="/my-items/"><span>My items</span></a>
				</div>
				</div>
			</div>
		</React.Fragment>
	);
};