import React from 'react';
import _ from 'lodash';

import './FormDropdownBox.scss';

export interface IDropDownData 
{
    label: string;
    trxCode: string;
    iconAddress?: string;
    options: IDropDownOptionData[];
}

export interface IDropDownOptionData 
{
    value: string;
    label: string;
    trxCode: string;
    iconAddress?: string;
}

interface IFormDropdownBoxProps {
  id?: string;
  placeholder: string;
  options: any[],
  sortBy?: 'alpha' | 'explicit' | null;
  value: string;
  cssClasses?: string;
  size?: number;
  translations: any,
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  autoComplete?: string | undefined;
  textDirection?: 'ltr' | 'rtl' | 'auto';
}

export const FormDropdownBox = ({
  id,
  placeholder,
  options,
  sortBy,
  value,
  cssClasses,
  size,
  translations,
  onChange,
  required,
  autoComplete,
  textDirection,
  ...props
}: IFormDropdownBoxProps) => 
{
  const normalizeOptions = (options: any[]) => 
  {
      const list: IDropDownOptionData[] = [];
  
      options.forEach(option => {

        if(!_.isEmpty(option.twoLetterCode) && !_.isEmpty(option.name))
        {
            list.push({
              value: option.twoLetterCode,
              label: option.name,
              trxCode: option.nameTrxCode,
              iconAddress: ""
            });
        }
        else
        {
            list.push({
              value: option.value,
              label: option.label,
              trxCode: option.trxCode,
              iconAddress: option.iconAddress
            });
        }
      });
  
      return list;
  }

  const getTranslatedOptions = (options: IDropDownOptionData[]) => 
  {
      const list: IDropDownOptionData[] = _.cloneDeep(options);
  
      options.forEach(option => {
        

        option.label = _.isEmpty(option.trxCode) || _.isEmpty(trx(option.trxCode)) ? option.label : trx(option.trxCode);
      });
  
      return list;
  }
   
  const trx = function (translationKey: string, defaultValue?: string | undefined | null) 
  {
      const translation = translations[translationKey];
  
      if(translation)
        return translation;
  
      if(defaultValue && !_.isEmpty(defaultValue))
        return defaultValue;
  
      return translationKey;
  }

  console.log(id);
  console.dir(options);

  const optionsList = sortBy === "alpha" ? 
      _.sortBy(getTranslatedOptions(normalizeOptions(options)), [function(o) { return o.label; }]) : 
      normalizeOptions(getTranslatedOptions(options));

  return (
    <select className="form-control" id={id} value={value} onChange={onChange} size={size} required={required} autoComplete={autoComplete} dir={textDirection} {...props}>
      {placeholder && <option value="" disabled hidden>{trx(placeholder)}</option>}
      {optionsList.map((option, index) => {
        return (
          <option key={index} value={option.value}>{option.label}</option>
        )
      })}
    </select>
  );
};
