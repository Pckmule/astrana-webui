import React, { useEffect } from 'react';

import { IApplicationSettings } from './../../types/objects/applicationSettings';
import { IUserInfo } from './../../types/interfaces/user';

import TranslationService from './../../services/TranslationService';
import UserService from '../../services/UserService';

import { Header } from './../../components/Header';
import { LeftDrawerNavigationMenu } from "./../../components/LeftDrawerNavigationMenu";

import './PinBoardPage.scss';

interface PinBoardPageProps {
  settings: IApplicationSettings;
  user: IUserInfo;
}

export function PinBoardPage({ settings, user }: PinBoardPageProps) 
{
    const [translations, setTranslations] = React.useState<any>({ __loading: true });

    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({
        languageCode: "zh"
    });
    
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

    const menuItems = [
      { text: trxService.trx(translations, "nav_menuitem_community_feed"), href: "", iconName: "mdi-card-text-outline" },
      { text: trxService.trx(translations, "nav_menuitem_pin_boards"), href: "pinboards", iconName: "mdi-view-dashboard" },
      { text: trxService.trx(translations, "nav_menuitem_news_reader"), href: "newsfeed", iconName: "mdi-newspaper-variant-outline" }, 
      { text: trxService.trx(translations, "nav_menuitem_profile"), href: "profile", iconName: "mdi-account-circle" }
    ];

    const isPageReady = translations.__loading ? "loading" : "ready";
    const displayMode = !isPageReady ? "skeleton" : "normal";

    return(
      <React.Fragment>
        <Header displayMode={displayMode} user={user} />
    
        <div className="container-fluid page-content">
          <div className="row g-0">
            <div className="drawer-l col-1 col-sm-2 col-md-2 col-lg-3 col-xl-2 d-none d-md-block">        
              <LeftDrawerNavigationMenu displayMode={displayMode} menuItems={menuItems} />
            </div>

            <div className="main-content col-12 col-sm-12 col-md-10 col-lg-9 col-xl-10">
              <main>
                Pin Boards go here...
              </main>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
}