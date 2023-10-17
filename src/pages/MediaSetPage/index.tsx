import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import _ from 'lodash';
import Sortable from 'sortablejs';
import { useDropzone } from 'react-dropzone';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';
import { UploadStatus } from '../../types/enums/uploadStatus';
import { SaveStatus } from '../../types/enums/saveStatus';
import { ContentCollectionType } from '../../types/enums/contentCollectionType';

import { IContentCollection, IContentCollectionItem } from '../../types/interfaces/contentCollection';
import { IMediaItem } from '../../types/interfaces/mediaItem';
import { IMediaUpload } from '../../types/interfaces/mediaUpload';

import { ToastPosition } from '../../types/enums/toastNotification';

import ToastService from '../../services/ToastService';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import MediaItemService from '../../services/MediaItemService';
import ContentCollectionService from '../../services/ContentCollectionService';
import UserService from '../../services/UserService';

import { Header } from './../../components/Header';
import { Heading } from '../../components/Heading';
import { Image } from '../../components/Image';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { TextBox } from '../../components/TextBox';
import { FormDropdownBox } from '../../components/FormDropdownBox';

import './MediaSetPage.scss';

export function MediaSetPage() 
{
	const namespaceClassName = "media-item";

	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Loading);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });
	const [currentUserProfile, setCurrentUserProfile] = React.useState<any>({ __loading: true });
		
	const [albumName, setAlbumName] = useState<string>("");
	const [sortBy, setSortBy] = useState<string>("");

    const [mediaItems, setMediaItems] = React.useState<IMediaUpload[]>([]);

	const [saveStatus, setSaveStatus] = React.useState<SaveStatus>(SaveStatus.Ready);
	 
	const toastService = ToastService();
	const settingsService = SettingsService();
	const trxService = TranslationService();
	const mediaItemService = MediaItemService();
	const contentCollectionService = ContentCollectionService();
	const userService = UserService();
	
	useEffect(() => 
	{
		mediaItemService.beginPendingImageUploads(setMediaItems, mediaItems);

	}, [mediaItems])

	const loadInitialData = async () => 
	{
		await userService.getProfile().then(async (response: any | undefined) => 
		{
			setCurrentUserProfile(response);
			
			await settingsService.getAll().then(async (response: any | undefined) => 
			{
				setCurrentUserSettings(response);

				await trxService.getTranslations(settingsService.findValue(response, "Language Code") ?? "EN").then((response: any | undefined) => 
				{
					setTranslations(response);
					
					setLoadStatus(ReadyStatus.Loaded);
				})
				.catch((error: Error | undefined) => {
					console.log(error);
				});
			})
			.catch((error: Error | undefined) => {
				console.log(error);
			});
		})
		.catch((error: Error | undefined) => {
			console.log(error);
		});
	};

	useEffect(() => {
	  loadInitialData();
	}, []);

	const isPageReady = () => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}
	
	const {getRootProps, getInputProps, open} = useDropzone(
	{
		onDrop: (files) => {
			console.debug("Queueing " + files.length + " file(s) for upload.");
			mediaItemService.queueFilesForUpload(setMediaItems, mediaItems, files);
		},
		accept: mediaItemService.supportedMimeTypes
	});

	const sortByOptions = [
		{ icon: "", value: "index", label: "Drag and Drop" }, 
		{ icon: "", value: "newest", label: "Date - Newest" }, 
		{ icon: "", value: "oldest", label: "Date - Oldest" }
	];

	const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => 
	{
		setSortBy(event.target.value);
	};

	const handleReorder = (id: string, displayOrder: number) => 
	{
		const changeState = (state: IMediaUpload[]) => 
		{
			const updatedState: IMediaUpload[] = [...state];
	
			const itemIndex = state.findIndex((item) => { return item.id === id });
			
			if(itemIndex < 0) 
				return state;

			const itemToUpdate = state[itemIndex];

			if(!itemToUpdate) 
				return state;

			itemToUpdate.displayOrder = displayOrder;

			updatedState[itemIndex] = itemToUpdate;

			return updatedState;
		};

		setMediaItems(state => changeState(state));
	}

	const sortableListRef = React.useRef<HTMLUListElement>(null);
	
	useEffect(() => 
	{
		if(!(sortableListRef.current as HTMLUListElement))
			return;
	
		setTimeout(() => 
		{
			Sortable.create(sortableListRef.current as HTMLElement, { 
				handle: ".drag-handle", 
				ghostClass: "sortable-ghost", 
				filter: ".no-drag",
				animation: 150,
				onEnd: function(evt: any) 
				{
					handleReorder(evt.item.dataset.key, evt.newIndex);
				}
			});
		}, 100);

	}, []);

	const isReadyToCreate = () => 
	{
		const hasUploadsInProgress = mediaItemService.hasUploadsPending(mediaItems);

		return !hasUploadsInProgress && saveStatus === SaveStatus.Ready;
	}

	const shouldDisableSaveButton = () => 
	{
		return !isReadyToCreate();
	}

	const navigate = useNavigate();

	const createAlbum = async () => 
	{
		setSaveStatus(SaveStatus.Saving);
		
		const contentItems: IContentCollectionItem[] = [];

		for(const mediaItem of mediaItems)
		{
			const contentItem: IContentCollectionItem = {
				mediaType: mediaItem.typeId
			};
			console.dir(mediaItem)
			
			switch(mediaItem.typeId)
			{
				case MediaType.Image : contentItem.imageId = mediaItem.referenceId; break;
				case MediaType.Video : contentItem.videoId = mediaItem.referenceId; break;
				case MediaType.Audio : contentItem.audioId = mediaItem.referenceId; break;
			}

			contentItems.push(contentItem);
		}

		await contentCollectionService.createContentCollection(contentItems, albumName, ContentCollectionType.Album).then((contentCollection: IContentCollection) => 
		{
			if(!contentCollection || !contentCollection.id)
				return Promise.reject();

			setSaveStatus(SaveStatus.Completed);
			toastService.success("Album Created", ToastPosition.BOTTOM_LEFT);
			navigate("/");
			
		}).catch((error: Error) => 
		{
			setSaveStatus(SaveStatus.Ready);
		});
	}

	const defaultSortBy = _.find(sortByOptions, (o) => { return o.value === "27" });

	const displayMode = !isPageReady() ? DisplayMode.Stencil : DisplayMode.Normal;
	
	return(
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} user={currentUserProfile} />

			<div className="container-fluid g-0 mediaset-page-content">

				<div className="row g-0">
					
					<div className="mediaset-options col-12 col-sm-2 col-md-2 col-lg-2 col-xl-2">
						<div className="mediaset-options-content">
							<Heading size={1} text={trxService.trx(translations, "create_album")} marginBottom={3} displayMode={displayMode} />

							<p>
								<TextBox placeholder={trxService.trx(translations, "album_name")} value={albumName} showValidation={false} onChange={value => setAlbumName(value)} aria-describedby="albumNameHelp" displayMode={displayMode} />
							</p><p className="mb-5" {...getRootProps()}>
								<Button hierarchy="secondary" iconName="multimedia" label={trxService.trx(translations, "upload_photos_and_videos")} size="large" cssClassNames="btn-secondary-light" displayMode={displayMode} />
								<input {...getInputProps()} />
							</p>

							<p>
								<FormDropdownBox translations={translations} value={sortBy ?? defaultSortBy?.value ?? ""} options={sortByOptions} placeholder={trxService.trx(translations, "sort_by")} onChange={handleSortByChange} aria-describedby="sortByHelp" cssClasses="form-control" />
							</p><p>
								<TextBox multiLine={true} placeholder={trxService.trx(translations, "caption")} showValidation={false} displayMode={displayMode} />
							</p><p>
								<TextBox multiLine={true} placeholder={trxService.trx(translations, "copyright")} showValidation={false} displayMode={displayMode} />
							</p>

							<p className="save-btn">
								{!isReadyToCreate() && saveStatus !== SaveStatus.Ready && <input type="button" className="btn btn-lg btn-primary" disabled value={trxService.trx(translations, "create_album")} /> }
								{isReadyToCreate() && saveStatus === SaveStatus.Ready && <input type="button" className="btn btn-lg btn-primary" onClick={createAlbum} value={trxService.trx(translations, "create_album")} disabled={shouldDisableSaveButton()} /> }
								{saveStatus === SaveStatus.Saving && <button disabled className="btn btn-lg btn-primary">
									<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
									<span className="visually-hidden">{trxService.trx(translations, "saving")}...</span>
								</button> }
							</p>
						</div>
					</div>

					<div className="mediaset-items-container col-12 col-sm-12 col-md-10 col-lg-10 col-xl-10 box-shadow-inset">
						<div className="mediaset-items-container-content">
							<ul ref={sortableListRef} className="media-item-grid">
							{
								(mediaItems ?? []).map((mediaItem: IMediaUpload, index: number) => (
									<li className={namespaceClassName + ""} key={mediaItem.id ?? "" + index} style={{width: 300 + "px" }}>
										<div style={{width: 300 + "px" }}>
											<div className={namespaceClassName + "-controls justify-content-end"}>
												<span className="options-menu-control btn btn-sm btn-circle" tabIndex={-1}>
													<Icon name="dots-horizontal" align="end" altText={trxService.trx(translations, "menu_options")} /> 
												</span>
											</div>
											<div className={namespaceClassName + "-image drag-handle"}>
												{ mediaItem.status === UploadStatus.Uploaded && <Image displayMode={displayMode} location={mediaItem.address ?? ""} fit="contain" height={260} backgroundColor="transparent" /> }
												{ (mediaItem.status === UploadStatus.Uploading || mediaItem.status === UploadStatus.Pending) && <Image displayMode={DisplayMode.Working} location={""} fit="contain" height={260} backgroundColor="transparent" /> }
											</div>
											<div className={namespaceClassName + "-details"}>
												<span className={namespaceClassName + "-details-caption"}>
													<TextBox multiLine={true} placeholder={trxService.trx(translations, "description_optional")} showValidation={false} preventDefault={true} displayMode={displayMode} />
												</span>
											</div>
										</div>
									</li>
								))
							}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
