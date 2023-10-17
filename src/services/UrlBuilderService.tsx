import _ from 'lodash';

import { MediaType } from '../types/enums/mediaType';

import UserSlugService from './UserSlugService';

export default function UrlBuilderService() 
{
	const userSlugService = UserSlugService();

	const getSlug = (text: string) =>
	{		
		if(!text || _.isEmpty(text?.trim()))
		  return text;

		return text?.trim().replace(new RegExp(" ", "g"), "-").toLowerCase();
	}
	
	const settingsUrl = (categoryName?: string | undefined) =>
	{ 
		const urlParts = ["settings"];

		if(categoryName && !_.isEmpty(categoryName?.trim()))
		  urlParts.push(getSlug(categoryName));

		return "/" + urlParts.join("/");
	}
	
	const profileSections = ["posts" , "about" , "about_basic_info" , "about_contact_info" , "peers" , "peers-requests" , "photos" , "photos_albums" , "videos" , "videos_albums"];

	const profileUrl = (sectionName?: "default" | "posts" | "about" | "about_basic_info" | "about_contact_info" | "peers" | "peers-requests" | "photos" | "photos_albums" | "videos" | "videos_albums", profileId?: string | undefined, useSlug?: boolean | undefined) =>
	{ 
		const urlParts = ["profile"];

		if(profileId)
		{
			//const userSlug = userSlugService.getSlug(profileId);
			
			/* userSlug ? urlParts.push(userSlug) : */ urlParts.push(profileId);
		}

		if(sectionName && !_.isEmpty(sectionName) && sectionName !== "default")
			urlParts.push(sectionName);

		return "/" + urlParts.join("/");
	}
	
	const parseProfileUrl = (url: string) =>
	{ 
		if(url.startsWith("/"))
			url = url.substring(1, url.length);

		const urlParts = url.split("/");

		const page = {
			page: urlParts[0],
			profileId: profileSections.includes(urlParts[1]) ? undefined : urlParts[1],
			section: profileSections.includes(urlParts[1]) ? urlParts[1] : urlParts[2],
			sectionContentId: profileSections.includes(urlParts[1]) ? urlParts[2] : urlParts[3]
		};

		return page;
	}
	
	const mediaItemUrl = (mediaTypeId: MediaType, id?: string, setId?: string) =>
	{ 
		const urlParts = [];
		const urlQueryParts = [];

		if(mediaTypeId === MediaType.Image)
			urlParts.push("photo");

		if(mediaTypeId === MediaType.Video)
			urlParts.push("video");

		if(mediaTypeId === MediaType.Audio)
			urlParts.push("audio");

		if(id && !_.isEmpty(id?.trim()))
			urlParts.push(id);

			
		if(setId && !_.isEmpty(setId?.trim()))
			urlQueryParts.push("set=" + setId);

		return "/" + urlParts.join("/") + (urlQueryParts.length > 0 ? "?" + urlQueryParts.join("&") : "");
	}
	
	const pictureUrl = (id?: string, setId?: string) =>
	{ 
		return mediaItemUrl(MediaType.Image, id, setId);
	}
	
	const videoUrl = (id?: string, setId?: string) =>
	{ 
		return mediaItemUrl(MediaType.Video, id, setId);
	}
	
	const audioUrl = (id?: string, setId?: string) =>
	{ 
		return mediaItemUrl(MediaType.Audio, id, setId);
	}
	
	const albumUrl = (albumId: string, profileId: string) =>
	{ 
		const urlParts = ["profile", profileId, "albums"];

		if(albumId && !_.isEmpty(albumId?.trim()))
			urlParts.push(albumId);

		return "/" + urlParts.join("/");
	}
	
	return {
	  getSlug,
	  settingsUrl,
	  profileUrl,
	  parseProfileUrl,
	  mediaItemUrl,
	  pictureUrl,
	  videoUrl,
	  audioUrl,
	  albumUrl
	};
}