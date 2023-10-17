import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from "./../../services/TranslationService";
import UserService from '../../services/UserService';

import { Button } from '../Button';

import "./ProfilePhotoEditButton.scss";

export interface IProfilePhotoEditButtonState {
	profilePictureUrl: string;
	currentPageName: string;
}

export function ProfilePhotoEditButton(props: { 
	displayMode?: DisplayMode;
	translations: any, 
	profileId: string | undefined;
	profilePictureUrl?: string;
	currentPageName: string;
	onUpload: (url: string) => void;
}) 
{
	const trxService = TranslationService();
	const userService = UserService();
	
	const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		if(!(event.target.files instanceof FileList))
			return;

		const formData = new FormData();

		const file = event.target.files[0];

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(e: ProgressEvent<FileReader>) 
		{
			//console.dir(e.target?.result);
		};

		formData.append("file", file);

		userService.setProfilePicture(formData).then((response: any | undefined) => 
		{
			if(response.data.length < 1)
				return;
		
			props.onUpload(response.data.location);
			
		}).catch((error: Error | undefined) => {
			console.log(error);
		});
	};

	const onClick = () => 
	{
		const fileField = document.getElementById("edit_profile_photo_file_upload") as HTMLInputElement;
		
		if(!fileField)
			return;

		fileField.click();
	};

	const cssClasses: string[] = ["profile-header", "rounded", "mt-3 mb-4"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<React.Fragment>
			<Button displayMode={props.displayMode} hierarchy="secondary" size="small" iconName="camera" description={trxService.trx(props.translations, "edit_profile_photo")} onClick={onClick} cssClassNames="edit-profile-photo-btn" />
			<input id="edit_profile_photo_file_upload" className="d-none" type="file" onChange={onFileSelect} />
		</React.Fragment>
	);
};