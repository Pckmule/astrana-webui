import React, { useEffect, useRef } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { SaveStatus } from '../../types/enums/saveStatus';
import { AttachmentOption } from '../../types/enums/attachmentOption';
import { MediaType } from '../../types/enums/mediaType';

import { IPeerProfile } from '../../types/interfaces/peerProfile';
import { IPost, IPostToAdd } from '../../types/interfaces/post';
import { IPostAttachmentOption } from '../../types/interfaces/postAttachmentOption';
import { IContentCollection, IContentCollectionItem } from '../../types/interfaces/contentCollection';
import { IMediaUpload } from '../../types/interfaces/mediaUpload';
import { ILinkPreview } from '../../types/interfaces/linkPreview';
import { IFeeling } from '../../types/interfaces/feeling';
import { ILocation } from '../../types/interfaces/location';
import { IGif } from '../../types/interfaces/gif';
import { IAlbumItem } from '../../types/interfaces/albumItem';

import { Icon } from '../Icon';
import { AlbumCover } from '../AlbumCover';
import { ProfileImage } from '../ProfileImage';
import { PostLinkAttachment } from '../PostLinkAttachment';
import { EmojiPicker } from '../EmojiPicker';

import useAutosizeTextArea from '../AutosizeTextArea';
import { useDropzone } from 'react-dropzone';

import TranslationService from "./../../services/TranslationService";
import PeerService from '../../services/PeerService';
import PostService from '../../services/PostService';
import ContentCollectionService from '../../services/ContentCollectionService';
import MediaItemService from '../../services/MediaItemService';
import LinkService from '../../services/LinkService';

import "./PostEditor.scss";
import { ContentCollectionType } from '../../types/enums/contentCollectionType';

export interface IPostEditorState 
{
	audioElement?: any; 
	hardBorders: boolean;
}

export function PostEditor(props: { displayMode?: DisplayMode; translations: any; peerProfile?: IPeerProfile; hardBorders?: boolean; onPostCallback: (data: any) => void }) 
{
	const namespaceClassName = "post-editor";

	const [saveStatus, setSaveStatus] = React.useState<SaveStatus>(SaveStatus.Ready);
	const [showModal, setShowModal] = React.useState<boolean>(false);

	const [windowScrollTop, setWindowScrollTop] = React.useState<number>(0);

	const [emojiPickerTop, setEmojiPickerTop] = React.useState<number>(0);
	const [emojiPickerLeft, setEmojiPickerLeft] = React.useState<number>(0);
	const [emojiPickerVisible, setEmojiPickerVisible] = React.useState<boolean>(false);

	const [lastCompletedUploadTimestamp, setLastCompletedUploadTimestamp] = React.useState("");

	const [postText, setPostText] = React.useState<string>("");
	const [primaryAttachmentOptionId, setPrimaryAttachmentOptionId] = React.useState<AttachmentOption>(AttachmentOption.None);
	
	const [linkAttachement, setLinkAttachement] = React.useState<string>("");
	const [linkAttachementPreview, setLinkAttachementPreview] = React.useState<ILinkPreview>();

	const [mediaAttachments, setMediaAttachments] = React.useState<IMediaUpload[]>([]);

	const [feelingAttachments, setFeelingAttachments] = React.useState<IFeeling[]>([]);
	const [locationAttachment, setLocationAttachment] = React.useState<ILocation>();
	const [gifAttachment, setGifAttachment] = React.useState<IGif>();

	const trxService = TranslationService();
	const peerService = PeerService();
	const postService = PostService();
	const contentCollectionService = ContentCollectionService();
	const mediaItemService = MediaItemService();
	const linkService = LinkService();
	
	useEffect(() => 
	{
		mediaItemService.beginPendingImageUploads(setMediaAttachments, mediaAttachments);

	}, [mediaAttachments])
	  
	const attachmentOptions: IPostAttachmentOption[] = [
		{ typeId: AttachmentOption.LiveVideo, name: trxService.trx(props.translations, "posteditor_live_video"), iconName: "video-box", cssClassName: "attach-live-video", isAction: true, excludeFromTypeSelector: true },
		{ typeId: AttachmentOption.Media, name: trxService.trx(props.translations, "posteditor_photo_video"), iconName: "image", cssClassName: "attach-image", isAction: true },
		{ typeId: AttachmentOption.Feeling, name: trxService.trx(props.translations, "posteditor_feeling_activity"), iconName: "emoticon-outline", cssClassName: "attach-feeling", isAction: true },
		{ typeId: AttachmentOption.Location, name: trxService.trx(props.translations, "posteditor_location"), iconName: "map-marker" },
		{ typeId: AttachmentOption.Gif, name: trxService.trx(props.translations, "posteditor_gif"), iconName: "file-gif-box" }
	];

	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useAutosizeTextArea(textAreaRef.current, postText);

	const actions = attachmentOptions.filter((option: IPostAttachmentOption) => 
	{
		return option.isAction === true;
	});
	
	const attachmentOptionSelectorOptions = attachmentOptions.filter((option: IPostAttachmentOption) => 
	{
		return !option.excludeFromTypeSelector;
	});
	
	const getAttachmentOptionById = (attachmentOptionId: AttachmentOption) => 
	{
		return _.find(attachmentOptions, ["typeId", attachmentOptionId]);
	}

	const openModal = () => 
	{
		setShowModal(true);
	}

	const closeModal = () => 
	{
		setShowModal(false);
		setPrimaryAttachmentOptionId(AttachmentOption.None);
		removeAllMediaAttachments();
	}

	const calculatePrimaryAttachmentOption = () => 
	{
		if(linkAttachement && !_.isEmpty(linkAttachement))
			return AttachmentOption.Link;

		if(gifAttachment && !_.isEmpty(gifAttachment))
			return AttachmentOption.Gif;

		if(mediaAttachments && mediaAttachments.length > 0)
			return AttachmentOption.Media;
			
		return AttachmentOption.None;
	}

	const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => 
	{
		setPostText(event.target.value);

		const link = linkService.getUrlInText(0, event.target.value) ?? "";
		
		if(link && !_.isEmpty(link))
		{
			if(link !== linkAttachement)
			{
				setLinkAttachementPreview(undefined);
			
				linkService.getSummary(link).then((response: any | undefined) => 
				{
					setLinkAttachementPreview(response);
					
				}).catch((error: Error | undefined) => {
					setSaveStatus(SaveStatus.Ready);
				});
			}

			setPrimaryAttachmentOptionId(AttachmentOption.Link);
			setLinkAttachement(link);
		}
		else
		{
			if(!_.isEmpty(event.target.value))
			{
				setPrimaryAttachmentOptionId(calculatePrimaryAttachmentOption());
				setLinkAttachement("");
			}
		}
	};

	const insertText = (inputField: HTMLTextAreaElement, value: string) => 
	{
		if(!inputField)
			return;

		if (inputField.selectionStart || inputField.selectionStart === 0) 
		{
			const startPos = inputField.selectionStart;
			const endPos = inputField.selectionEnd;

			inputField.value = inputField.value.substring(0, startPos) + value + inputField.value.substring(endPos, inputField.value.length);
		} 
		else 
		{
			inputField.value += value;
		}

		setPostText(inputField.value);
	}

	const handleSelectEmoji = (character: string) => 
	{
		if(textAreaRef.current)
		{
			insertText(textAreaRef.current, character);
		}
	};

	const handleEmojiPickerBlur = () => 
	{
		setEmojiPickerVisible(false);
	};

	const buildCreatePostAttachmentsPayloadAsync = async () => 
	{
		const attachments: any[] = [];

		if(isAttachmentOptionActive(AttachmentOption.Link))
		{
			const linkAttachementPayload = postService.buildLinkAttachmentPayload(linkAttachement, linkAttachementPreview);

			if(linkAttachementPayload)
				attachments.push(linkAttachementPayload);
		}

		if(feelingAttachments && feelingAttachments.length > 0)
		{
			for(const feelingAttachment of feelingAttachments)
			{
				const feelingAttachementPayload = postService.buildFeelingAttachmentPayload(feelingAttachment.id);
	
				if(feelingAttachementPayload)
					attachments.push(feelingAttachementPayload);
			}
		}

		if(locationAttachment)
		{
			const locationAttachementPayload = postService.buildLocationAttachmentPayload(locationAttachment.id);

			if(locationAttachementPayload)
				attachments.push(locationAttachementPayload);
		}

		if(isAttachmentOptionActive(AttachmentOption.Gif) && gifAttachment)
		{
			const gifAttachementPayload = postService.buildGifAttachmentPayload(gifAttachment.id);

			if(gifAttachementPayload)
				attachments.push(gifAttachementPayload);
		}

		if(isAttachmentOptionActive(AttachmentOption.Media) && mediaAttachments.length > 0)
		{
			if(mediaAttachments.length > 1)
			{
				const mediaItems: IContentCollectionItem[] = [];

				mediaAttachments.forEach(mediaAttachment => 
				{					
					if(mediaAttachment.typeId === MediaType.Image)
						mediaItems.push({
							mediaType: MediaType.Image,
							imageId: mediaAttachment.referenceId
						});
					
					if(mediaAttachment.typeId === MediaType.Video)
						mediaItems.push({ 
							mediaType: MediaType.Video,
							videoId: mediaAttachment.referenceId
						});

					if(mediaAttachment.typeId === MediaType.Audio)
						mediaItems.push({ 
							mediaType: MediaType.Audio,
							audioId: mediaAttachment.referenceId
						});
				});

				return await contentCollectionService.createContentCollection(mediaItems, undefined, ContentCollectionType.Generic).then((contentCollection: IContentCollection) => 
				{
					if(!contentCollection || !contentCollection.id)
						return Promise.reject();

					const mediaCollectionAttachmentPayload = postService.buildMediaCollectionAttachmentPayload(mediaAttachments, contentCollection.id);
	
					if(mediaCollectionAttachmentPayload)
						attachments.push(mediaCollectionAttachmentPayload);
					
					if(!attachments)
						return Promise.reject();
			
					return Promise.resolve(attachments);
					
				}).catch((error: Error) => 
				{
					return Promise.reject(error);
				});
			}
			else
			{
				const mediaItem = mediaAttachments[0];

				if(mediaItem && mediaItem.referenceId)
				{
					let mediaAttachmentPayload = undefined;

					if(mediaItem.typeId === MediaType.Image)
					{
						mediaAttachmentPayload = postService.buildImageAttachmentPayload(mediaItem.referenceId);
					}
					else if(mediaItem.typeId === MediaType.Video)
					{
						mediaAttachmentPayload = postService.buildVideoAttachmentPayload(mediaItem.referenceId);
					}
					else if(mediaItem.typeId === MediaType.Audio)
					{
						mediaAttachmentPayload = postService.buildAudioAttachmentPayload(mediaItem.referenceId);
					}

					if(mediaAttachmentPayload)
						attachments.push(mediaAttachmentPayload);
				}
			}
		}
		
		if(!attachments)
			return Promise.reject();

		return Promise.resolve(attachments);
	}

	const createPost = async () => 
	{
		setSaveStatus(SaveStatus.Saving);

		await buildCreatePostAttachmentsPayloadAsync().then((attachments: any) => 
		{
			const postToAdd : IPostToAdd = {
				text: postText,
				attachments: attachments
			};

			postService.createPost(postToAdd).then((response: IPost[]) => 
			{
				props.onPostCallback(response);

				closeModal();
				setPostText("");
				setSaveStatus(SaveStatus.Ready);
				
			}).catch((error: Error) => {
				setSaveStatus(SaveStatus.Ready);
			});
			
		}).catch((error: Error) => {
			setSaveStatus(SaveStatus.Ready);
		});
	}

	const isReadyToCreate = () => 
	{
		return saveStatus === SaveStatus.Ready;
	}

	const selectAction = (attachmentOptionId: AttachmentOption) =>
	{
		selectAttachmentOption(attachmentOptionId);

		openModal();
	}

	const selectAttachmentOption = (attachmentOptionId: AttachmentOption) =>
	{
		if(primaryAttachmentOptionId === attachmentOptionId)
			setPrimaryAttachmentOptionId(AttachmentOption.None);
		else
			setPrimaryAttachmentOptionId(attachmentOptionId);
	}

	const emojiControlRef = React.useRef<HTMLElement>(null);
	const showInsertEmojiMenu = (event: React.MouseEvent<HTMLElement>) =>
	{
		if(emojiControlRef.current)
		{
			const bounds = emojiControlRef.current.getBoundingClientRect();
			
			setEmojiPickerTop(() => bounds.y + bounds.height + windowScrollTop);
			setEmojiPickerLeft(() => bounds.x); 
			setEmojiPickerVisible(true);
		}
	}

	const getAttachmentOptionClassName = (attachmentOptionId: AttachmentOption) =>
	{
		switch(attachmentOptionId)
		{
			case AttachmentOption.LiveVideo: return "livevideo";
			case AttachmentOption.Media: return "images";
			case AttachmentOption.Location: return "location";
			case AttachmentOption.Feeling: return "feeling";
			case AttachmentOption.Gif: return "gif";

			default:
				return "";
		}
	}

	const isAttachmentOptionActive = (attachmentOptionId: AttachmentOption) =>
	{
		return (attachmentOptionId === primaryAttachmentOptionId);
	}

	const {getRootProps, getInputProps, open} = useDropzone(
	{
		onDrop: (files) => {
			console.debug("Queueing " + files.length + " file(s) for upload.");
			mediaItemService.queueFilesForUpload(setMediaAttachments, mediaAttachments, files);
		},
		accept: mediaItemService.supportedMimeTypes
	});

	const removeAllLinkAttachments = () => 
	{
		setPrimaryAttachmentOptionId(AttachmentOption.None);
		setLinkAttachement("");
		setLinkAttachementPreview(undefined);
	}

	const removeAllMediaAttachments = () => 
	{
		setMediaAttachments([]);
	}

	const handleRemoveMediaButtonClick = () => 
	{
		removeAllMediaAttachments();
		
		if(mediaAttachments.length < 1)
			selectAttachmentOption(AttachmentOption.None);
	}

	const convertMediaUploadItemsToAlbumItems = (mediaUploadItems: IMediaUpload[]) => 
	{
		const albumItems: IAlbumItem[] = [];

		for(const mediaUploadItem of mediaUploadItems)
		{
			albumItems.push({
				mediaType: mediaUploadItem.typeId,
				correlationId: mediaUploadItem.correlationId,
				uploadStatus: mediaUploadItem.status,
				referenceId: mediaUploadItem.referenceId,
				url: mediaUploadItem.address,
				fileData: mediaUploadItem.fileData,
				fileSizeBytes: mediaUploadItem.fileSizeBytes,
				width: mediaUploadItem.width,
				height: mediaUploadItem.height
			});
		}

		return albumItems;
	};

	const profileFullName = peerService.buildPeerFullName(props.peerProfile);
	const profilePictureUrl = props.peerProfile ? _.first(props.peerProfile.profilePicturesCollection?.contentItems)?.image?.location ?? "" : ""; //peerService.getPeerProfilePictureUrlOrDefaultUrl(props.peerProfile);
	const textboxPlaceholderText = trxService.trx(props.translations, "whats_on_your_mind").replace("{{first_name}}", props.peerProfile?.firstName);
	
	const roundingClasses = props.hardBorders ? "rounded-0" : "rounded";
	const cssClasses: string[] = [namespaceClassName, roundingClasses, "mb-3"];
	
	if(props.displayMode !== DisplayMode.Stencil && !props.peerProfile)
		return null;
  
	if(props.displayMode === DisplayMode.Stencil)
	{
		cssClasses.push("stencil");

		return (			
			<div className={cssClasses.join(" ")}>   
				<div className={"card " + roundingClasses + ""}>		 
					<div aria-label="Create a post" className="" role="region">
						<div className="editor-box m-2">
							<span className="user-profile-picture">
								<div>
									<ProfileImage peerName={profileFullName} imageAddress={profilePictureUrl} profileUrl={"/profile"} height={40} translations={props.translations} aria-label={profileFullName + "'s timeline"} />
								</div>
							</span>
							<div className="textbox" role="button" tabIndex={0}>
								<div className="textbox-message p-2">
									<span>&nbsp;</span>
								</div>							
							</div>
						</div>
						<div className={namespaceClassName + "-actions"}>
							{actions.map((option) => {
								return (
									<span className={"action " + option.cssClassName} tabIndex={0} onClick={() => selectAction(option.typeId)} key={option.name}>
										<span>
											<Icon displayMode={props.displayMode} name={option.iconName} align="start" marginEnd={2} altText={option.name} /> 
											{props.displayMode === DisplayMode.Stencil ? "" : option.name }
											{(props.displayMode === DisplayMode.Stencil) && 
												<span className="text-placeholder" style={{width:150}}>&nbsp;</span>
											}
										</span>
									</span>
								)
							})}
						</div>
					</div>
				</div>
			</div>			
		);
	}

	return (		
	  <React.Fragment>
		<div className={cssClasses.join(" ")}>   
			<div className={"card " + roundingClasses + ""}>		 
				<div aria-label="Create a post" className="" role="region">
					<div className="editor-box m-2">
						<span className="user-profile-picture">
							<div>
								<ProfileImage peerName={profileFullName} imageAddress={profilePictureUrl} profileUrl={"/profile"} height={40} translations={props.translations} aria-label={profileFullName + "'s timeline"} />
							</div>
						</span>
						<div className="textbox" role="button" tabIndex={0}>
							<div className="textbox-message p-2" onClick={openModal}>
								<span>{textboxPlaceholderText}</span>
							</div>							
						</div>
					</div>
					<div className={namespaceClassName + "-actions"}>
						{actions.map((option, index) => {
							return (
								<span className={"action " + option.cssClassName} tabIndex={0} onClick={() => selectAction(option.typeId)} key={option.name}>
									<span>
										<Icon name={option.iconName}  align="start" marginEnd={2} altText={option.name} /> 
										{option.name}
									</span>
								</span>
							)
						})}
					</div>
				</div>
			</div>
		</div>
						 
		<EmojiPicker positionTop={emojiPickerTop} positionLeft={emojiPickerLeft} width={380} visible={emojiPickerVisible} displayMode={props.displayMode} translations={props.translations} onSelect={handleSelectEmoji} onBlur={handleEmojiPickerBlur} />

		{showModal && 
		<div className={namespaceClassName + "-modal modal"} tabIndex={-1} style={{display: "block"}}>
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{trxService.trx(props.translations, "create_post")}</h5>
						<button type="button" className="btn-close" aria-label={trxService.trx(props.translations, "close")} onClick={closeModal}></button>
					</div>
					<div className="modal-body">						
						<div className="waw-box mb-3">
							<span className="user-profile-picture">
								<div>
									<ProfileImage peerName={profileFullName} imageAddress={profilePictureUrl} profileUrl={"/profile"} height={40} translations={props.translations} aria-label={profileFullName + "'s timeline"} />
								</div>
							</span>
							<div className="post-targets">
								<div className="mb-1">
									<span className="user-fullname">{profileFullName}</span>
								</div>
								<div>
									<span className="audience-selector badge bg-light text-dark float-start">
										<Icon name="account-multiple" marginEnd={2} align="start" altText={trxService.trx(props.translations, "audience")} />
										<span className="label float-start">{trxService.trx(props.translations, "audience")}</span>
									</span>
								</div>
							</div>
						</div>
						
						<div className="modal-scroll scroll-y thin-scroll">
							<div className="post-text-box">
								<div className="textbox">
									<div className="mb-3">
										<label htmlFor="message-text" className="col-form-label d-none">{trxService.trx(props.translations, "post_content")}</label>
										<textarea ref={textAreaRef} className="form-control" id="message-text" onChange={handleTextChange} placeholder={textboxPlaceholderText} rows={1}></textarea>
									</div>
								</div>

								<div className="emoji">								
									<span ref={emojiControlRef} className="insert-emoji clickable float-end" onClick={showInsertEmojiMenu}>
										<Icon name="emoticon-happy-outline" align="start" altText={trxService.trx(props.translations, "insert_emoji")} />
									</span>
								</div>
							</div>

							{primaryAttachmentOptionId !== undefined && primaryAttachmentOptionId !== null && !isAttachmentOptionActive(AttachmentOption.None) && 
							<div className="post-attachment-options rounded d-flex mb-3">
								
								{isAttachmentOptionActive(AttachmentOption.Link) &&
									<div className="post-attachment-link-options">
										<span className="post-attachment-link-controls float-end">
											<span className="btn btn-sm btn-circle btn-white" tabIndex={0} onClick={removeAllLinkAttachments}>
												<Icon name="close" align="start" altText={trxService.trx(props.translations, "remove")} /> 
											</span>
										</span>
										<PostLinkAttachment disableLink={true} displayMode={linkAttachementPreview ? DisplayMode.Normal : DisplayMode.Working} title={linkAttachementPreview?.title ?? ""} url={linkAttachementPreview?.url ?? ""} description={linkAttachementPreview?.description} imageUrl={linkAttachementPreview?.previewImageUrls && linkAttachementPreview.previewImageUrls?.length > 0 ? linkAttachementPreview.previewImageUrls[0] : undefined} />
									</div> 
								}

								{primaryAttachmentOptionId === AttachmentOption.Media && 
									<div className="post-attachment-images-options">
										{mediaAttachments.length === 0 && 
										<React.Fragment>
											<span className="post-attachment-media-controls float-end">
												<span className="btn btn-sm btn-circle btn-light" tabIndex={0} onClick={handleRemoveMediaButtonClick}>
													<Icon name="close" align="start" altText={trxService.trx(props.translations, "remove")} /> 
												</span>
											</span>

											<section className="file-drop-zone unselectable rounded">
												<div {...getRootProps()}>
													<input {...getInputProps()} />
													<div className="file-drop-zone-message">
														<p><Icon name={getAttachmentOptionById(primaryAttachmentOptionId)?.iconName ?? ""} altText={getAttachmentOptionById(primaryAttachmentOptionId)?.iconName ?? ""} /></p>
														<p>{trxService.trx(props.translations, "add_photos_slash_videos")}</p>
														<p className="small text-muted"><small>{trxService.trx(props.translations, "or_drag_and_drop")}</small></p>
													</div>
												</div>
											</section>
										</React.Fragment>}
										
										{mediaAttachments.length > 0 && 
											<div className="post-attachment-images-selected-images">
												<span className="post-attachment-media-controls float-start">
													<span className="btn btn-sm btn-light" tabIndex={0} onClick={() => false}>
														<Icon name="pencil" align="start" marginEnd={2} altText={trxService.trx(props.translations, "edit_all")} /> 
														{trxService.trx(props.translations, "edit_all")}
													</span>
													<span {...getRootProps()}>
														<input {...getInputProps()} />
														<span className="btn btn-sm btn-light" tabIndex={0} onClick={open}>
															<Icon name="plus-box-multiple" align="start" marginEnd={2} altText={trxService.trx(props.translations, "add_photos_slash_videos")} /> 
															{trxService.trx(props.translations, "add_photos_slash_videos")}
														</span>
													</span>
												</span>
												<span className="post-attachment-media-controls float-end">
													<span className="btn btn-sm btn-circle btn-light" tabIndex={0} onClick={handleRemoveMediaButtonClick}>
														<Icon name="close" align="start" altText={trxService.trx(props.translations, "remove")} /> 
													</span>
												</span>
												<div className="post-attachment-media-items">
													<AlbumCover mediaItems={convertMediaUploadItemsToAlbumItems(mediaAttachments)} maxWidth={100} maxWidthUnit={"%"} maxHeight={450} />
												</div>
											</div>  
										}
									</div>
								}
								
								{isAttachmentOptionActive(AttachmentOption.Feeling) &&
									<div className="post-attachment-feeling-options">
										{trxService.trx(props.translations, "feeling")}
									</div> 
								}

								{isAttachmentOptionActive(AttachmentOption.Gif) &&
									<div className="post-attachment-feeling-options">
										{trxService.trx(props.translations, "gif")}
									</div> 
								}

								{isAttachmentOptionActive(AttachmentOption.Location) &&
									<div className="post-attachment-feeling-options">
										{trxService.trx(props.translations, "location")}
									</div> 
								}

							</div>}

							<div className="post-attachment-selector rounded d-flex justify-content-between justify-content-start unselectable">
								<span className="label justify-content-start">{trxService.trx(props.translations, "add_to_post")}</span>
								<span className="attachment-types justify-content-end">
									{attachmentOptionSelectorOptions.map((option) => {
										return (
											<span className={"attachment-type attachment-type-" + getAttachmentOptionClassName(option.typeId) + (isAttachmentOptionActive(option.typeId) ? " active" : "") + " rounded clickable"} onClick={() => selectAttachmentOption(option.typeId)} key={option.name}>
												<Icon name={option.iconName} align="start" altText={option.name} />
											</span>
										)
									})}

									<span className="attachment-type more-attachment-types rounded clickable">
										<Icon name="dots-horizontal" align="start" />
									</span>
								</span>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						{!isReadyToCreate() && saveStatus !== SaveStatus.Ready && <input type="button" className="btn btn-primary float-end" disabled value={trxService.trx(props.translations, "post")} /> }
						{isReadyToCreate() && <input type="button" className="btn btn-primary float-end" onClick={createPost} value={trxService.trx(props.translations, "post")} /> }
						{saveStatus === SaveStatus.Saving && <button disabled className="btn btn-primary float-end">
							<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							<span className="visually-hidden">{trxService.trx(props.translations, "posting")}...</span>
						</button> }
					</div>
				</div>
			</div>
		</div>}
		
	  </React.Fragment>
	);
};