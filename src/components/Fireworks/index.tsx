import React from "react";

import "./Fireworks.scss";

export function Fireworks(props: { timeout?: number }) 
{    
	const [display, setDisplay] = React.useState<boolean>(true);

	if(props.timeout && props.timeout > 0)
	{
		setTimeout(() => setDisplay(false), (props.timeout * 1000));
	}

	return (
		<React.Fragment>
			{display && <div className="pyro">
				<div className="before"></div>
				<div className="after"></div>
			</div>}
		</React.Fragment>
	);
};