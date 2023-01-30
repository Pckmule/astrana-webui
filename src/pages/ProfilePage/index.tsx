import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { IApplicationSettings } from './../../types/objects/applicationSettings';
import { IUserInfo } from './../../types/interfaces/user';

import UrlBuilderService from "./../../services/UrlBuilderService";
import TranslationService from "./../../services/TranslationService";
import UserService from '../../services/UserService';

import { Header } from './../../components/Header';

import { ProfileHeader } from '../../components/ProfileHeader/ProfileHeader';
import { ProfileSummary } from '../../components/ProfileSummary';
import { ProfilePhotos } from '../../components/ProfilePhotos/ProfilePhotos';
import { ProfilePeers } from '../../components/ProfilePeers/ProfilePeers';

import { PostEditor } from './../../components/PostEditor';
import { ProfilePosts } from '../../components/ProfilePosts/ProfilePosts';

import { ProfileAbout } from '../../components/ProfileAbout';
import { PeersList } from '../../components/PeersList';
import { PhotosList } from '../../components/PhotosList';
import { VideosList } from '../../components/VideosList';

import './profilepage.scss';

interface ProfilePageProps {
  settings: IApplicationSettings;
  user: IUserInfo;
}

export function ProfilePage({ settings, user }: ProfilePageProps) 
{
    const [translations, setTranslations] = React.useState<any>({ __loading: true });
    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ languageCode: "zh" });    
    const [currentUserInformation, setCurrentUserInformation] = React.useState<any>({});
    
    const trxService = TranslationService();
    const userService = UserService();
    
    const loadInitialData = async () => 
    {
        setCurrentUserInformation(await userService.getProfile());
        
        setCurrentUserSettings({
            languageCode: "zh"
        });
        
        setTranslations(await trxService.getTranslations(currentUserSettings.languageCode));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const path = useLocation().pathname.split("/");

    let currentPage = "posts";
    if(path.length == 3 || path.length == 4)
    {
      currentPage = path[path.length-1];
    }

    const isPageReady = translations.__loading ? "loading" : "ready";    
    const displayMode = !isPageReady ? "skeleton" : "normal";

    return(
        <React.Fragment>
          <Header displayMode={displayMode} user={user} />
      
          <div className="container-fluid page-content">
            <div className="row g-0">

              <div className="main-content col-12 col-sm-12 col-md-12 col-lg-10 col-xl-8 offset-lg-1 offset-xl-2">
                  
                <div className="row">
                  <div className="col-12">
                    <ProfileHeader profileId={currentUserInformation.id} displayMode={displayMode} coverPictureUrl={currentUserInformation.profileCoverPicture} currentPageName={currentPage} translations={translations} />
                  </div>
                </div>
                  
                { currentPage === "posts" &&
                  <div className="row">
                      <div className="col-4 col-sm-4 col-md-4 col-lg-5 col-xl-5 d-none d-md-block">
                        <ProfileSummary profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} />
                        <ProfilePhotos profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} />
                        <ProfilePeers profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} />
                      </div>
                      
                      <div className="col-8 col-sm-8 col-md-8 col-lg-7 col-xl-7 d-none d-md-block">
                        <main>
                          <PostEditor userInfo={currentUserInformation} displayMode={displayMode} translations={translations} />
                          <ProfilePosts userInfo={currentUserInformation} displayMode={displayMode} translations={translations} />
                        </main>
                      </div>
                  </div>
                }
                  
                { currentPage !== "posts" &&
                  <div className="row">                      
                      <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 d-none d-md-block">
                        <main>
                          { currentPage === "about" && <ProfileAbout profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} pageSize={100} /> }
                          { currentPage === "peers" && <PeersList profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} pageSize={100} /> }
                          { currentPage === "photos" && <PhotosList profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} pageSize={100} /> }
                          { currentPage === "videos" && <VideosList profileId={currentUserInformation.id} displayMode={displayMode} translations={translations} pageSize={100} /> }
                        </main>
                      </div>
                  </div>
                }

              </div>

            </div>
          </div>
        </React.Fragment>
    );
}