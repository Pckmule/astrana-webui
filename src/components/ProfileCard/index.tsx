import React from 'react';
import { Link } from 'react-router-dom';

import { ProfileImage } from '../ProfileImage';

import "./ProfileCard.scss";

export interface IProfileCardState {
    profilePicture: string;
    coverPicture: string;
    fullName: string;
    description?: string;
    profileUrl: string;
}

export function ProfileCard(props: { 
  displayMode?: "normal" | "skeleton";
  profilePicture?: string;
  coverPicture?: string;
  fullName: string;
  description?: string;
  url?: string;
}) 
{
    const intialState = { 
      profilePicture: props.profilePicture ?? "",
      coverPicture: props.coverPicture ?? "",
      fullName: props.fullName ?? "",
      description: props.description ?? "",
      profileUrl: props.url ?? "",
    };
    
    const [state, setState] = React.useState<IProfileCardState>(intialState);

    const cssClasses: string[] = ["profile-card", "rounded", "mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    return (
      <React.Fragment>
          <div className={cssClasses.join(" ")}>
              <div className="profile-card-body">
                <div className="details">
                    <div className="profile-bg-image" style={{backgroundImage: "url('" + state.coverPicture + "')"}}></div>
                
                    <Link to={state.profileUrl}>
                        <div className="profile-picture rounded">
                          <ProfileImage peerName={state.fullName} imageAddress={state.profilePicture} width={64} height={64} />
                        </div>
                        <div className="name m-3">{state.fullName}</div>
                    </Link>
                
                    <p className="description m-3">
                        {state.description}
                    </p>
                </div>

                <div className="items pt-2">
                  <a href="/my-items/"><span>My items</span></a>
                </div>
              </div>
          </div>
      </React.Fragment>
    );
};