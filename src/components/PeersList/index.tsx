
import React, { useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { IPeerInformation } from '../../types/objects/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import "./PeersList.scss";
import PeerService from '../../services/PeerService';

export function PeersList(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any, 
  profileId: string; 
  pageSize?: number;
}) 
{
    const [peers, setPeers] = React.useState<IPeerInformation[]>([]);

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

    const cssClasses: string[] = ["card", "peer-list", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    const getProfilePictureUrl = (peer: IPeerInformation) => 
    {      
        if(_.isEmpty(peer.profilePictureUrl))
        return "/images/placeholder-profile-picture.png";

        return peer.profilePictureUrl;
    };

    return (
      <div className={cssClasses.join(" ")}>
          <div className="peer-list-head">
            <h2>
              {trxService.trx(props.translations, "heading_peers")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("peers", props.profileId)}>{trxService.trx(props.translations, "heading_all_peers")}</Link>
            </h2>
          </div>
          <div className="peer-list-body">
            <div className="peers">
              {
                (peers ?? []).map((peer: any, index) => (
                  <div className="peer" key={index}>
                    <span className="profile-image"><img src={getProfilePictureUrl(peer)} /></span>
                    <span className="name">{peer.firstName}</span>
                    <span className="mutualpeers">{peer.mutalPeerCount} {trxService.trx(props.translations, peer.mutalPeerCount > 1 ? "mutual_peers" :  "mutual_peer")}</span>
                  </div>
                ))
              }
            </div>
          </div>
      </div>
    );
};