import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import "./RemindersCard.scss";

export interface IRemindersCardState {
	remindersPicture: string;
	coverPicture: string;
	fullName: string;
	description?: string;
	remindersUrl: string;
}

export function RemindersCard(props: { displayMode?: DisplayMode; translations: any; })
{
	const cssClasses: string[] = ["reminders-card", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<React.Fragment>
			<div className={cssClasses.join(" ")}>
				<div className="reminders-card-body">
					<h3>Birthdays</h3>
				</div>
			</div>
		</React.Fragment>
	);
};