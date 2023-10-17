import _ from 'lodash';

import { AttachmentType } from '../types/enums/attachmentType';
import { MediaType } from '../types/enums/mediaType';
import { UploadStatus } from '../types/enums/uploadStatus';

import { IApiResponse } from '../types/api/apiResponse';
import { IFeedItem } from '../types/interfaces/feedItem';
import { ILink } from '../types/interfaces/link';
import { IAlbumItem } from '../types/interfaces/albumItem';
import { IContentCollection } from '../types/interfaces/contentCollection';

import ApiService from "./ApiService";

export default function FeedService() 
{
    function feedItemHasAttachments(feedItem: IFeedItem)
    {
        return (feedItem && feedItem.attachments && feedItem.attachments.length > 0);
    }

    function getAttachmentsByType(feedItem: IFeedItem, attachmentType: AttachmentType)
    {
        if(!feedItemHasAttachments(feedItem))
            return null;

        let typeFilter = "";
        
        switch (attachmentType) 
        {
            case AttachmentType.Link:
                typeFilter = "Link";
                break;

            case AttachmentType.Image:
                typeFilter = "Image";
                break;

            case AttachmentType.Video:
                typeFilter = "Video";
                break;

            case AttachmentType.Audio:
                typeFilter = "Audio";
                break;
                
            case AttachmentType.Location:
                typeFilter = "Location";
                break;
         }

        return feedItem!.attachments!.filter(attachment => { return attachment.type === attachmentType; });
    }

    function getFirstAttachmentByType(feedItem: IFeedItem, type: AttachmentType)
    {
        const attachments = getAttachmentsByType(feedItem, type);

        if(!attachments || attachments.length < 1)
            return null;

        return attachments[0];
    }

    const getLinkAttachment = (feedItem?: IFeedItem) => 
    {
        if(!feedItem)
            return undefined;

        const attachment = getFirstAttachmentByType(feedItem, AttachmentType.Link);

        if(!attachment || !attachment.link)
            return undefined;
        
        const content: ILink = attachment.link;
        return content;
    };

    const getImageAttachment = (feedItem?: IFeedItem) => 
    {
        if(!feedItem)
            return undefined;

        const attachment = getFirstAttachmentByType(feedItem, AttachmentType.Image);

        if(!attachment || !attachment.image)
            return undefined;
        
        const image = attachment.image;
        
        const content: IAlbumItem = {
            id: image.id,
            mediaType: MediaType.Image,
            correlationId: image.id ?? "",
            uploadStatus: UploadStatus.Uploaded, 
            url: image.location
        };

        return content;
    };

    const getVideoAttachment = (feedItem?: IFeedItem) => 
    {
        if(!feedItem)
            return undefined;
        
        const attachment = getFirstAttachmentByType(feedItem, AttachmentType.Video);

        if(!attachment || !attachment.video)
            return undefined;
        
        const video = attachment.video;
        
        const content: IAlbumItem = {
            id: video.id,
            mediaType: MediaType.Video,
            correlationId: video.id ?? "",
            uploadStatus: UploadStatus.Uploaded, 
            url: video.location
        };

        return content;
    };

    const getAudioAttachment = (feedItem?: IFeedItem) => 
    {
        if(!feedItem)
            return undefined;

        const attachment = getFirstAttachmentByType(feedItem, AttachmentType.Audio);

        if(!attachment || !attachment.audio)
            return undefined;
        
        const audio = attachment.audio;
        
        const content: IAlbumItem = {
            id: audio.id,
            mediaType: MediaType.Audio,
            correlationId: audio.id ?? "",
            uploadStatus: UploadStatus.Uploaded, 
            url: audio.location
        };

        return content;
    };

    const getContentCollectionAttachment = (feedItem?: IFeedItem) => 
    {
        if(!feedItem)
            return undefined;

        const attachment = getFirstAttachmentByType(feedItem, AttachmentType.ContentCollection);

        if(!attachment || !attachment.contentCollection)
            return undefined;
        
        const content: IContentCollection = attachment.contentCollection;

        return content;
    };

    const getContentCollectionAttachmentMediaItems = (contentCollection: IContentCollection) => 
    {
        if(!contentCollection || !contentCollection.contentItems || contentCollection.contentItems.length < 1)
            return [];

        const albumItems: IAlbumItem[] = [];

        for(const contentItem of contentCollection.contentItems)
        {
            if(!contentItem)
                continue;

            const albumItem: IAlbumItem = 
            {
                id: contentItem.id,
                mediaType: contentItem.mediaType,
                correlationId: "",
                uploadStatus: UploadStatus.Uploaded,
                referenceId: contentItem.id
            };

            if(contentItem.mediaType === MediaType.Image && contentItem.image)
            {
                if(contentItem.image.location)
                    albumItem.url = contentItem.image.location;

                if(contentItem.image.fileSizeBytes)
                    albumItem.fileSizeBytes = contentItem.image.fileSizeBytes;

                if(contentItem.image.width)
                    albumItem.width = contentItem.image.width;

                if(contentItem.image.height)
                    albumItem.height = contentItem.image.height;
            }

            if(contentItem.mediaType === MediaType.Video && contentItem.video)
            {
                if(contentItem.video.location)
                    albumItem.url = contentItem.video.location;

                if(contentItem.video.fileSizeBytes)
                    albumItem.fileSizeBytes = contentItem.video.fileSizeBytes;

                if(contentItem.video.width)
                    albumItem.width = contentItem.video.width;

                if(contentItem.video.height)
                    albumItem.height = contentItem.video.height;
            }

            if(contentItem.mediaType === MediaType.Audio && contentItem.audio)
            {
                if(contentItem.audio.location)
                    albumItem.url = contentItem.audio.location;

                if(contentItem.audio.fileSizeBytes)
                    albumItem.fileSizeBytes = contentItem.audio.fileSizeBytes;
            }

            if(albumItem)
                albumItems.push(albumItem);
        }

        return albumItems;
    };

    return {
        getLinkAttachment,
        getImageAttachment,
        getVideoAttachment,
        getAudioAttachment,
        getContentCollectionAttachment,
        getContentCollectionAttachmentMediaItems
    };
}