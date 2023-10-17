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

export enum FormDropdownSortBy
{
	None,
	Alphabetical,
	Explicit
}

export const FormDropdownBox = (props: 
{
	translations: any,
	id?: string,
	placeholder?: string,
	options: any[],
	value: string,
	sortBy?: FormDropdownSortBy,
	cssClasses?: string,
	size?: number,
	onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void,
	required?: boolean,
	autoComplete?: string | undefined,
	textDirection?: 'ltr' | 'rtl' | 'auto'
}) => 
{
	const normalizeOptions = (options: any[]) => 
	{
		const list: IDropDownOptionData[] = [];

		if(options.length < 1)
			return list;

		options.forEach(option => 
		{
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
		const translation = props.translations[translationKey];
	
		if(translation)
		return translation;
	
		if(defaultValue && !_.isEmpty(defaultValue))
		return defaultValue;
	
		return translationKey;
	}

	const optionsList = props.sortBy === FormDropdownSortBy.Alphabetical ? 
		_.sortBy(getTranslatedOptions(normalizeOptions(props.options)), [function(o) { return o.label; }]) : 
		normalizeOptions(getTranslatedOptions(props.options));

	return (
		<select className="dropdown form-control" id={props.id} onChange={props.onChange} size={props.size} required={props.required} autoComplete={props.autoComplete} dir={props.textDirection} value={props.value}>
			{props.placeholder && <option value="" disabled hidden>{trx(props.placeholder)}</option>}
			{optionsList.map((option, index) => {
				return (
					<option key={index} value={option.value}>{option.label}</option>
				)
			})}
		</select>
	);
};
