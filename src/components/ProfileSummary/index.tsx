import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from '../../services/TranslationService';

import { Button } from '../Button';
import { Heading } from '../Heading';
import { ProfileDetails } from '../ProfileDetails';
import { ProfileIntro } from '../ProfileIntro';

import "./ProfileSummary.scss";

export function ProfileSummary(props: 
{
	displayMode?: DisplayMode; 
	translations: any;
	profileId?: string; 
}) 
{
	const namespaceClassName = "profile-summary";

	const [introEditMode, setIntroEditMode] = React.useState<"view" | "edit">("view");
	const [introHasData, setIntroHasData] = React.useState<boolean>(false);

	const [detailsEditMode, setDetailsEditMode] = React.useState<"view" | "edit">("view");
	const [detailsHasData, setDetailsHasData] = React.useState<boolean>(false);
	
	const [showModal, setShowModal] = React.useState<boolean>(false);

	const trxService = TranslationService();
	
	const openModal = () => 
	{
		setShowModal(true);
	}

	const closeModal = () => 
	{
		setShowModal(false);
		
		setDetailsEditMode("view");
	}
	
	const onProfileIntroUpdated = (isEditing: boolean, length: number) => 
	{
		setIntroEditMode(isEditing ? "edit" : "view");

		setIntroHasData(length > 0);
	};

	const addIntro = () => 
	{
		setIntroEditMode("edit");
	};

	const onProfileDetailDataLoaded = (hasData: boolean) => 
	{		
		setDetailsHasData(hasData);
	};

	const onProfileDetailsUpdated = (isEditing: boolean, length: number) => 
	{

		setDetailsHasData(length > 0);
	};

	const handleModifyDetails = () => 
	{
		setDetailsEditMode("edit");

		openModal();
	};

	const handleCancelEditDetails = () => 
	{
		setDetailsEditMode("view");

		closeModal();
	};

	const cssClasses: string[] = ["card", "profile-section", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

	return (
		<div className={cssClasses.join(" ")}>
			<div className="profile-section-head">
				<Heading size={2} text={trxService.trx(props.translations, "heading_intro")} displayMode={props.displayMode} />
			</div>
			<div className="profile-section-body">
				<ul>
					<li>
						{!introHasData && introEditMode !== "edit" && <Button displayMode={props.displayMode} hierarchy="secondary" label={trxService.trx(props.translations, "add_bio")} onClick={addIntro} cssClassNames="btn-secondary-light" />}
						{(introHasData || introEditMode === "edit") && <ProfileIntro mode={introEditMode} profileId={props.profileId} displayMode={props.displayMode} translations={props.translations} onUpdate={onProfileIntroUpdated} />}
					</li>
					<li>
						{!detailsHasData && <span className="btn btn-secondary-light" onClick={handleModifyDetails}>{trxService.trx(props.translations, "add_details")}</span>}
						<ProfileDetails mode="view" profileId={props.profileId} displayMode={props.displayMode} translations={props.translations} onUpdate={onProfileDetailsUpdated} onDataLoad={onProfileDetailDataLoaded} onEditButtonClick={handleModifyDetails} />
					</li>
				</ul>

			{showModal && detailsEditMode === "edit" && 
				<div className={namespaceClassName + "-modal modal"} tabIndex={-1} style={{display: "block"}}>
					<div className="modal-dialog modal-dialog-centered modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">{trxService.trx(props.translations, "heading_profile_details")}</h5>
								<button type="button" className="btn-close" aria-label={trxService.trx(props.translations, "close")} onClick={closeModal}></button>
							</div>
							<div className="modal-body">
								<ProfileDetails mode={detailsEditMode} profileId={props.profileId} displayMode={props.displayMode} translations={props.translations} onUpdate={onProfileDetailsUpdated} onCancelButtonClick={handleCancelEditDetails} />						
							</div>
						</div>
					</div>
				</div>}
			</div>
		</div>
	);
};