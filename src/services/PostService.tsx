import _ from 'lodash';

import { AttachmentType } from '../types/enums/attachmentType';

import { IApiResponse } from '../types/api/apiResponse';
import { IPost, IPostToAdd } from '../types/interfaces/post';
import { IMediaUpload } from '../types/interfaces/mediaUpload';
import { ILinkPreview } from '../types/interfaces/linkPreview';
import { ILinkToAdd } from '../types/interfaces/link';

import UuidUtility from './UuidUtility';
import ApiService from "./ApiService";

export default function PostService() 
{
	async function getPost(postId: string) 
	{
		if(_.isEmpty(postId))
			return Promise.reject(new Error("postId is invalid."));

		const endpoint = `posts/${postId}`;

		return ApiService().get(endpoint, postId).then((response: IApiResponse<IPost> | undefined) =>
		{
			const data:IPost | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("post"));

			return Promise.resolve<IPost>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	async function getPosts(peerProfileId?: string, page: number = 1, pageSize: number = 20) 
	{
		const endpoint = "posts";

		const parameters = ApiService().buildParameters([
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		]);

		if(peerProfileId && UuidUtility().isValidGuid(peerProfileId))
			parameters.push({ key: "peerProfileId", value: peerProfileId });

		return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IPost[]> | undefined) =>
		{
			const data:IPost[] | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("post"));

			return Promise.resolve(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function createPost(postToAdd: IPostToAdd) 
	{
		const endpoint = "posts";

		const payload = [postToAdd];

		return ApiService().put(endpoint, payload).then((response: IApiResponse<IPost[]>) =>
		{
			const data:IPost[] | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("post"));

			return Promise.resolve(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	const buildAttachmentBasePayload = (type: AttachmentType, address?: string, title?: string) => 
	{
		const payload: any = {
			type: type
		};

		if(address && !_.isEmpty(address))
			payload.address = address;
		
		if(title && !_.isEmpty(title))
			payload.title = title;

		return payload;
	}

	const buildLinkAttachmentPayload = (linkAttachement: string, linkAttachementPreview?: ILinkPreview) => 
	{
		if(!linkAttachement || _.isEmpty(linkAttachement) || !linkAttachementPreview)
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Link, linkAttachement, linkAttachementPreview?.title);

		const linkToAdd: ILinkToAdd = 
		{
			url: linkAttachementPreview.url,
			title: linkAttachementPreview.title,
			description: linkAttachementPreview.description
		};
		
		if(linkAttachementPreview.previewImageUrls && linkAttachementPreview.previewImageUrls.length > 0)
			linkToAdd.previewImage = {
				location: linkAttachementPreview.previewImageUrls[0]
			};

		// payload.linkId = contentId;
		payload.link = linkToAdd;

		return payload;		
	}

	const buildImageAttachmentPayload = (imageId: string) => 
	{
		if(!imageId || _.isEmpty(imageId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Image);

		payload.imageId = imageId;

		return payload;		
	}

	const buildVideoAttachmentPayload = (videoId: string) => 
	{
		if(!videoId || _.isEmpty(videoId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Video);

		payload.videoId = videoId;

		return payload;		
	}

	const buildAudioAttachmentPayload = (audioId: string) => 
	{
		if(!audioId || _.isEmpty(audioId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Audio);

		payload.audioId = audioId;

		return payload;		
	}

	const buildFeelingAttachmentPayload = (feelingId: string) => 
	{
		if(!feelingId || _.isEmpty(feelingId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Feeling);

		payload.feelingId = feelingId;

		return payload;		
	}

	const buildLocationAttachmentPayload = (locationId: string) => 
	{
		if(!locationId || _.isEmpty(locationId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Location);

		payload.locationId = locationId;

		return payload;		
	}

	const buildGifAttachmentPayload = (gifId: string) => 
	{
		if(!gifId || _.isEmpty(gifId))
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.Gif);

		payload.gifId = gifId;

		return payload;		
	}

	const buildMediaCollectionAttachmentPayload = (mediaAttachments: IMediaUpload[], contentCollectionId: string) => 
	{
		if(!contentCollectionId || _.isEmpty(contentCollectionId))
			return undefined;
		
		if(!mediaAttachments || mediaAttachments.length < 2)
			return undefined;
		
		const payload = buildAttachmentBasePayload(AttachmentType.ContentCollection);

		payload.contentCollectionId = contentCollectionId;

		return payload;
	}

	return {
		getPost,
		getPosts,
		createPost,

		buildAttachmentBasePayload,
		buildLinkAttachmentPayload,
		buildImageAttachmentPayload,
		buildVideoAttachmentPayload,
		buildAudioAttachmentPayload,
		buildFeelingAttachmentPayload,
		buildLocationAttachmentPayload,
		buildGifAttachmentPayload,
		buildMediaCollectionAttachmentPayload
	};
}