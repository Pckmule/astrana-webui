import React from 'react';

import { DisplayMode } from '../../types/enums/displayMode';

import { IPeerSummary } from '../../types/interfaces/peerSummary';

import TranslationService from '../../services/TranslationService';

import { Icon } from '../../components/Icon';
import { Comment } from '../../components/Comment';

import "./InteractionsPanel.scss";

export function InteractionsPanel(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	peer: IPeerSummary;
	targetContentId: string;
	targetContentTypeId: string;
 })
{
	const namespaceClassName = "content-items-interactions";

	const [showCommentsPanel, setShowCommentsPanel] = React.useState<boolean>(false);

	const trxService = TranslationService();

	const toggleCommentsPanel = () => 
	{
		setShowCommentsPanel(showCommentsPanel === true ? false : true);
	};

	const cssClasses: string[] = [namespaceClassName];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<div className={cssClasses.join(" ")}>
			<div className={`${namespaceClassName}-details`}>
				<div className="count reactions-count">
					<span className="link">{0}</span>
				</div>
				<div className="count comments-count">
					<span className="link" onClick={toggleCommentsPanel}>{0} {trxService.trx(props.translations, "comments")}</span>
				</div>
				<div className="count shares-count">
					<span className="link">{0} {trxService.trx(props.translations, "shares")}</span>
				</div>
			</div>
			
			<div className={`${namespaceClassName}-actions`}>
				<span className="action react">
					<span><Icon name="thumb-up-outline" marginEnd={2} /> {trxService.trx(props.translations, "like")}</span>
				</span>

				<span className="action comment">
					<span><Icon name="comment-outline" marginEnd={2} /> {trxService.trx(props.translations, "comment")}</span>
				</span>

				<span className="action share">
					<span><Icon name="share-outline" marginEnd={2} /> {trxService.trx(props.translations, "share")}</span>
				</span>
			</div>

			{ showCommentsPanel && 
			<div className={`${namespaceClassName}-comments`}>
				<div className={`${namespaceClassName}-comments-thread`}>
					<Comment text={"Test"} peer={props.peer} displayMode={props.displayMode} translations={props.translations} />
				</div>
			</div>}
		</div>
	);
};