import _ from "lodash";

import { DisplayMode } from '../../types/enums/displayMode';

import { Icon } from "../Icon";

import "./Button.scss";

interface IButtonProps 
{
	displayMode?: DisplayMode;
	label?: string;
	iconName?: string;
	theme?: "default" | "light" | "dark";
	hierarchy?: "primary" | "secondary" | "tertiary";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	description?: string;
	onClick?: () => void;
	cssClassNames?: string;
}

export const Button = ({ displayMode, label, iconName, description, hierarchy = "secondary", theme = "default", size = "small", disabled, onClick, cssClassNames }: IButtonProps) => 
{
	const primaryButtonClassName = "btn-primary";
	const secondaryButtonClassName = "btn-secondary";
	const tertiaryButtonClassName = "btn-primary";

	const handleClick = () => 
	{ 
		if(onClick && typeof(onClick) === "function")
			onClick();
	};

	const cssClasses: string[] = ["btn"];

	if(size === "small")
		cssClasses.push("btn-sm");
	
	if(size === "large")
		cssClasses.push("btn-lg");

	if(cssClassNames && !_.isEmpty(cssClassNames))
		cssClasses.push(cssClassNames);

	if(displayMode === DisplayMode.Stencil)
	{
		cssClasses.push("btn-placeholder");
	}

	if(hierarchy === "primary")
	{
		cssClasses.push(primaryButtonClassName);
	}
	else if(hierarchy === "secondary")
	{
		cssClasses.push(secondaryButtonClassName);
	}
	
	const buttonLabel = label;
	const buttonIconName = iconName || !_.isEmpty(iconName) ? iconName : "";
	const buttonIconDescription= !buttonLabel || _.isEmpty(buttonLabel) ? buttonIconName : buttonLabel;
	const buttonIconMargin = !buttonLabel || _.isEmpty(buttonLabel) ? 0 : 2;
	
	if(displayMode === DisplayMode.Stencil)
	{
		return (
			<button type="button" className={cssClasses.join(" ")} disabled={true}>
				{ buttonIconName && !_.isEmpty(buttonIconName) && <Icon name={buttonIconName} description={buttonIconDescription} marginEnd={buttonIconMargin} /> }
				{ buttonLabel && !_.isEmpty(buttonLabel) && <span className="text-placeholder" style={{ width: "80px" }}>&nbsp;</span> }
			</button>
		);
	}

	return (
		<button type="button" className={cssClasses.join(" ")} onClick={handleClick} disabled={disabled}>
			{ iconName && !_.isEmpty(iconName) && <Icon name={iconName} description={buttonIconDescription} marginEnd={buttonIconMargin} /> }
			{ buttonLabel && !_.isEmpty(buttonLabel) ? buttonLabel : undefined }
		</button>
	);
};
