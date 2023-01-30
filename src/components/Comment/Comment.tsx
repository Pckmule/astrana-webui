import "./Comment.scss";

import React from "react";

export interface ICommentState {
    text: string;
}

export function Comment(props: { 
    text: string;
}) 
{
    const intialState = { 
        text: props.text
    };
    
    const [state, setState] = React.useState<ICommentState>(intialState);

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    let cssClasses = "comment";

    return (
        <div className={cssClasses}>{state.text}</div>
    );
};