import _ from 'lodash';

export default function UrlBuilderService() 
{
    const profileUrl = (sectionName?: string | undefined, profileId?: string | undefined) =>
    { 
        let url = "/profile"

        if(profileId)
          url += "/" + profileId;

        if(!_.isEmpty(sectionName))
          url += "/" + sectionName;

        return url;
    }
    
    return {
      profileUrl
    };
}