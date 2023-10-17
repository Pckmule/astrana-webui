import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import './TextBox.scss';

export function TextBox(props: 
{ 
	displayMode?: DisplayMode;
	value?: string;
	placeholder?: string; 
	multiLine?: boolean;
	minimumLength?: number;
	maximumLength?: number;
	showValidation?: boolean;
	rounded?: boolean;
	cssClassName?: string;
	onChange?: (value: string) => void;
	onEnterKeyPress?: () => void;
	onValidityChange?: (isValid: boolean) => void;
	onBlur?: () => void;
	preventDefault?: boolean;
	autoComplete?: boolean;
	showResizeHandle?: boolean;
}) 
{
	const [value, setValue] = React.useState<string>(props.value ?? "");
	const [showValidation, setShowValidation] = React.useState<boolean>(false);

	useEffect(() => { setValue(props.value ?? ""); }, [props.value]);

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => 
	{
		if (event.key === 'Enter') 
		{
			// do something..
		}
	}
	
	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
	{
		setValue(event.target.value);
		setShowValidation(props.showValidation === null || props.showValidation === undefined || props.showValidation === true ? true : false);

		if(props.onChange && typeof(props.onChange) === "function")
			props.onChange(event.target.value);

		if(props.onValidityChange && typeof(props.onValidityChange) === "function")
			props.onValidityChange(isValid());
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => 
	{
		setValue(event.target.value);
	};

	const isValid = () => 
	{
		if(props.minimumLength && props.minimumLength > value.length)
			return false;
	
		if(props.maximumLength && props.maximumLength < value.length)
			return false;

		return true;
	};

	const cssClasses: string[] = ["form-control", "rounded"];

	if(props.cssClassName && !_.isEmpty(props.cssClassName))
		cssClasses.push(props.cssClassName);

	if(!props.showResizeHandle)
		cssClasses.push("no-resize");

	if(showValidation)
		isValid() ? cssClasses.push("is-valid") : cssClasses.push("is-invalid");

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	if(props.multiLine)	
		return (
			<textarea 
				className={cssClasses.join(" ")} 
				placeholder={props.placeholder} 
				minLength={props.minimumLength} 
				maxLength={props.maximumLength} 
				defaultValue={value}
				onChange={handleChange} 
				onKeyUp={handleKeyPress}
				onBlur={handleBlur} 
				data-lpignore="true" 
				autoComplete={props.autoComplete ? "on" : "off" }>
			</textarea>
		);

	return (
		<input 
			className={cssClasses.join(" ")} 
			type="text" 
			value={value} 
			placeholder={props.placeholder} 
			minLength={props.minimumLength} 
			maxLength={props.maximumLength} 
			onChange={handleChange} 
			onKeyUp={handleKeyPress}
			onBlur={handleBlur} 
			data-lpignore="true"
			autoComplete={props.autoComplete ? "on" : "off" }
		/>
	);
};
