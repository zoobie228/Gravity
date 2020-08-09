import React from 'react'
import PropTypes from 'prop-types'

export class Square extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
        color: PropTypes.string,
        hover: PropTypes.bool,
        opacity: PropTypes.number,
        events: PropTypes.object
    }

    render() {
        let { x, y, width, height, color, hover, opacity, events } = this.props

        return (
            <rect className={`legend-decorator`}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={color}
                strokeWidth={hover ? 4 : 0}
                stroke={color}
                fillOpacity={opacity}
                strokeOpacity={hover ? 0.25 : 1}
                {...events}
            />
        )
    }
}

export class CircleUponLine extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
        decoratorStyle: PropTypes.object,
        color: PropTypes.string,
        hover: PropTypes.bool,
        opacity: PropTypes.number,
        events: PropTypes.object
    }

    render() {
        let { x, y, height, color, hover, opacity, events } = this.props
        let width = 15

        return (
            <g className='legend-decorator'>
                <line
                    x1={x}
                    y1={y + height * .5}
                    x2={x + width}
                    y2={y + height * .5}
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={opacity}
                />
                <line
                    className='line-hover'
                    x1={x}
                    y1={y + height * .5}
                    x2={x + width}
                    y2={y + height * .5}
                    stroke={hover ? color : 'transparent'}
                    strokeWidth={8}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    opacity={.25}
                    {...events}
                />
                <circle
                    cx={x + width * .5}
                    cy={y + height * .5}
                    r={2.5}
                    stroke={color}
                    strokeOpacity={opacity}
                    strokeWidth={1}
                    fill='white'
                    {...events}
                />
            </g>
        )
    }
}