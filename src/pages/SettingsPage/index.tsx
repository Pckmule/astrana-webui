import React, { useEffect } from 'react';
import _ from 'lodash';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';

import { INavigationMenuItem } from '../../types/interfaces/navigationMenuItem';
import { ISystemSettingCategory } from '../../types/interfaces/settings';

import UrlBuilderService from '../../services/UrlBuilderService';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import UserService from '../../services/UserService';

import { useLocation } from 'react-router-dom';
import { Header } from './../../components/Header';
import { NavigationMenu } from "./../../components/NavigationMenu";
import { SettingsForm } from '../../components/SettingsForm';

import './SettingsPage.scss';

export function SettingsPage(props: {}) 
{
    const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Loading);

    const [translations, setTranslations] = React.useState<any>({ __loading: true });
    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({ __loading: true });

    const [currentUserInformation, setCurrentUserInformation] = React.useState<any>({});

    const [applicationSettingCategories, setApplicationSettingCategories] = React.useState<ISystemSettingCategory[]>([]);

    const urlBuilder = UrlBuilderService();
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

                await trxService.getTranslations(settingsService.findValue(response, "Language Code") ?? "EN").then(async (response: any | undefined) => 
                {
                    setTranslations(response);

                    await settingsService.getCategories().then(async (response: any | undefined) => 
                    {
                        setApplicationSettingCategories(response);
                      
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
        })
        .catch((error: Error | undefined) => {
            console.log(error);
        });
    };

    useEffect(() => {
      loadInitialData();
    }, []);
    
    const path = useLocation().pathname.split("/");

    const currentPageName = urlBuilder.getSlug(path[2]);

    const currentCategory = _.find(applicationSettingCategories, (o) => urlBuilder.getSlug(o.name) === currentPageName) ?? { name: "Instance" };

    const isPageReady = loadStatus !== ReadyStatus.Loaded ? ReadyStatus.Loading : ReadyStatus.Ready;
    const displayMode = !isPageReady ? DisplayMode.Stencil : DisplayMode.Normal;

    const menuItems: INavigationMenuItem[] = [];

    if(isPageReady)
      applicationSettingCategories && applicationSettingCategories.map((category, index) => (
        menuItems.push({ name: urlBuilder.getSlug(category.name), text: trxService.trx(translations, category.nameTrxCode, category.name), href: urlBuilder.settingsUrl(category.name) })
      ));

    return(
      <React.Fragment>
        <Header displayMode={displayMode} translations={translations} user={currentUserInformation} />
    
        <div className="container-fluid page-content">
          <div className="row g-0">
            <div className="drawer-l col-1 col-sm-2 col-md-2 col-lg-3 col-xl-2 d-none d-md-block">        
              <NavigationMenu displayMode={displayMode} menuItems={menuItems} activeItemName={currentPageName}  />
            </div>

            <div className="main-content col-12 col-sm-12 col-md-10 col-lg-9 col-xl-10">
              <main>
                {currentCategory && <SettingsForm category={currentCategory} displayMode={displayMode} translations={translations} />}
              </main>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
}