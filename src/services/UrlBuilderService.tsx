import _ from 'lodash';

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
    
    const profileUrl = (sectionName?: string | undefined, profileId?: string | undefined, useSlug?: boolean | undefined) =>
    { 
        const urlParts = ["profile"];

        if(profileId)
        {
            const userSlug = userSlugService.getSlug(profileId);
            
            userSlug ? urlParts.push(userSlug) : urlParts.push(profileId);
        }

        if(sectionName && !_.isEmpty(sectionName))
          urlParts.push(sectionName);

        return "/" + urlParts.join("/");
    }
    
    const settingsUrl = (categoryName?: string | undefined) =>
    { 
        const urlParts = ["settings"];

        if(categoryName && !_.isEmpty(categoryName?.trim()))
          urlParts.push(getSlug(categoryName));

        return "/" + urlParts.join("/");
    }
    
    return {
      getSlug,
      profileUrl,
      settingsUrl
    };
}