
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { IPeerInformation } from '../../types/interfaces/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import PeerService from '../../services/PeerService';

import { Link } from 'react-router-dom';
import { ActionButton } from '../ActionButton';

import "./PeerRequestsList.scss";

export function PeerRequestsList(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any, 
	profileId?: string; 
	pageSize?: number; 
}) 
{
	const [peerConnectionRequests, setPeerConnectionRequests] = React.useState<IPeerInformation[]>([]);

	const [peersApproved, setPeersApproved] = React.useState<string[]>([]);
	const [peersRejected, setPeersRejected] = React.useState<string[]>([]);

	const trxService = TranslationService();
	const urlBuilder = UrlBuilderService();
	const peerService = PeerService();
	
	const loadInitialData = async () => 
	{
		setPeerConnectionRequests(await peerService.getPeerConnectionRequestsReceived(0, 1, props.pageSize ?? 20));
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const cssClasses: string[] = ["card", "peer-requests-list", "rounded", "mb-3"];

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	const getProfilePictureUrl = (peer: IPeerInformation) => 
	{		
		if(_.isEmpty(peer.profilePictureUrl))
			return "/images/placeholder-profile-picture.png";

		return peer.profilePictureUrl;
	};

	const approveConnectionRequest = async (peerId: any) => 
	{
		if(!peerId || _.isEmpty(peerId))
		return;

		await peerService.approvePeerConnectionRequest(peerId);
	};

	const rejectConnectionRequest = async (peerId: any) => 
	{
		if(!peerId || _.isEmpty(peerId))
		return;

		await peerService.rejectPeerConnectionRequest(peerId);
	};

	const approvedCallback = (peerId: string, status: number, response: any) => 
	{
		console.dir(peerId);
		console.dir(status);
		console.dir(response);

		if(status !== 1)
			return;

		const updatedList = peersApproved;
				updatedList.push(peerId);

		setPeersApproved(updatedList);
	};

	const rejectedCallback = (peerId: string, status: number, response: any) => 
	{
		console.dir(peerId);
		console.dir(status);
		console.dir(response);
		
		if(status !== 2)
			return;

		const updatedList = peersRejected;
				updatedList.push(peerId);

		setPeersRejected(updatedList);
	};

	const peerConnectionRequestsToShow = peerConnectionRequests;//new Array(peerConnectionRequests);
	
	// for(let i = 0; i < peerConnectionRequests.length; i++)
	// {
		// if(_.includes(peersApproved, peerConnectionRequests[i].uuid))
		// {
		//	_.remove(peerConnectionRequestsToShow, () => peerConnectionRequests[i].uuid === )
		// }
	// }

	if(props.displayMode !== DisplayMode.Stencil && !props.profileId)
		return null;

	return (
		<div className={cssClasses.join(" ")}>
			<div className="peer-requests-head">
				<h2>
					{trxService.trx(props.translations, "heading_peer_connection_requests")}
					<Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("peers", props.profileId)}>{trxService.trx(props.translations, "connect_to_peer")}</Link>
				</h2>
			</div>
			<div className="peer-requests-body">				
				{
					peerConnectionRequestsToShow.length < 1 && 
					<div className="no-results-message">
						{trxService.trx(props.translations, "message_no_peer_connection_requests_at_this_time")}
					</div>
				}			 
				
				{
					peerConnectionRequestsToShow.length > 0 && 
					<div className="peer-requests-grid">
						<div className="row">
							{
							(peerConnectionRequestsToShow ?? []).map((peer: any, index) => (
								<div className="col-12 col-sm-12 col-md-6 col-lg-6" key={index}>
								<div className="peer-request">
									<span className="profile-image float-start"><img src={getProfilePictureUrl(peer)} /></span>
									<span className="details float-start">
										<span className="name">{peer.firstName} {peer.lastName}</span>

										{ peer.note && !_.isEmpty(peer.note) && <span className="note">{peer.note}</span>}
										
										<span className="actions">
											<ActionButton label="Approve" successLabel="" successIconName="check" onClick={async (e: any) => approveConnectionRequest(e)} callback={(status: number, response: any) => approvedCallback(peer.id, status, response)} allowRetryOnSuccess={false} allowRetryOnFail={true} data={peer.id} cssClassNames="btn-primary" successCssClassNames="btn-success" failCssClassNames="btn-danger" />
											<ActionButton label="Reject" successLabel="" successIconName="check" onClick={(e: any) => rejectConnectionRequest(e)} callback={(status: number, response: any) => rejectedCallback(peer.id, status, response)} allowRetryOnSuccess={false} allowRetryOnFail={true} data={peer.id} cssClassNames="btn-secondary-light" successCssClassNames="btn-success" failCssClassNames="btn-danger" />
										</span>
									</span>
								</div>
								</div>
							))
							}
						</div>
					</div>
				}
			</div>
		</div>
	);
};