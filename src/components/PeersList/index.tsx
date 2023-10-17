
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { IPeerSummary } from '../../types/interfaces/peerSummary';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import PeerService from '../../services/PeerService';

import { Link } from 'react-router-dom';
import { ConnectPeerForm } from '../ConnectPeerForm';

import "./PeersList.scss";

export function PeersList(props: { 
	displayMode?: DisplayMode;
	translations: any, 
	profileId?: string; 
	currentPeerConnectionDetails?: IPeerSummary;
	pageSize?: number;
}) 
{
	const [peers, setPeers] = React.useState<IPeerSummary[]>([]);

	const trxService = TranslationService();
	const urlBuilder = UrlBuilderService();
	
	const peerService = PeerService();
	
	const loadInitialData = async () => 
	{
		setPeers(await peerService.getPeers(1, props.pageSize ?? 20));
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const cssClasses: string[] = ["card", "peer-list", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

		console.dir(props.currentPeerConnectionDetails);

	if((!props.profileId || _.isEmpty(props.profileId)) && (!props.currentPeerConnectionDetails || (!props.currentPeerConnectionDetails.id || _.isEmpty(props.currentPeerConnectionDetails.id))))
	{
		return null;
	}

	return (
		<div className={cssClasses.join(" ")}>
			<div className="peer-list-head">
				<h2>
					{trxService.trx(props.translations, "heading_peers")}
					<Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("peers-requests", props.profileId)}>{trxService.trx(props.translations, "connection_requests")}</Link>
					<Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("peers-requests", props.profileId)}>{trxService.trx(props.translations, "connect_to_peer")}</Link>
				</h2>
			</div>

			<div className="peer-list-body">
				<div className="peer-list-filters mb-3">
					<nav className="nav">
						<a className="nav-link active" aria-current="page" href="#">{trxService.trx(props.translations, "all_peers")}</a>
						<a className="nav-link" href="#">{trxService.trx(props.translations, "connect_to_peer")}</a>
						<a className="nav-link" href="#">Current City</a>
						<a className="nav-link" href="#">Custom 1</a>
						<a className="nav-link" href="#">Custom 2</a>
						<a className="nav-link" href="#">Custom 3</a>
					</nav>
				</div>

				{(peers && peers.length > 0) && <div className="peers-grid">
				{
					(peers ?? []).map((peer: IPeerSummary, index) => (
						<div key={peer.profileId} className="peer">
							<a href={urlBuilder.profileUrl("default", peer.profileId)}>
								<span className="profile-image float-start"><img src={peerService.getPeerProfilePictureUrlOrDefaultUrl(peer)} alt={peerService.buildPeerFullName(peer)} /></span>
								<span className="details float-start">
									<span className="name">{peer.firstName}</span>
									{ peer.statistics && <span className="mutualpeers">{peer.statistics.mutalPeerCount} {trxService.trx(props.translations, !peer.statistics.mutalPeerCount || peer.statistics.mutalPeerCount  > 1 ? "mutual_peers" : "mutual_peer")}</span> }
								</span>
							</a>
						</div>
					))
				}
				</div>}
				
				{
					(props.currentPeerConnectionDetails && (!peers || peers.length < 1)) && 
					<ConnectPeerForm sourcePeerId={props.currentPeerConnectionDetails.id} sourcePeerFullName={props.currentPeerConnectionDetails.firstName} sourcePeerAddress={props.currentPeerConnectionDetails.address} displayMode={props.displayMode} translations={props.translations} />
				}
			</div>
		</div>
	);
};