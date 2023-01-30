import _ from 'lodash';

import { IQueryParameter } from '../types/api/api';

import ApiService from "./ApiService";

export default function TranslationService() 
{
    async function loadTranslations(languageCode: string) 
    {
        const endpoint = "internationalization/translations/all";

        const translationsRequest: IQueryParameter[] = [
          { 
            key: "languageCode",
            value: languageCode 
          }
        ];

        return ApiService().get(endpoint, undefined, translationsRequest).then((response: any | undefined) =>
        {
            const translations = (response && _.isObject(response.data)) ? response.data : null;

            if(localStorage && translations)
              localStorage.setItem("translations", translations);

            console.dir(translations);

            if(!translations)
            {
                console.info(`[Astrana] Could not load translations for ${languageCode}. Falling back to cached translations.`);
                
                return Promise.resolve(localStorage.getItem("translations") ?? {});
            }

            return Promise.resolve(translations);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    };

    const trx = function (translations: any, translationKey: string, defaultValue?: string | undefined | null) 
    {
        const translation = translations[translationKey];

        if(translation)
          return translation;

        if(defaultValue && !_.isEmpty(defaultValue))
          return defaultValue;

        return translationKey;
    };
    
    return {
      loadTranslations: loadTranslations,
      getTranslations: loadTranslations,
      trx: trx
    };
}