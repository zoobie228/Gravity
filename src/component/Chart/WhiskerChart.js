import React from 'react'
import PropTypes from 'prop-types'
import { scaleLinear, scaleBand } from 'd3-scale'
import { autoRange, XAxis, YAxis, Container, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import { bindEvents } from './common/events'
import { isNumberOrNumberString, inject, getXDomain } from './common/util'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { ShareProps } from './common/propsHelper'
import { Grids } from './common/grids'
import { Legend } from './common/legend'
import { dataVizColorPalette as colorPalette } from './common/color-palette'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const dataPropType = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    min: PropTypes.any,
    max: PropTypes.any,
    target: PropTypes.any,
    actual: PropTypes.any
}))

const defaultStyles = {
    whisker: {
        range: {
            length: 15,
            stroke: '#727272',
            strokeWidth: 0.5,
            strokeWidthII: 1
        },
        rect: {
            length: 10,
            fill: colorPalette[7]
        },
        circle: {
            r: 5,
            fill: colorPalette[4]
        }
    },
    legend: {
        width: 10,
        height: 10,
        colors: [colorPalette[4], colorPalette[7]]
    }
}

class Range extends React.Component {
    static propTypes = {
        x: PropTypes.number,
        yMin: PropTypes.number,
        yMax: PropTypes.number,
        styles: PropTypes.object
    }

    render() {
        let { x, yMin, yMax, styles } = this.props
        let halfLen = styles.range.length / 2
        return (
            <React.Fragment>
                {/* top short line */}
                <line stroke={styles.range.stroke} x1={x - halfLen} y1={yMax} x2={x + halfLen} y2={yMax} strokeWidth={styles.range.strokeWidthII} />
                {/* center line */}
                <line stroke={styles.range.stroke} x1={x} y1={yMax} x2={x} y2={yMin} strokeWidth={styles.range.strokeWidth} />
                {/* bottom short line */}
                <line stroke={styles.range.stroke} x1={x - halfLen} y1={yMin} x2={x + halfLen} y2={yMin} strokeWidth={styles.range.strokeWidthII} />
            </React.Fragment>
        )
    }
}

class Target extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        color: PropTypes.string,
        decorator: PropTypes.bool
    }

    render() {
        let { decorator, x, y, width, height, color, events, hover, className, ...restProps } = this.props
        width -= 1
        height -= 1
        let halfWidth = width / 2
        let halfHeight = height / 2
        let xOffset = decorator ? halfWidth : 0
        let yOffset = decorator ? halfHeight : 0

        return (
            <rect
                className='target'
                width={width}
                height={height}
                x={x + xOffset}
                y={y + yOffset}
                fill={color}
                transform={`translate(${-halfWidth},${-halfWidth}) rotate(45,${x + xOffset + halfWidth},${y + yOffset + halfWidth})`}
                {...restProps}
            />
        )
    }
}

class Actual extends React.Component {
    static propTypes = {
        decorator: PropTypes.bool,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        color: PropTypes.string
    }

    render() {
        let { decorator, x, y, width, height, color, events, hover, className, ...restProps } = this.props
        let halfWidth = width / 2
        let halfHeight = height / 2
        let xOffset = decorator ? halfWidth : 0
        let yOffset = decorator ? halfHeight : 0
        return (
            <circle
                className='actual'
                r={halfWidth}
                cx={x + xOffset}
                cy={y + yOffset}
                fill={color}
                {...restProps}
            />
        )
    }
}

class EventArea extends React.Component {
    static propTypes = {
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number
    }

    render() {
        let { x, y, width, height, ...restProps } = this.props
        return (
            <rect className='event-area' x={x} y={y} width={width} height={height} fill="transparent" {...restProps} />
        )
    }
}

class Whisker extends React.Component {
    static propTypes = {
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        data: dataPropType,
        events: PropTypes.object,
        height: PropTypes.number,
        xBandwidth: PropTypes.number,
        styles: PropTypes.object
    }

    render() {
        let { data, events, height, xScale, yScale, xBandwidth, styles } = this.props
        let xOffset = xBandwidth / 2
        return data.map(
            ({ name, min, max, target, actual }, index) => {
                let targetEvents = bindEvents(events, { name, min, max, target }, index)
                let actualEvents = bindEvents(events, { name, min, max, actual }, index)
                return (
                    <React.Fragment key={name}>
                        {
                            isNumberOrNumberString(min) && isNumberOrNumberString(max) &&
                            <Range yMin={yScale(min)} yMax={yScale(max)} x={xScale(name) + xOffset} styles={styles} />
                        }
                        {
                            isNumberOrNumberString(target) &&
                            <Target
                                x={xScale(name) + xOffset}
                                y={yScale(target)}
                                width={styles.rect.length}
                                height={styles.rect.length}
                                color={styles.rect.fill}
                                {...targetEvents}
                            />
                        }
                        {
                            isNumberOrNumberString(actual) &&
                            <Actual
                                x={xScale(name) + xOffset}
                                y={yScale(actual)}
                                width={styles.circle.r * 2}
                                height={styles.circle.r * 2}
                                color={styles.circle.fill}
                                {...actualEvents}
                            />
                        }
                        {/* <EventArea
                            x={xScale(name)}
                            y={0}
                            width={xBandwidth}
                            height={height}
                           
                        /> */}
                    </React.Fragment>
                )
            })
    }
}

export default class WhiskerChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        events: PropTypes.object,
        range: PropTypes.arrayOf(PropTypes.number),
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.number,
        legendY: PropTypes.number,
        data: dataPropType,
        dataMapper: PropTypes.func,
        styles: PropTypes.object
    }

    static defaultProps = {
        width: 500,
        height: 500,
        paddingRight: 100
    }

    constructor(props) {
        super(props)
        this.state = {
            showToolTip: false,
            toolTipContent: null,
            toolTipX: -1,
            toolTipY: -1
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    showOrHideToolTip = (data, x, y, width, height, color) => {
        if (!this.props.toolTip) { return }
        this.setState({
            toolTipProps: {
                show: data ? true : false,
                content: data ? this.props.toolTip(data) : null,
                x,
                y,
                width,
                height,
                color
            }
        })
    }

    onMouseOverEventArea = (evt, data) => {
        const { target } = evt
        const { top, left, width, height } = target.getBoundingClientRect()
        const color = evt.target.getAttribute('fill')
        const r = evt.target.getAttribute('r') / 1
        const x = left
        const y = top

        this.debouncedShowOrHideToolTip(
            data,
            x,
            y,
            width,
            height,
            color
        )
    }

    onMouseOutLeaveEventArea = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    render() {
        let { state, props } = this
        let { containerProps, ...whiskerProps } = extractContainerCommonProps(props)
        let { data,
            dataMapper = d => d,
            events,
            range,
            styles: propStyles,
            legendData = ['Actual', 'Target'],
            legendArrangement,
            legendX,
            legendY,
            xDomain = getXDomain,
            yDomain = range || (data => autoRange(data.map(d => Math.max(d.min || 0, d.max || 0, d.actual || 0, d.target || 0)))),
            xGrid = true,
            yGrid = false,
            toolTip,
            xToolTip,
            ...restProps } = whiskerProps
        let { toolTipProps, axisToolTipProps } = state
        let styles = assignStyle(defaultStyles, propStyles)
        let userEvents = inject(events, 
            ['onMouseOver','onMouseLeave'],
            [this.onMouseOverEventArea, this.onMouseOutLeaveEventArea]
        )

        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={scaleBand()}
                    xDomain={xDomain}
                    yScale={scaleLinear()}
                    yDomain={yDomain}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    <Whisker styles={styles.whisker} events={userEvents} />
                    <Legend
                        legendData={legendData}
                        legendArrangement={legendArrangement}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                        decoratorComponent={[Actual, Target]}
                    />
                    <XAxis domainAlignment='middle' tickAlignment='middle' onAxisToolTipChange={this.onAxisToolTipChange}/>
                    <YAxis />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        {...toolTipProps}
                    />
                }
                {
                    xToolTip &&
                    <ToolTip
                        className='axis-tooltip'
                        {...axisToolTipProps}
                    />
                }
            </Container>
        )
    }
}
