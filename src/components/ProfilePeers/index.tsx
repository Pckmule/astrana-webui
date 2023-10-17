
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { IPeerSummary } from '../../types/interfaces/peerSummary';

import { Heading } from '../Heading';
import { ConnectPeerForm } from '../ConnectPeerForm';
import { Link } from 'react-router-dom';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import PeerService from '../../services/PeerService';

import "./ProfilePeers.scss";

export function ProfilePeers(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	profileId?: string; 
	currentPeerConnectionDetails?: IPeerSummary;
}) 
{
	const [peers, setPeers] = React.useState<IPeerSummary[]>([]);

	const trxService = TranslationService();
	const urlBuilder = UrlBuilderService();
	
	const peerService = PeerService();
	
	const loadInitialData = async () => 
	{	 
		await peerService.getPeers(1, 9).then((peerSummaries: IPeerSummary[]) => 
		{
			if(peerSummaries && _.isArray(peerSummaries))
				setPeers(peerSummaries);
		})
		.catch((error: Error) => {
			console.dir(error);
		});
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	let counter = 0;

	const buildPeerItemClasses = () => 
	{
		counter++;
		
		if(counter > 3)
			counter = 1;

		const classes: string[] = ["peer"];

		if(counter === 1)
			classes.push("peer-s");
		
		if(counter === 3)
			classes.push("peer-e");

		return classes.join(" ");
	};

	const cssClasses: string[] = ["card", "profile-section", "rounded", "mb-3"];

    if(props.displayMode === DisplayMode.Stencil)
		  cssClasses.push("stencil");
	
	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

	return (
		<div className={cssClasses.join(" ")}>
			<div className="profile-section-head">
				<Heading size={2} text={trxService.trx(props.translations, "heading_peers")} btnLinkUrl={urlBuilder.profileUrl("peers", props.profileId)} btnText={trxService.trx(props.translations, "heading_all_peers")} displayMode={props.displayMode} />
			</div>
			<div className="profile-section-body">
				<div className="peers-grid">
				{
					(peers).map((peer: any, index) => (
						<div key={peer.profileId} className={buildPeerItemClasses()}>
							<a href={urlBuilder.profileUrl("default", peer.profileId)}>
								<span className="profile-image"><img src={peerService.getPeerProfilePictureUrlOrDefaultUrl(peer)} alt={peer.firstName} /></span>
								<span className="name">{peer.firstName}</span>
								<span className="mutualpeers">{peer.mutalPeerCount} {trxService.trx(props.translations, peer.mutalPeerCount > 1 ? "mutual_peers" :	"mutual_peer")}</span>
							</a>
						</div>
					))
				}
				</div>
				
				{
					(props.currentPeerConnectionDetails && (!peers || peers.length < 1)) && 
					<ConnectPeerForm sourcePeerId={props.currentPeerConnectionDetails.id} sourcePeerFullName={props.currentPeerConnectionDetails.firstName} sourcePeerAddress={props.currentPeerConnectionDetails.address} displayMode={props.displayMode} translations={props.translations} />
				}
			</div>
		</div>
	);
};