import React from 'react';

import TranslationService from '../../services/TranslationService';

import { Link } from 'react-router-dom';

import "./ProfileSummary.scss";

export interface IProfileSummaryState {
  profileId: string;
}

export function ProfileSummary(props: { 
  displayMode?: "normal" | "skeleton"; 
  translations: any,
  profileId: string; 
}) 
{
    const intialState = { 
      profileId: props.profileId ?? ""
    };
    
    const [state, setState] = React.useState<IProfileSummaryState>(intialState);

    const trxService = TranslationService();
    
    const cssClasses: string[] = ["card", "profile-section", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    return (
      <div className={cssClasses.join(" ")}>
          <div className="profile-section-head">
            <h2 className="">{trxService.trx(props.translations, "heading_intro")}</h2>
          </div>
          <div className="profile-section-body">
            <ul>
              <li><span className="btn btn-secondary">{trxService.trx(props.translations, "add_bio")}</span></li>
              <li><span className="btn btn-secondary">{trxService.trx(props.translations, "add_details")}</span></li>
            </ul>
          </div>
      </div>
    );
};