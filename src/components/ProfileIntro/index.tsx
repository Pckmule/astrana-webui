import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from '../../services/TranslationService';

import "./ProfileIntro.scss";

export interface IProfileDetail {
	id?: string;
	icon?: string;
	label: string;
	value: string;
	displayOrder?: number;
}

export function ProfileIntro(props: 
{
	mode: "view" | "edit"; 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId?: string; 
	maxLength?: number; 
	onUpdate?: (isEditing: boolean, length: number) => void; 
}) 
{  
    const namespaceClassName = "profile-intro";
    const maxLength = props.maxLength ?? 500;

    const [profileIntroText, setProfileIntroText] = React.useState<string>("");

    const trxService = TranslationService();
    
    const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => 
    {
        setProfileIntroText(event.target.value);

		if(props.onUpdate && typeof(props.onUpdate) === "function")
			props.onUpdate(true, profileIntroText.length);
    }
    
    const handleSave = () =>
    {
		if(profileIntroText.length > maxLength)
			return;
    }

    const handleCancel = () =>
    {
		if(props.onUpdate && typeof(props.onUpdate) === "function")
        	props.onUpdate(false, profileIntroText.length);
    }

    const cssClasses: string[] = [namespaceClassName, "mb-2"];

    if(props.displayMode === DisplayMode.Stencil)
    	cssClasses.push("stencil");
    
    if(props.mode === "view" && profileIntroText.length < 1)
    	return(<React.Fragment></React.Fragment>);

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

    return (
		<div className={cssClasses.join(" ")}>
			<div className={namespaceClassName + "-body mb-1"}>
				{props.mode === "edit" ? 
					<textarea className="rounded" placeholder={trxService.trx(props.translations, "profile_introduction_placeholder")} onChange={handleOnChange}>{profileIntroText}</textarea>
					: <span>{profileIntroText}</span> 
				}
			</div>

			{props.mode === "edit" && 
			<div className={namespaceClassName + "-foot"}>
				<span className="float-start">
					Public
				</span>
				<span className="float-end text-align-end">
					<span className="remaining-characters">{maxLength - profileIntroText.length} characters remaining</span>
					<input className="btn btn-sm btn-secondary-light" type="button" value={trxService.trx(props.translations, "cancel")} onClick={handleCancel} />
					<input className="btn btn-sm btn-primary" type="button" value={trxService.trx(props.translations, "save")} onClick={handleSave} />
				</span>
			</div>
			}
		</div>
    );
};