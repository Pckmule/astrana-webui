import React, { useEffect } from "react";
import _ from "lodash";

import TranslationService from "./../../services/TranslationService";
import UserService from "./../../services/UserService";

import { IApplicationSettings } from "./../../types/objects/applicationSettings";
import { IApplicationCache } from "../../types/objects/applicationCache";

import { IUserInfo } from "./../../types/interfaces/user";

import { Header } from "./../../components/Header";
import { LeftDrawerNavigationMenu } from "./../../components/LeftDrawerNavigationMenu";
import { PostEditor } from "./../../components/PostEditor";
import { Feed } from "./../../components/Feed";
import { ProfileCard } from "./../../components/ProfileCard";
import { ConnectPeerForm } from "./../../components/ConnectPeerForm";

import "./homepage.scss";

interface HomePageProps {
  cache: IApplicationCache;
  settings: IApplicationSettings;
  user: IUserInfo;
}

export function HomePage({ cache, settings, user }: HomePageProps) 
{  
    const [translations, setTranslations] = React.useState<any>({ __loading: true });
    const [loadStatus, setLoadStatus] = React.useState<string>("loading");

    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({
        languageCode: "zh"
    });
    
    const [currentUserInformation, setCurrentUserInformation] = React.useState<any>({ 
      fullName: "", 
      introduction: "",
      profilePictureUrl: "",
      profileCoverPicture: ""
    });

    const trxService = TranslationService();
    const userService = UserService();
    
    const loadInitialData = async () => 
    {
        setCurrentUserInformation(await userService.getProfile());
        
        setCurrentUserSettings({
            languageCode: "zh"
        });
        
        setTranslations(await trxService.getTranslations(currentUserSettings.languageCode));

        setLoadStatus("loaded");
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const menuItems = [
      { text: trxService.trx(translations, "nav_menuitem_community_feed"), href: "", iconName: "mdi-card-text-outline" },
      { text: trxService.trx(translations, "nav_menuitem_pin_boards"), href: "pinboards", iconName: "mdi-view-dashboard" },
      { text: trxService.trx(translations, "nav_menuitem_news_reader"), href: "newsfeed", iconName: "mdi-newspaper-variant-outline" }, 
      { text: trxService.trx(translations, "nav_menuitem_profile"), href: "profile", iconName: "mdi-account-circle" }
    ];

    const isPageReady = loadStatus !== "loaded" ? "loading" : "ready";
    const displayMode = !isPageReady ? "skeleton" : "normal";

    return(
        isPageReady === "ready" ? 
        <React.Fragment>
         <Header displayMode={displayMode} user={currentUserInformation} />
        
          <div className="container-fluid page-content">
            <div className="row g-0">
              <div className="drawer-l col-1 col-sm-2 col-md-2 col-lg-3 col-xl-2 d-none d-md-block">        
                <LeftDrawerNavigationMenu displayMode={displayMode} menuItems={menuItems} />
              </div>

              <div className="main-content col-12 col-sm-12 col-md-7 col-lg-6 col-xl-8">
                <main>
                  <PostEditor displayMode={displayMode} userInfo={currentUserInformation} translations={translations} />
                  <Feed displayMode={displayMode} translations={translations} />
                </main>
              </div>

              <div className="drawer-r col-1 col-sm-1 col-md-3 col-lg-3 col-xl-2 d-none d-md-block">
                <ProfileCard displayMode={displayMode} fullName={currentUserInformation.fullName} url="/profile" description={currentUserInformation?.introduction} profilePicture={currentUserInformation.profilePictureUrl} coverPicture={currentUserInformation.profileCoverPicture} /> 
                <ConnectPeerForm displayMode={displayMode} peerInformation={settings.peerInformation} buttonLabel="Connect" />
              </div>
            </div>
          </div>
        </React.Fragment> :
        
        <React.Fragment>
          test
        </React.Fragment>
    );
}