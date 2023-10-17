import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import TranslationService from '../../services/TranslationService';

import { Icon } from '../Icon';

import './PillBox.scss';

interface IPill 
{
	id: string;
	label: string;
	value?: string;
}

export function PillBox(props: 
{
	displayMode?: DisplayMode;
    translations: any;
	textCase?: "lower" | "upper" | null;
	rounded?: boolean;
	onAdd?: () => void;
	onRemove?: () => void; 
}) 
{
	const namespaceClassName = "pillbox";

	const trxService = TranslationService();

    const [pills, setPills] = React.useState<IPill[]>([]);
    const [backspaceCount, setBackspaceCount] = React.useState<number>(0);

	const handleAdd = (pill: IPill) => 
	{
		const changeState = (state: IPill[]) => 
		{
			const updatedState: IPill[] = [...state];
	
			updatedState.push(pill);
			
			if(props.onAdd && typeof(props.onAdd) === "function")
				props.onAdd();
		
			return updatedState;
		};

		setPills(state => changeState(state));
	}

	const handleRemove = (pill: IPill) => 
	{
        const changeState = (state: IPill[]) => 
        {
            const updatedState: IPill[] = [...state];
    
            const itemIndex = state.findIndex((item) => { return item.id === pill.id });
            
            if(itemIndex < 0) 
                return state;

			if(props.onRemove && typeof(props.onRemove) === "function")
				props.onRemove();
		
            return updatedState.filter(item => item.id !== pill.id);
        };

        setPills(state => changeState(state));
	}

	const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => 
	{
		if(event.key === "Backspace" && event.currentTarget.value.length === 0)
		{
			setBackspaceCount(state => state + 1);

			if(pills.length > 0 && backspaceCount > 1)
			{
				handleRemove(pills[pills.length - 1]);
			}

			setTimeout(() => setBackspaceCount(0), 2000);

			return;
		}

		setBackspaceCount(0);

		if(event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			handleAdd({
				id: `${pills.length + 1}`,
				label: event.currentTarget.value
			});

			event.currentTarget.value = "";
			event.currentTarget.style.width = "";

			return;	
		}

		const minimumWidth = 7;
		const textWidth = event.currentTarget.value.length * 0.5;

		event.currentTarget.style.width = ((event.currentTarget.value.length === 0 && textWidth > minimumWidth) ? minimumWidth : textWidth) + "rem";
	}

	const cssClasses: string[] = [namespaceClassName, "me-2"];

	if(props.rounded === undefined || props.rounded)
		cssClasses.push("rounded");
	
	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");
	
	return (
		<div className={cssClasses.join(" ")}>
			<div className={`${namespaceClassName}-pills`}>
				{pills.map((pill) => {
					return (
						<span className={"pill rounded"} tabIndex={-1} key={pill.id}>
							<span className="pill-label">{pill.label}</span>
							<span className="remove-pill ms-2" onClick={() => handleRemove(pill)}>
								<Icon displayMode={props.displayMode} name="close" altText={trxService.trx(props.translations, "remove")} />
							</span>
						</span>
					)
				})}
				
				<input type="text" onKeyUp={handleKeyUp} placeholder={trxService.trx(props.translations, "filter_by_tags")} />
			</div>
		</div>
	);
};
