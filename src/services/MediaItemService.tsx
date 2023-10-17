import _ from 'lodash';

import { MediaType } from '../types/enums/mediaType';
import { UploadStatus } from '../types/enums/uploadStatus';
import { OrderByDirection } from '../types/enums/orderByDirection';

import { IApiResponse } from '../types/api/apiResponse';
import { IMediaItem } from '../types/interfaces/mediaItem';
import { IMediaUpload } from '../types/interfaces/mediaUpload';
import { IImage } from '../types/interfaces/image';
import { IVideo, IVideoSource } from '../types/interfaces/video';

import UuidUtility from "./UuidUtility";
import ApiService from "./ApiService";

export default function MediaItemService() 
{
	const supportedImageMimeTypes = {
		'image/png': ['.png'],
		'image/jpg': ['.jpg','.jpeg'],
		'image/gif': ['.gif']
	}

	const supportedVideoMimeTypes = {
		'video/mpeg': ['.mod', '.mpa', '.mpe', '.mpeg', '.mp2', '.mp2v', '.mp3', '.mpg', '.mpv2'],
		'video/mp4': ['.mp4', '.mp4v'],
		'video/quicktime': ['.mov', '.mqv'],
		'video/x-sgi-movie': ['.movie']
	};

	const supportedMimeTypes = _.assign(supportedImageMimeTypes, supportedVideoMimeTypes);

	async function uploadFile(data: FormData) 
	{
		const endpoint = "files/upload";

		return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
		{
			const results = (response && _.isObject(response.data)) ? response.data : null;

			return Promise.resolve(results);

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	};
	
	async function uploadImage(data: FormData) 
	{
		const endpoint = "images/upload";

		return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
		{
			const results = (response && _.isObject(response.data)) ? response.data : null;

			return Promise.resolve(results);

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	};
	
	async function uploadVideo(data: FormData) 
	{
		const endpoint = "videos/upload";

		return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
		{
			const results = (response && _.isObject(response.data)) ? response.data : null;

			return Promise.resolve(results);

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	};

	async function uploadAudio(data: FormData) 
	{
		const endpoint = "audio/upload";

		return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
		{
			const results = (response && _.isObject(response.data)) ? response.data : null;

			return Promise.resolve(results);

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	};

	async function uploadMedia(mediaType: MediaType, data: FormData) 
	{
		switch(mediaType)
		{
			case MediaType.Image: 
				return uploadImage(data);

			case MediaType.Video: 
				return uploadVideo(data);

			case MediaType.Audio: 
				return uploadAudio(data);
			
			case MediaType.File: 
				return uploadFile(data);
		}
	};
	
	async function getMediaItem(mediaItemId: string) 
	{
		if(_.isEmpty(mediaItemId))
			return Promise.reject(new Error("mediaItemId is invalid."));

		const endpoint = `media/${mediaItemId}`;

		return ApiService().get(endpoint).then((response: IApiResponse<IMediaItem> | undefined) =>
		{
			const data:IMediaItem | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("media item"));

			return Promise.resolve<IMediaItem>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	async function getMediaItems(page: number, pageSize: number, setId?: string) 
	{
		const endpoint = "media";

		const parameters = ApiService().buildParameters([
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		]);
		
		if(setId)
			parameters.push({ key: "setId", value: setId });

		return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IMediaItem[]> | undefined) =>
		{
			let data:IMediaItem[] | null = ApiService().getDataPayload(response);

			data = [];

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("media item"));

			return Promise.resolve(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	const getMediaAttachmentsByCorrelationId = (mediaUploads: IMediaUpload[], correlationId: string) => 
	{
		return mediaUploads.filter((item) => { return item.correlationId === correlationId; });
	}

	const isFileUploadRegistered = (mediaUploads: IMediaUpload[], correlationId: string) => 
	{
		return getMediaAttachmentsByCorrelationId(mediaUploads, correlationId).length > 0;
	}

	const getMediaTypeByFileType = (fileExtension: string) => {

		switch(fileExtension.toLowerCase())
		{
			case "jpg":
			case "jpeg":
			case "gif":
			case "png":
				return MediaType.Image;

			case "mp4":
			case "mpeg":
				return MediaType.Video;

			case "mp3":
			case "wav":
				return MediaType.Audio;
		
			default:
				return MediaType.File;
		}
	};

	const registerFileUploadStart = (
		setState: React.Dispatch<React.SetStateAction<IMediaUpload[]>>, 
		mediaUploads: IMediaUpload[], 
		correlationIds: string[], 
		files: File[], 
		status: UploadStatus, 
		onSet?: () => void
	) => 
	{
		if(correlationIds.length !== files.length)
			return false;

		const changeState = (state: IMediaUpload[]) => 
		{
			const updatedState: IMediaUpload[] = [...state];
	
			for(let i = 0; i < files.length; i++)
			{
				if(isFileUploadRegistered(mediaUploads, correlationIds[i]))
					continue;

				const fileExtension = files[i].name.split('.').pop() ?? "";

				const itemToAdd: IMediaUpload = {
					typeId: getMediaTypeByFileType(fileExtension),
					correlationId: correlationIds[i],
					status: status,
					fileData: files[i],
					address: undefined
				};
	
				updatedState.push(itemToAdd);
			}
			
			return updatedState;
		};

		setState(state => changeState(state));
	}

	const handleFileUploadChange = (setState: React.Dispatch<React.SetStateAction<IMediaUpload[]>>, correlationId: string, status: UploadStatus, referenceId?: string, url?: string, fileSizeBytes?: number, width?: number, height?: number) => 
	{
		const changeState = (state: IMediaUpload[]) => 
		{
			const updatedState: IMediaUpload[] = [...state];
	
			const itemIndex = state.findIndex((item) => { return item.correlationId === correlationId });
			
			if(itemIndex < 0) 
				return state;

			const itemToUpdate = state[itemIndex];

			if(!itemToUpdate) 
				return state;

			itemToUpdate.status = status;
			itemToUpdate.referenceId = referenceId;
			itemToUpdate.address = url;
			itemToUpdate.fileSizeBytes = fileSizeBytes;
			itemToUpdate.width = width;
			itemToUpdate.height = height;

			updatedState[itemIndex] = itemToUpdate;

			return updatedState;
		};

		setState(state => changeState(state));
	}

	const beginPendingImageUploads = (setState: React.Dispatch<React.SetStateAction<IMediaUpload[]>>, mediaUploads: IMediaUpload[]) => 
	{
		if(!hasUploadsPending(mediaUploads)) return;

		const pendingUploads = getPendingUploads(mediaUploads);

		console.debug("Uploading " + pendingUploads.length + " file(s).");

		pendingUploads.forEach((mediaAttachment) => 
		{
			handleFileUploadChange(setState, mediaAttachment.correlationId, UploadStatus.Uploading);
			
			const formData = new FormData();

			formData.append("files", mediaAttachment.fileData);
			
			uploadMedia(mediaAttachment.typeId, formData).then((mediaData: any) => 
			{
				if(mediaData.data.length < 1)
					return;

				handleFileUploadChange(setState, mediaAttachment.correlationId, UploadStatus.Uploaded, mediaData.data[0].id, mediaData.data[0].location, mediaData.data[0].size.fileSizeBytes, mediaData.data[0].size.width, mediaData.data[0].size.height);
	
			}).catch((error: Error) => 
			{
				handleFileUploadChange(setState, mediaAttachment.correlationId, UploadStatus.Error);
			});
		});
	}
	
	const getPendingUploads = (mediaUploads: IMediaUpload[]) => 
	{
		return mediaUploads.filter((item) => { return item.status === UploadStatus.Pending });
	}

	const hasUploadsPending = (mediaUploads: IMediaUpload[]) => 
	{
		return getPendingUploads(mediaUploads).length > 0;
	}

	const queueFilesForUpload = (
		setState: React.Dispatch<React.SetStateAction<IMediaUpload[]>>,
		mediaUploads: IMediaUpload[],
		acceptedFiles: File[]
	) => 
	{
		const correlationIds: string[] = [];

		for(let i = 0; i < acceptedFiles.length; i++)
		{
			correlationIds.push(UuidUtility().generateGuid());
		}

		registerFileUploadStart(setState, mediaUploads, correlationIds, acceptedFiles, UploadStatus.Pending);
	};

	const buildVideoSource = (url: string, video?: IVideo) =>
	{
		const source: IVideoSource = 
		{
			location: video?.location ?? url,
			type: "video/mp4",
			size: "123"
		};

		return source;
	}

	async function getImage(imageId: string) 
	{
		if(_.isEmpty(imageId))
			return Promise.reject(new Error("imageId is invalid."));

		const endpoint = `images/${imageId}`;

		return ApiService().get(endpoint, imageId).then((response: IApiResponse<IImage> | undefined) =>
		{
			const data: IImage | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("image"));

			return Promise.resolve<IImage>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	async function getPhotos(orderBy?: string, orderByDirection?: OrderByDirection, page: number = 1, pageSize: number = 20) 
	{
		const endpoint = "user/profile/photos";
		
		const parameters = ApiService().buildParameters([
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		]);
		
		if(orderBy && !_.isEmpty(orderBy))
			parameters.push({ key: "orderBy", value: orderBy });

		if(orderByDirection)
			parameters.push({ key: "orderByDirection", value: `${orderByDirection}` });

		return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IImage[]> | undefined) =>
		{
			const data:IImage[] | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("image"));

			return Promise.resolve(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function getVideos(orderBy?: string, orderByDirection?: OrderByDirection, page: number = 1, pageSize: number = 20) 
	{
		const endpoint = "videos";

		const parameters = ApiService().buildParameters([
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		]);
		
		if(orderBy && !_.isEmpty(orderBy))
			parameters.push({ key: "orderBy", value: orderBy });

		if(orderByDirection)
			parameters.push({ key: "orderByDirection", value: `${orderByDirection}` });

		return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IImage[]> | undefined) =>
		{
			const data:IImage[] | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("image"));

			return Promise.resolve(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	return {
		supportedImageMimeTypes,
		supportedVideoMimeTypes,
		supportedMimeTypes,

		uploadMedia,
		uploadFile,
		uploadImage,
		uploadVideo,
		uploadAudio,

		queueFilesForUpload,
		beginPendingImageUploads,
		hasUploadsPending,
		
		getMediaItem,
		getMediaItems,
		
		getImage,
		getPhotos,
		getVideos,

		buildVideoSource,
	};
}