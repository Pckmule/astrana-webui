
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { ISystemSetting, ISystemSettingCategory } from '../../types/interfaces/settings';

import TextService from '../../services/TextService';
import UrlBuilderService from '../../services/UrlBuilderService';
import TranslationService from '../../services/TranslationService';
import SettingsService from '../../services/SettingsService';

import "./SettingsForm.scss";

export function SettingsForm(props: { category: ISystemSettingCategory; displayMode?: DisplayMode; translations: any; }) 
{
    const [settings, setSettings] = React.useState<ISystemSetting[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const settingsService = SettingsService();
    
    const loadInitialData = async () => 
    {
        setSettings( _.sortBy(await settingsService.getByCategory(props.category.name), [function(o) { return o.name; }]));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => 
    {      
        // state.configuration.regionCode = event.target.value;

        // setState(state);
    };
    
    function submitForm(event: React.FormEvent<HTMLFormElement>) 
    {
      event.preventDefault();
      event.stopPropagation();

      const form = event.currentTarget;

      if (form.checkValidity()) { alert(123); }

      form.classList.add('was-validated');
    }
    
    const cssClasses: string[] = ["card", "profile-section", "rounded", "mb-3"];

    if(props.displayMode === DisplayMode.Stencil)
      cssClasses.push("stencil");

    const textDirection = TextService().getTextDirection("LTR");
    const formSectionHeaderClassNames = `form-section-head ${textDirection}`;
    const formSectionBodyClassNames = `form-section-body ${textDirection}`;
    const formSectionFooterClassNames = `form-section-foot ${textDirection}`;

    const fields: any[] = [];

    (settings ?? []).map((setting: any, index) => (  
      fields.push({
        type: "text",
        id: `field_${setting.name.replace(new RegExp(" ", "g"), "")}`,
        label: trxService.trx(props.translations, setting.nameTrxCode, setting.name),
        placeholder: trxService.trx(props.translations, setting.nameTrxCode, setting.name),
        value: _.isEmpty(setting.value) ? setting.defaultValue :  setting.value,
        helpElementId: `${setting.name.replace(new RegExp(" ", "g"), "")}Help`,
        helpText: trxService.trx(props.translations, setting.descriptionTrxCode, setting.description)
      })
    ))

    return (
      <div className="form-section card rounded">
        <div className={formSectionHeaderClassNames}>{trxService.trx(props.translations, props.category.nameTrxCode, props.category.name)}</div>
        
        <form noValidate onSubmit={(e) => submitForm(e)}>
          <div className={formSectionBodyClassNames}>
              {
                (fields ?? []).map((field: any, index) => (
                  <div className="row g-3 align-items-center setting mb-3" key={index}>
                    <label htmlFor={field.id} className="col-sm-3 col-form-label">{field.label}</label>
                    <div className="col-sm-6">
                      <input type={field.type} id={field.id} placeholder={field.placeholder} defaultValue={field.value} className="form-control" aria-describedby={field.helpElementId} />
                    </div>
                    <div className="col-sm-3">
                      <span id={field.helpElementId} className="form-text">
                        {field.helpText}
                      </span>
                    </div>
                  </div>
                ))
              }                     
          </div>

          <div className={formSectionFooterClassNames}>
            <button type="submit" className="btn btn-sm btn-primary btn-next float-start">{trxService.trx(props.translations, "save")}</button>
          </div>
        </form>
      </div>
    );
};