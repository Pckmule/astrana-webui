import React, { useState } from "react";

import { DisplayMode } from "../../types/enums/displayMode";

import TranslationService from "../../services/TranslationService";
import PeerService from "../../services/PeerService";

import { Button } from "../Button";

import "./ConnectPeerForm.scss";

export function ConnectPeerForm(props: { 
	displayMode?: DisplayMode, 
	translations: any, 
	sourcePeerId?: string, 
	sourcePeerFullName?: string, 
	sourcePeerAddress?: string, 
	buttonLabel?: string 
}) 
{
	const [peerAddress, setPeerAddress] = useState<string>("");

	const trxService = TranslationService();
	const peerService = PeerService();
	
	const handleSubmit = function()
	{
		peerService.sendPeerConnectionRequest(peerAddress, props.sourcePeerId, props.sourcePeerFullName, props.sourcePeerAddress).then((response: any) => 
		{
			console.log(response.data);
		})
		.catch((err: Error) => {
			console.log(err);
		});
	}

	const cssClasses: string[] = ["card", "rounded", "mb-3", "connect-peer-form"];

	return (
		<div className={cssClasses.join(" ")}>
			<div className="card-body">
				{props.displayMode === DisplayMode.Normal &&
					<React.Fragment>
						<div className="card-text">
							<input type="text" placeholder={trxService.trx(props.translations, "enter_a_peer_address")} value={peerAddress} className="form-control" aria-describedby="peerAddressHelp" id="peerAddress" name="peerAddress" onChange={e => setPeerAddress(e.target.value)} />
							<p id="peerAddressHelp" className="form-text small">{trxService.trx(props.translations, "enter_a_peer_address_helptext")}</p>
						</div>
						<Button hierarchy="primary" label={props.buttonLabel ?? trxService.trx(props.translations, "send_request")} onClick={handleSubmit} />
					</React.Fragment>
				}
			</div>
		</div>
	);
}