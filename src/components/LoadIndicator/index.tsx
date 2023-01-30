import "./LoadIndicator.scss";

export function LoadIndicator(props: { color?: string; }) 
{
    const border = "20px solid " + (props.color ? "#f3f3f3": props.color);

    return (
        <div className="load-indicator-rolling">
            <div className="indicator">
                <div></div>
            </div>
        </div>
    );
};