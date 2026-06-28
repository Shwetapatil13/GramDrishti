import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartConfig {
    type: string;
    title: string;
    x: (string | number)[];
    y: number[];
}

interface Props {
    config: ChartConfig;
}

export const DynamicChart: React.FC<Props> = ({ config }) => {
    const options = {
        title: {
            text: config.title,
            textStyle: {
                color: '#fff',
                fontSize: 12,
                fontWeight: 'normal'
            },
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1E1E1E',
            borderColor: '#333',
            textStyle: { color: '#fff' }
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '25%'
        },
        xAxis: {
            type: 'category',
            data: config.x,
            axisLine: { lineStyle: { color: '#555' } },
            axisLabel: { color: '#aaa' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#333' } },
            axisLabel: { color: '#aaa' },
            scale: true
        },
        series: [
            {
                data: config.y,
                type: config.type,
                smooth: true,
                itemStyle: { color: '#00F0FF' }, // Brand mint
                lineStyle: { color: '#00F0FF', width: 2 },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(0, 240, 255, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(0, 240, 255, 0)'
                        }]
                    }
                }
            }
        ],
        backgroundColor: 'transparent'
    };

    return (
        <div className="w-full h-48 bg-surface-elevated rounded-md border border-surface-border">
            <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};
