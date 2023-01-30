
import React, { useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { IPeerInformation } from '../../types/objects/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import "./ProfilePeers.scss";
import PeerService from '../../services/PeerService';

export function ProfilePeers(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any, 
  profileId: string; 
}) 
{
    const [peers, setPeers] = React.useState<IPeerInformation[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const peerService = PeerService();
    
    const loadInitialData = async () => 
    {
        setPeers(await peerService.getPeers(1, 9));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const cssClasses: string[] = ["card", "profile-section", "rounded", "mt-3 mb-3"];

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
          <div className="profile-section-head">
            <h2>
              {trxService.trx(props.translations, "heading_peers")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("peers", props.profileId)}>{trxService.trx(props.translations, "heading_all_peers")}</Link>
            </h2>
          </div>
          <div className="profile-section-body">
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