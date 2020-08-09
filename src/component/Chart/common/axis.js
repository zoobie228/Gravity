import React from 'react'
import PropTypes from 'prop-types'
import { niceNumberArray, assignStyle, isScaleLinear } from './util'
import debounce from 'lodash/debounce'

const defaultStyles = {
    strokeWidth: 1
}

const Path = ({ orientation, width, height, hidePath, styles }) => { //eslint-disable-line
    let x = 0
    let y = 0
    let x2 = 0
    let y2 = 0

    switch (orientation) {
        case 'top':
            x = 0
            y = 0
            x2 = width
            y2 = 0
            break
        case 'right':
            x = width + styles.strokeWidth / 2
            y = height
            x2 = x
            y2 = 0
            break
        case 'bottom':
            x = 0
            y = height
            x2 = width
            y2 = height
            break
        case 'left':
            x = styles.strokeWidth / 2 * -1
            y = height
            x2 = x
            y2 = 0
            break
    }

    return (
        !hidePath && <path className='axis-path' d={`M${x} ${y} L${x2} ${y2}`} />
    )
}

const axisCommonPropTypes = {
    id: PropTypes.string,
    height: PropTypes.number,
    nice: PropTypes.func,
    styles: PropTypes.object,
    tickSize: PropTypes.number,
    width: PropTypes.number,
    xOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    yOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    hidePath: PropTypes.bool
}

const axisCommonDefaultProps = {
    nice: niceNumberArray,
    tickSize: 0,
    xOffset: 0,
    yOffset: 0,
    hidePath: false
}

const axisTickPropType = PropTypes.shape({
    rotate: PropTypes.number,
    textAnchor: PropTypes.oneOf(['start', 'middle', 'end'])
})

const axisTickDefaultProps = {
    rotate: 0,
    fontSize: '1rem'
}

const xAxisTickDefaultProps = {
    textAnchor: 'middle',
    ...axisTickDefaultProps
}

const yAxisTickDefaultProps = {
    textAnchor: 'end',
    ...axisTickDefaultProps
}


export class XAxis extends React.Component {
    static get propTypes() {
        return {
            ...axisCommonPropTypes,
            domainAlignment: PropTypes.oneOf(['start', 'middle', 'end']),
            orientation: PropTypes.oneOf(['top', 'bottom', 'middle']),
            xScale: PropTypes.func,
            tickAlignment: PropTypes.oneOf(['start', 'middle', 'end']),
            xAxisTick: axisTickPropType,
            xDomain: PropTypes.array,
            xTickFormatter: PropTypes.func,
            xTooltip: PropTypes.func
        }
    }

    static get defaultProps() {
        return {
            ...axisCommonDefaultProps,
            orientation: 'bottom',
            tickAlignment: 'start',
            xAxisTick: { rotate: 0, textAnchor: 'middle', fontSize: '1rem' },
            xTickFormatter: (text, index, xBandwidth) => text,
            xTooltip: (text, index, xBandwidth) => ''
        }
    }

    static onAxisToolTipChangeHelper = onAxisToolTipChange

    constructor(props) {
        super(props)
        this.debouncedOnMouseOverOrLeaveXAxisLabel = debounce(onMouseOverOrLeaveXAxisLabel, 100)
    }

    render() {
        let {
            xDomain,
            xBandwidth,
            yOffset,
            height,
            hidePath,
            nice,
            tickSize,
            xTickFormatter,
            xAxisTick,
            xScale,
            domainAlignment = isScaleLinear(xScale) ? 'start' : 'middle',
            tickAlignment,
            width,
            orientation,
            onAxisToolTipChange = () => { },
            styles
        } = this.props
        let isTop = orientation === 'top'
        let axisX = 0
        let axisY = isTop ? 0 : height
        styles = assignStyle(defaultStyles, styles)
        xDomain = nice(xDomain)
        domainAlignment = getAlignmentOffset(domainAlignment, xBandwidth)
        tickAlignment = getAlignmentOffset(tickAlignment, xBandwidth)
        xAxisTick = Object.assign({}, xAxisTickDefaultProps, xAxisTick)
        yOffset = typeof yOffset === 'function' ? yOffset(width, height) : yOffset

        return (
            <g className='ssd-chart-xAxis' transform={`translate(0,${yOffset})`}>
                <Path hidePath={hidePath} orientation={orientation} width={width} height={height} styles={styles} />
                {
                    xDomain.map((name, index) => {
                        let x = xScale(name) + domainAlignment
                        let y = isTop ? axisY - 10 : axisY + 20
                        let { rotate, ...textProps } = xAxisTick
                        return (
                            <text
                                className='tick-text'
                                key={index}
                                x={x}
                                y={y}
                                transform={`rotate(${rotate},${x},${y})`}
                                data-name={name}
                                onMouseOver={
                                    evt => this.debouncedOnMouseOverOrLeaveXAxisLabel({ target: evt.target }, name, index, xBandwidth, onAxisToolTipChange)
                                }
                                onMouseLeave={
                                    evt => this.debouncedOnMouseOverOrLeaveXAxisLabel(null, null, null, null, onAxisToolTipChange)
                                }
                                {...textProps}
                            >
                                {xTickFormatter(name, index, xBandwidth)}
                            </text>
                        )
                    })
                }
                {
                    xDomain.map(name => {
                        let x = xScale(name) + tickAlignment + domainAlignment
                        return (
                            <line className='tick-line' key={name} x1={x} y1={axisY} x2={x} y2={isTop ? axisY + tickSize : axisY - tickSize} stroke={styles.stroke} />
                        )
                    })
                }
            </g>
        )
    }

}

export class YAxis extends React.Component {
    static get propTypes() {
        return {
            ...axisCommonPropTypes,
            domainAlignment: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf(['start', 'middle', 'end'])]),
            orientation: PropTypes.oneOf(['right', 'left']),
            yAxisTick: axisTickPropType,
            yDomain: PropTypes.array
        }
    }

    static get defaultProps() {
        return {
            ...axisCommonDefaultProps,
            domainAlignment: 'start',
            orientation: 'left',
            yAxisTick: { rotate: 0, textAnchor: null, fontSize: '1rem' },
            yTickFormatter: (text, index) => text
        }
    }

    render() {
        let {
            yDomain,
            yBandwidth,
            height,
            hidePath,
            nice,
            tickSize,
            yAxisTick,
            yTickFormatter,
            yScale,
            domainAlignment = isScaleLinear(yScale) ? 'start' : 'middle',
            width,
            orientation,
            styles
        } = this.props
        let isLeft = orientation === 'left'
        let x = isLeft ? 0 : width, y = height

        styles = assignStyle(defaultStyles, styles)
        yDomain = nice(yDomain)
        domainAlignment = getAlignmentOffset(domainAlignment, yBandwidth)
        yAxisTick = Object.assign(yAxisTickDefaultProps, yAxisTick)

        return (
            <g className='ssd-chart-yAxis'>
                <Path hidePath={hidePath} orientation={orientation} width={width} height={height} styles={styles} />
                {
                    yDomain.map((value, index) => {
                        let y = yScale(value) + domainAlignment
                        let x = isLeft ? -10 : 10
                        let { textAnchor, rotate, ...textProps } = yAxisTick
                        return (
                            <text
                                className='tick-text'
                                key={index}
                                x={x}
                                y={y}
                                textAnchor={textAnchor || isLeft ? 'end' : 'start'}
                                transform={`rotate(${rotate},${x},${y})`}
                                {...textProps}
                            >
                                {yTickFormatter(value, index)}
                            </text>
                        )
                    })
                }
                {
                    yDomain.map(value => {
                        let y = yScale(value) + domainAlignment
                        return (
                            <line className='tick-line' key={value} x1={x} y1={y} x2={isLeft ? x + tickSize : x - tickSize} y2={y} stroke={styles.stroke} />
                        )
                    })
                }
            </g>
        )
    }
}

function getAlignmentOffset(alignment, bandwidth) {
    if (typeof alignment === 'string') {
        switch (alignment) {
            case 'start': return 0
            case 'middle': return bandwidth / 2
            case 'end': return bandwidth
            default: return 0
        }
    }

    if (typeof alignment === 'function') {
        return alignment(bandwidth)
    }
}

function onMouseOverOrLeaveXAxisLabel(evt, name, index, xBandWidth, onAxisToolTipChange) {
    if (evt) { // over
        let { target } = evt
        let { left, top, width } = target.getBoundingClientRect()
        let x = left + width / 2
        let y = top
        onAxisToolTipChange(name, index, xBandWidth, x, y)
    } else { // leave
        onAxisToolTipChange(null)
    }
}

function onAxisToolTipChange(text, index, xBandWidth, x, y) {
    if (!this.props.xToolTip) { return }
    if(text === null) {
        this.setState({
            axisToolTipProps: {
                show: false,
                content: null
            }
        })
    } else {
        let element = this.props.xToolTip(text, index, xBandWidth)
        this.setState({
            axisToolTipProps: {
                show: element ? true : false,
                content: element,
                x: x,
                y: y
            }
        })
    }
}
