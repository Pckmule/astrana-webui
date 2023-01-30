import React, { useState, useEffect, ChangeEvent, MouseEventHandler } from "react";

import { IPeerInformation } from '../../types/objects/peerInformation';

import ApiService from "./../../services/ApiService";

import "./ConnectPeerForm.scss";

export function ConnectPeerForm(props: { 
    displayMode?: "normal" | "skeleton";
    title?: string,
    buttonLabel?: string,
    peerInformation: IPeerInformation
}) 
{
    const [peerAddress, setPeerAddress] = useState<string>("localhost:44301");

    const retrievePosts = (peerAddress: string) => {

        const api = ApiService(`https://${peerAddress}`);
        const endpoint = "/api/peers/connect";
        
        const request = {
            peerUuid: props.peerInformation.uuid,
            peerAddress: props.peerInformation.address,
            peerName: props.peerInformation.firstName
        };

        api.put(endpoint, request)
            .then((response: any) => {
                console.log(response.data);
            })
            .catch((err: Error) => {
                console.log(err);
            });
    };

    const handleSubmit = function(e: any)
    {
        retrievePosts(peerAddress);

        e.preventDefault();
    }

    return (
        <React.Fragment>
        {!props.displayMode &&
            <div className={"card rounded mb-3 connect-peer-form"}>
                <div className="card-body">
                    <div className="card-text">
                        <label htmlFor="peerAddress" className="form-label">{props.title ?? "Enter a Peer Address"}</label>
                        <input type="text" value={peerAddress} className="form-control" aria-describedby="peerAddressHelp" id="peerAddress" name="peerAddress" onChange={e => setPeerAddress(e.target.value)} />
                        <p id="peerAddressHelp" className="form-text small">The address of the Astrana Peer you want to connect to.</p>
                    </div>
                    <button type="submit" className="btn btn-sm btn-primary" onClick={handleSubmit}>{props.buttonLabel ?? "Send Request"}</button>
                </div>
            </div>
        }
        </React.Fragment>
    );
}