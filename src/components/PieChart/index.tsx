import React from "react";
import _ from "lodash";

import "./PieChart.scss";

export function PieChart(props: { size: number; percentage: number; animate?: boolean; lineThickness?: number; rotate?: number; }) 
{
    const chartRef = React.useRef<HTMLInputElement>(null);

    const options = {
        percent:  chartRef.current?.getAttribute('data-percent') || 0,
        size: chartRef.current?.getAttribute('data-size'),
        lineWidth: chartRef.current?.getAttribute('data-line'),
        rotate: chartRef.current?.getAttribute('data-rotate') || 0
    }

    // const chart = new EasyPieChart(chartRef, options);
    
    // props.animate ? chart.enableAnimation() :  chart.disableAnimation();

    return (
        <div ref={chartRef} className="chart" data-size={props.size} data-line={props.lineThickness || 15} data-rotate={props.rotate} data-percent={props.percentage}>{props.percentage}</div>
    );
};