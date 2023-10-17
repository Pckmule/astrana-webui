import React, { useEffect } from 'react';
import _ from 'lodash';
import Sortable from 'sortablejs';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from '../../services/TranslationService';

import { Icon } from '../Icon';
import { IconSelector } from '../IconSelector';
import { TextBox } from '../TextBox';
import { IconButton } from '../IconButton';

import "./ProfileDetails.scss";

export interface IProfileDetail {
	key: string;
	icon?: string;
	label: string;
	value: string;
	displayOrder?: number;
}

export function ProfileDetails(props: 
{ 
	mode: "view" | "edit"; 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId?: string;
	onUpdate?: (isEditing: boolean, length: number) => void; 
	onDataLoad?: (hasData: boolean) => void; 
	onEditButtonClick?: () => void; 
	onCancelButtonClick?: () => void
}) 
{	
	interface IProfileDetailSettings 
	{
		notifications?: [];
	}
  
	const namespaceClassName = "profile-details";

	const defaultIcon = "information-outline";
	const defaultDetailSettings: IProfileDetailSettings = {};

	const [profileDetails, setProfileDetails] = React.useState<IProfileDetail[]>([]);
	
	const [newDetailIcon, setNewDetailIcon] = React.useState<string>(defaultIcon);
	const [newDetailLabel, setNewDetailLabel] = React.useState<string>("");
	const [newDetailValue, setNewDetailValue] = React.useState<string>("");
	const [newDetailAudiences, setNewDetailAudiences] = React.useState<[]>([]);
	const [newDetailSettings, setNewDetailSettings] = React.useState<IProfileDetailSettings>(defaultDetailSettings);

	const trxService = TranslationService();
		
	useEffect(() => {

	  setProfileDetails([
		{
			key: "university",
			label: "University",
			value: "University of London",
			icon: "school-outline",
			displayOrder: 1
		},
		{
			key: "high_school",
			label: "High School",
			value: "Jan van Riebeek",
			icon: "school-outline",
			displayOrder: 2
		},
		{
			key: "current_town_city",
			label: "Current town/city",
			value: "Cape Town",
			icon: "home-city-outline",
			displayOrder: 3
		},
		{
			key: "hometown",
			label: "Hometown",
			value: "Cape Town",
			icon: "home-city-outline",
			displayOrder: 4
		},
		{
			key: "birthday",
			label: "Birthday",
			value: "21 Oct 1988",
			icon: "cake-variant-outline",
			displayOrder: 5
		},
		{
			key: "relationship_status",
			label: "Relationship Status",
			value: "In a relationship with Bonnie Yang",
			icon: "heart-outline",
			displayOrder: 6
		}]
	  );

	  setTimeout(() => {
		if(props.onDataLoad && typeof(props.onDataLoad) === "function")
			props.onDataLoad(true);
		}, 100);

	}, []);

	const handleOnChange = () => 
	{
		if(props.onUpdate && typeof(props.onUpdate) === "function")
			props.onUpdate(true, profileDetails.length);
	}
	
	const handleEditButtonClick = () =>
	{
		if(props.onEditButtonClick && typeof(props.onEditButtonClick) === "function")
			props.onEditButtonClick();
	}

	const handleCancel = () =>
	{
		if(props.onCancelButtonClick && typeof(props.onCancelButtonClick) === "function")
			props.onCancelButtonClick();
	}

	const handleSave = () =>
	{
	}

	const getDetailKeyFromName = (name: string) =>
	{
		return name.replace(" ", "_").replace("/", "_").replace("\\", "_").replace(/[\W_]+/g," ").toLowerCase();
	}

	const addNewDetail = () =>
	{
		if(_.isEmpty(newDetailIcon) || _.isEmpty(newDetailLabel) || _.isEmpty(newDetailValue))
			return;

		const changeState = (state: IProfileDetail[]) => 
		{
			const updatedState: IProfileDetail[] = [...state];
	
			updatedState.push({
				key: getDetailKeyFromName(newDetailLabel),
				icon: newDetailIcon,
				label: newDetailLabel,
				value: newDetailValue,
				displayOrder: state.length
			});

			return updatedState;
		};

		setProfileDetails(state => changeState(state));

		setNewIcon(defaultIcon);
		setNewLabel("");
		setNewValue("");
	};

	const removeDetail = (key: string) => 
	{
		if(_.isEmpty(key))
			return;

		const changeState = (state: IProfileDetail[]) => 
		{
			const updatedState: IProfileDetail[] = [...state];

			const index = updatedState.findIndex((item: IProfileDetail) => { return item.key === key; });

			if(index > -1)
				updatedState.splice(index, 1);

			return updatedState;
		};

		setProfileDetails(state => changeState(state));
	};

	const setNewIcon = (value: string) => {
		setNewDetailIcon(value);
	};

	const setNewLabel = (value: string) => {
		setNewDetailLabel(value);
	};

	const setNewValue = (value: string) => {
		setNewDetailValue(value);
	};

	const setNewAudiences = (value: []) => {
		setNewAudiences(value);
	};

	const handleReorder = (key: string, displayOrder: number) => 
	{
		const changeState = (state: IProfileDetail[]) => 
		{
			const updatedState: IProfileDetail[] = [...state];
	
			const itemIndex = state.findIndex((item) => { return item.key === key });
			
			if(itemIndex < 0) 
				return state;

			const itemToUpdate = state[itemIndex];

			if(!itemToUpdate) 
				return state;

			itemToUpdate.displayOrder = displayOrder;

			updatedState[itemIndex] = itemToUpdate;

			return updatedState;
		};

		setProfileDetails(state => changeState(state));
	}

	const buildDetailHtml = (mode: string, detail: IProfileDetail, ) =>
	{
		if(mode === "view")
			return (<li className={namespaceClassName + "-detail"}>
			<span className="detail-icon"><Icon name={detail.icon ?? defaultIcon} marginEnd={1} altText={detail.label + " icon"} /> </span>
				<span className="detail-label">{detail.label}</span>
				<span className="detail-value">{detail.value}</span>
			</li>);

		if(mode === "edit")
			return (
				<li data-key={detail.key} className={namespaceClassName + "-detail editable"}>
					<IconSelector name={detail.icon ?? defaultIcon} altText={detail.label + " icon"} className="detail-icon me-2" />
		
					<TextBox value={detail.label} placeholder={trxService.trx(props.translations, "detail_name")} minimumLength={1} maximumLength={50} cssClassName="detail-label me-2" />			
					<TextBox value={detail.value} placeholder={trxService.trx(props.translations, "detail_value")} minimumLength={1} maximumLength={50} cssClassName="detail-value me-2" />
		
					<IconButton iconName="account-group" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "privacy_settings")} classNames="detail-privacy me-2" />
					<IconButton iconName="cog" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "detail_settings")} classNames="detail-settings me-2" />

					<IconButton iconName="trash-can-outline" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "remove")} classNames="detail-remove me-2" onClick={() => removeDetail(detail.key)} />
					<Icon name="arrow-up-down" altText="Re-order" className="detail-reorder drag-handle" />
				</li>
		  	);

		if(mode === "add")
			return (
				<li data-key={detail.key} className={namespaceClassName + "-detail editable"}>
					<IconSelector name={detail.icon ?? defaultIcon} altText={detail.label + " icon"} className="detail-icon me-2" onChange={setNewIcon} />
		
					<TextBox value={detail.label} placeholder={trxService.trx(props.translations, "detail_name")} minimumLength={1} maximumLength={50} cssClassName="detail-label me-2" onChange={setNewLabel} onEnterKeyPress={addNewDetail} />			
					<TextBox value={detail.value} placeholder={trxService.trx(props.translations, "detail_value")} minimumLength={1} maximumLength={50} cssClassName="detail-value me-2" onChange={setNewValue} onEnterKeyPress={addNewDetail} />
		
					<IconButton iconName="account-group" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "privacy_settings")} classNames="detail-privacy me-2" />
					<IconButton iconName="cog" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "detail_settings")} classNames="detail-settings me-2" />

					<IconButton iconName="plus-circle-outline" buttonStyle="secondary-light-outline" displayMode={props.displayMode} altText={trxService.trx(props.translations, "add")} classNames="detail-add me-2" onClick={addNewDetail} />
					<span className="detail-reorder"></span>
				</li>
			);
	}
	
	const listRef = React.useRef<HTMLUListElement>(null);
	
	useEffect(() => 
	{
		if(!(listRef.current as HTMLElement))
			return;

		setTimeout(() => 
		{
			Sortable.create(listRef.current as HTMLElement, { 
				handle: ".drag-handle", 
				ghostClass: "sortable-ghost", 
				animation: 150,
				onEnd: function(evt: any) 
				{
					handleReorder(evt.item.dataset.key, evt.newIndex);
				}
			});
		}, 100);

	}, []);

	const cssClasses: string[] = [namespaceClassName, "mb-2"];

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

	return (
		<React.Fragment>
			<div className={cssClasses.join(" ")}>
				{(props.mode === "view" && props.onEditButtonClick && typeof(props.onEditButtonClick) === "function") && <span className={namespaceClassName + "-edit-control btn btn-sm btn-link float-end rounded"} onClick={handleEditButtonClick}>{trxService.trx(props.translations, "edit")}</span>}
				<div className={namespaceClassName + "-body mb-3"}>
					{profileDetails && profileDetails.length > 0 && 			
						<React.Fragment>
							<ul ref={listRef}>
							{
								(profileDetails).map((detail: IProfileDetail, index: number) => (
								<React.Fragment key={detail.key} >
									{buildDetailHtml(props.mode, detail)}
								</React.Fragment>
								))
							}
							</ul>
						</React.Fragment>
					}
				
					{props.mode === "edit" && 
					<ul>
						{buildDetailHtml("add", { key: getDetailKeyFromName(newDetailLabel), label: newDetailLabel, value: newDetailValue, icon: newDetailIcon })}
					</ul>}
				</div>
				{props.mode === "edit" && <div className={namespaceClassName + "-foot"}>
				<span className="float-end text-align-end">
					<input className="btn btn-sm btn-secondary-light me-1" type="button" value={trxService.trx(props.translations, "cancel")} onClick={handleCancel} />
					<input className="btn btn-sm btn-primary" type="button" value={trxService.trx(props.translations, "save")} onClick={handleSave} />
				</span>
				</div>}
			</div>
		</React.Fragment>
	);
};