import _ from "lodash";

import "./LoadIndicator.scss";

export function LoadIndicator(props: { type?: "default" | "gears" | "bouncingBars" | "dots" | undefined; color?: string; colorClass?: string; thickness?: number; size?: number }) 
{
    const color = props.color && !_.isEmpty(props.color) ? props.color: "rgb(220,220,220)";
    const size = props.size && props.size > 23 ? props.size: 24;
    const thickness = props.thickness && props.thickness > 4 ? props.thickness: 5;

    const cssClasses: string[] = ["loading-indicator"];

    if(props.colorClass && props.colorClass.length > 0)
    {
        cssClasses.push(props.colorClass);
    }

    if(props.type && props.type === "gears")
        return (
            <div className={cssClasses.join(" ")}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{margin: "auto", background: "none", display: "block", shapeRendering: "auto"}} width={`${size}px`} height={`${size}px`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <g transform="translate(50 50)"><g>
                    <animateTransform attributeName="transform" type="rotate" values="0;45" keyTimes="0;1" dur="0.4s" repeatCount="indefinite"></animateTransform><path d="M29.491524206117255 -5.5 L37.491524206117255 -5.5 L37.491524206117255 5.5 L29.491524206117255 5.5 A30 30 0 0 1 24.742744050198738 16.964569457146712 L24.742744050198738 16.964569457146712 L30.399598299691117 22.621423706639092 L22.621423706639096 30.399598299691114 L16.964569457146716 24.742744050198734 A30 30 0 0 1 5.5 29.491524206117255 L5.5 29.491524206117255 L5.5 37.491524206117255 L-5.499999999999997 37.491524206117255 L-5.499999999999997 29.491524206117255 A30 30 0 0 1 -16.964569457146705 24.742744050198738 L-16.964569457146705 24.742744050198738 L-22.621423706639085 30.399598299691117 L-30.399598299691117 22.621423706639092 L-24.742744050198738 16.964569457146712 A30 30 0 0 1 -29.491524206117255 5.500000000000009 L-29.491524206117255 5.500000000000009 L-37.491524206117255 5.50000000000001 L-37.491524206117255 -5.500000000000001 L-29.491524206117255 -5.500000000000002 A30 30 0 0 1 -24.742744050198738 -16.964569457146705 L-24.742744050198738 -16.964569457146705 L-30.399598299691117 -22.621423706639085 L-22.621423706639092 -30.399598299691117 L-16.964569457146712 -24.742744050198738 A30 30 0 0 1 -5.500000000000011 -29.491524206117255 L-5.500000000000011 -29.491524206117255 L-5.500000000000012 -37.491524206117255 L5.499999999999998 -37.491524206117255 L5.5 -29.491524206117255 A30 30 0 0 1 16.964569457146702 -24.74274405019874 L16.964569457146702 -24.74274405019874 L22.62142370663908 -30.39959829969112 L30.399598299691117 -22.6214237066391 L24.742744050198738 -16.964569457146716 A30 30 0 0 1 29.491524206117255 -5.500000000000013 M0 -20A20 20 0 1 0 0 20 A20 20 0 1 0 0 -20" fill="#cccccc"></path></g></g>
                </svg>
            </div>
        );
    
    if(props.type && props.type === "bouncingBars")
        return (
            <div className={cssClasses.join(" ")}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{margin: "auto", background: "none", display: "block", shapeRendering: "auto"}} width={`${size}px`} height={`${size}px`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <rect x="17.5" y="30" width="15" height="40" fill="#85a2b6">
                        <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="18;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.2s"></animate>
                        <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="64;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.2s"></animate>
                    </rect>
                    <rect x="42.5" y="30" width="15" height="40" fill="#bbcedd">
                        <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="20.999999999999996;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.1s"></animate>
                        <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="58.00000000000001;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.1s"></animate>
                    </rect>
                    <rect x="67.5" y="30" width="15" height="40" fill="#dce4eb">
                        <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="20.999999999999996;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1"></animate>
                        <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="58.00000000000001;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1"></animate>
                    </rect>
                </svg>
            </div>
        );


    if(props.type && props.type === "dots")
        return (
            <div className={cssClasses.join(" ")}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{margin: "auto", background:"none" , display:"block" , shapeRendering:"auto" }} width={`${size}px`} height={`${size}px`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <g transform="translate(80,50)">
                        <g transform="rotate(0)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="1">
                                <animateTransform attributeName="transform" type="scale" begin="-0.875s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.875s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(71.21320343559643,71.21320343559643)">
                        <g transform="rotate(45)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.875">
                                <animateTransform attributeName="transform" type="scale" begin="-0.75s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.75s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(50,80)">
                        <g transform="rotate(90)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.75">
                                <animateTransform attributeName="transform" type="scale" begin="-0.625s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.625s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(28.786796564403577,71.21320343559643)">
                        <g transform="rotate(135)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.625">
                                <animateTransform attributeName="transform" type="scale" begin="-0.5s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.5s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(20,50.00000000000001)">
                        <g transform="rotate(180)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.5">
                                <animateTransform attributeName="transform" type="scale" begin="-0.375s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.375s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(28.78679656440357,28.786796564403577)">
                        <g transform="rotate(225)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.375">
                                <animateTransform attributeName="transform" type="scale" begin="-0.25s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.25s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(49.99999999999999,20)">
                        <g transform="rotate(270)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.25">
                                <animateTransform attributeName="transform" type="scale" begin="-0.125s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.125s"/>
                            </circle>
                        </g>
                    </g>
                    <g transform="translate(71.21320343559643,28.78679656440357)">
                        <g transform="rotate(315)">
                            <circle cx="0" cy="0" r="6" fill="#cccccc" fill-opacity="0.125">
                                <animateTransform attributeName="transform" type="scale" begin="0s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"/>
                                <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="0s"/>
                            </circle>
                        </g>
                    </g>
                </svg>
            </div>
        );
        
    return (
        <div className={cssClasses.join(" ")}>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{margin: "auto", background: "none", display: "block", shapeRendering: "auto"}} width={`${size}px`} height={`${size}px`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                <circle cx="50" cy="50" fill="none" stroke={color} strokeWidth={thickness} r="35" strokeDasharray="164.93361431346415 56.97787143782138">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1.3513513513513513s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
                </circle>
            </svg>
        </div>
    );
};