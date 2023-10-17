import React, { useEffect } from 'react';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';

import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import UserService from '../../services/UserService';

import { Header } from './../../components/Header';
import { LeftDrawerNavigationMenu } from "./../../components/LeftDrawerNavigationMenu";

import './NewsReaderPage.scss';

export function NewsReaderPage(props: {}) 
{
    const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Loading);

    const [translations, setTranslations] = React.useState<any>({ __loading: true });
    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });
    
    const [currentUserInformation, setCurrentUserInformation] = React.useState<any>({});

    const settingsService = SettingsService();
    const trxService = TranslationService();
    const userService = UserService();
    
    const loadInitialData = async () => 
    {
        await userService.getProfile().then(async (response: any | undefined) => 
        {
            setCurrentUserInformation(response);
            
            await settingsService.getAll().then(async (response: any | undefined) => 
            {
                setCurrentUserSettings(response);

                await trxService.getTranslations(settingsService.findValue(response, "Language Code") ?? "EN").then((response: any | undefined) => 
                {
                    setTranslations(response);
                    
                    setLoadStatus(ReadyStatus.Loaded);
                })
                .catch((error: Error | undefined) => {
                    console.log(error);
                });
            })
            .catch((error: Error | undefined) => {
                console.log(error);
            });
        })
        .catch((error: Error | undefined) => {
            console.log(error);
        });
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const menuItems = [
      { text: trxService.trx(translations, "nav_menuitem_community_feed"), href: "", iconName: "card-text-outline" },
      { text: trxService.trx(translations, "nav_menuitem_pin_boards"), href: "pinboards", iconName: "view-dashboard" },
      { text: trxService.trx(translations, "nav_menuitem_news_reader"), href: "newsfeed", iconName: "newspaper-variant-outline" }, 
      { text: trxService.trx(translations, "nav_menuitem_profile"), href: "profile", iconName: "account-circle" }
    ];

    const isPageReady = loadStatus !== ReadyStatus.Loaded ? ReadyStatus.Loading : ReadyStatus.Ready;
    const displayMode = !isPageReady ? DisplayMode.Stencil : DisplayMode.Normal;

    return(
      <React.Fragment>
        <Header displayMode={displayMode} translations={translations} user={currentUserInformation} />
    
        <div className="container-fluid page-content">
          <div className="row g-0">
            <div className="drawer-l col-1 col-sm-2 col-md-2 col-lg-3 col-xl-2 d-none d-md-block">        
              <LeftDrawerNavigationMenu displayMode={displayMode} menuItems={menuItems} />
            </div>

            <div className="main-content col-12 col-sm-12 col-md-10 col-lg-9 col-xl-10">
              <main>
                News reader page...
              </main>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
}