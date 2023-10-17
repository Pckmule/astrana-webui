import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from "./../../services/TranslationService";
import UserService from '../../services/UserService';

import { Button } from '../Button';

import "./CoverPhotoEditButton.scss";

export interface ICoverPhotoEditButtonState {
	coverPictureUrl: string;
	currentPageName: string;
}

export function CoverPhotoEditButton(props: 
{ 
	displayMode?: DisplayMode;
	translations: any, 
	profileId: string | undefined;
	coverPictureUrl?: string;
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

		userService.setCoverPicture(formData).then((response: any | undefined) => 
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
		const fileField = document.getElementById("edit_cover_photo_file_upload") as HTMLInputElement;
		
		if(!fileField)
			return;

		fileField.click();
	};

	return (
		<React.Fragment>
			<Button displayMode={props.displayMode} hierarchy="secondary" size="small" iconName="camera" label={trxService.trx(props.translations, "edit_cover_photo")} onClick={onClick} cssClassNames="edit-cover-photo-btn" />
			<input id="edit_cover_photo_file_upload" className="d-none" type="file" onChange={onFileSelect} />
		</React.Fragment>
	);
};