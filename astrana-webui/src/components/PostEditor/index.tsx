import _ from 'lodash';
import React from 'react';

import { IUserInfo } from '../../types/interfaces/user';

import TranslationService from "./../../services/TranslationService";

import { ProfileImage } from '../ProfileImage';

import "./PostEditor.scss";

export interface IPostEditorState {
    audioElement?: any; 
    hardBorders: boolean;
}
  
export function PostEditor(props: { displayMode?: "normal" | "skeleton"; translations: any, userInfo: IUserInfo, hardBorders?: boolean }) 
{
    const intialState = { 
        audioElement: undefined, 
        hardBorders: props.hardBorders ?? false
    };
    
    const [state, setState] = React.useState<IPostEditorState>(intialState);

    let cssClasses = "post-editor";
    const roundingClasses = state.hardBorders ? "rounded-0" : "rounded";

    const trxService = TranslationService();
    
    return (
        <div className={cssClasses}>   
            <div className={"card " + roundingClasses + " m-3"}>         
                <div aria-label="Create a post" className="" role="region">
                    <div className="editor-box m-2">
                        <span className="user-profile-picture">
                            <div>
                                <ProfileImage peerName={props.userInfo.fullName} imageAddress={props.userInfo.profilePictureUrl} profileUrl={"/profile"} height={40} aria-label={props.userInfo.fullName + "'s timeline"} />
                            </div>
                        </span>
                        <div className="textbox" role="button" tabIndex={0}>
                            <div className="textbox-message p-2">
                                <span>{trxService.trx(props.translations, "whats_on_your_mind").replace("{{first_name}}", props.userInfo.firstName)}</span>
                            </div>                            
                        </div>
                    </div>
                    <div className="actions">
                        <span className="action react" tabIndex={0}>
                            <span><i className="icon material-icons me-2">thumb_up</i> Live video</span>
                        </span>
                        <span className="action comment" tabIndex={0}>
                            <span><i className="icon material-icons me-2">insert_comment</i> Photo/video</span>
                        </span>
                        <span className="action share" tabIndex={0}>
                            <span><i className="icon material-icons me-2">share</i> Feeling/activity</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};