import React from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal, scaleQuantile } from 'd3-scale'
import { Container, XAxis, YAxis, containerCommonPropTypes } from './common'
import { assignStyle, inject } from './common/util'
import { bindEvents } from './common/events'
import { ShareProps } from './common/propsHelper'
import { purpleShades, positiveNegativesColors, blueShades } from './common/color-palette'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import uniq from 'lodash/uniq'
import _max from 'lodash/max'
import _min from 'lodash/min'
import debounce from 'lodash/debounce'

const defaultStyles = {
    plaque: {
        size: 25,
        border: 1,
        borderColor: 'white'
    }
}

const toolTipStyles = {
    borderRadius: 0,
    color: 'black',
    boxShadow: 'none',
    padding: '8px 13px 7px',
    transform: `translate(-50%, -100%)`
}

const dataPropType = PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.number
}))

class Legend extends React.Component {
    static propTypes = {
        legendData: PropTypes.string,
        width: PropTypes.number,
        colorScale: PropTypes.func,
        height: PropTypes.number,
        styles: PropTypes.object,
        xDomain: PropTypes.array,
        yDomain: PropTypes.array
    }

    render() {
        let { xDomain, yDomain, colorScale, styles, width, height, legendData } = this.props
        let legendSize = 15
        let arr = colorScale.quantiles()
        let span = arr[1] - arr[0]
        let min = Math.min(...arr) - span
        let data = [min, ...arr]
        let xOffset = (width - Math.max(xDomain.length * styles.plaque.size, data.length * legendSize)) * -1
        let yOffset = (height - yDomain.length * styles.plaque.size) * -1

        return (
            <React.Fragment>
                {
                    data.reverse().map((d, i) =>
                        <rect
                            key={d}
                            x={width - legendSize * (i + 1) + xOffset}
                            y={height + yOffset + 20}
                            width={legendSize}
                            height={legendSize}
                            fill={colorScale(d)}
                            stroke={styles.plaque.borderColor}
                            strokeWidth={styles.plaque.border}
                        />
                    )
                }
                <text
                    className='legend-text'
                    x={width - legendSize * data.length + xOffset - 5}
                    y={height + yOffset + 20 + legendSize / 2}
                    textAnchor='end'
                    dy='.66ex'
                >
                    {legendData}
                </text>
            </React.Fragment>
        )
    }
}

class Plaque extends React.Component {
    static propTypes = {
        data: dataPropType,
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        colorScale: PropTypes.func,
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func,
        highlight: PropTypes.func,
        color: PropTypes.string,
        dataX: PropTypes.any,
        dataY: PropTypes.any,
        dataValue: PropTypes.number,
        opacity: PropTypes.number,
        styles: PropTypes.object
    }

    render() {
        let { data,
            events,
            xScale,
            yScale,
            colorScale,
            opacity,
            highlight,
            onMouseOver,
            onMouseOut,
            styles } = this.props,
            { size, border, borderColor } = styles.plaque

        return (
            <g onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
                {
                    data.map(
                        ({ x, y, value }, i) => {
                            let _events = bindEvents(events, { x, y, value }, i)
                            return (
                                <rect className='plaque' key={i} x={xScale(x)} y={yScale(y)}
                                    width={size}
                                    height={size}
                                    fill={colorScale(value)}
                                    opacity={highlight(x, y) ? 1 : opacity}
                                    stroke={borderColor}
                                    strokeWidth={border}
                                    {..._events}
                                />
                            )
                        }
                    )
                }
            </g>
        )
    }

}

export default class HeatMapChart extends React.Component {
    static defaultProps = {
        width: 800,
        height: 600,
        dataMapper: item => item
    }

    static propTypes = {
        ...containerCommonPropTypes,
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        data: dataPropType,
        tooltip: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = {
            plaqueOpacity: 1,
            toolTipX: -1,
            toolTipY: -1,
            selectedDataX: '',
            selectedDataY: '',
            showToolTip: false,
            toolTipContent: null
        }
        this.onMouseOverPlaque = this.onMouseOverPlaque.bind(this)
        this.onMouseOutPlaque = this.onMouseOutPlaque.bind(this)
        this.showOrHideToolTip = this.showOrHideToolTip.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    showOrHideToolTip(data, x, y, dataX, dataY, width, height, color) {
        if (!this.props.toolTip) { return }
        if (data === null) {
            this.setState({
                selectedDataX: '',
                selectedDataY: '',
                plaqueOpacity: 1,
                toolTipProps: {
                    show: false,
                    content: null
                }
            })
        } else {
            this.setState({
                selectedDataX: dataX,
                selectedDataY: dataY,
                plaqueOpacity: .8,
                toolTipProps: {
                    show: true,
                    content: this.props.toolTip(data),
                    x,
                    y,
                    width,
                    height,
                    color
                }
            })
        }
    }

    onMouseOverPlaque(evt, data) {
        if (!this.props.toolTip) { return }
        let target = evt.target
        let { top, left, width, height } = target.getBoundingClientRect()
        let color = target.getAttribute('fill')
        let x = left
        let y = top
        this.debouncedShowOrHideToolTip(data,
            x,
            y,
            data.x,
            data.y,
            width,
            height,
            color
        )
    }

    onMouseOutPlaque() {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    onMouseLeave() {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    render() {
        let { state, props } = this
        let { data,
            dataMapper,
            events: _events,
            styles: propStyles,
            legendData,
            purple,
            blue,
            toolTip,
            xToolTip,
            ...restProps } = props
        let {
            toolTipProps,
            plaqueOpacity,
            selectedDataX,
            selectedDataY,
            axisToolTipProps } = state
        let highlight = (x, y) => x == selectedDataX && y == selectedDataY
        let styles = assignStyle(defaultStyles, propStyles)

        data = data.map(dataMapper)

        let xScale = scaleOrdinal()
        let xDomain = uniq(data.map(d => d.x))
        let xRange = xDomain.map((d, i) => i * styles.plaque.size)

        let yScale = scaleOrdinal()
        let yDomain = uniq(data.map(d => d.y))
        let yRange = yDomain.map((d, i) => i * styles.plaque.size)

        let values = data.map(d => d.value)
        let min = _min(values)
        let max = _max(values)
        let colors = purple && purpleShades || blue && blueShades || positiveNegativesColors
        let colorScale = scaleQuantile().domain([min, max]).range(colors)
        let events = inject(_events, ['onMouseOver', 'onMouseOut'], [this.onMouseOverPlaque, this.onMouseOutPlaque])
        let moveToCenter = yBandwidth => yBandwidth / 2

        return (
            <Container {...this.props}
                onMouseOut={this.onMouseOutPlaque}
                onMouseLeave={this.onMouseLeave}>
                <ShareProps
                    data={data}
                    xScale={xScale}
                    xDomain={xDomain}
                    xBandwidth={styles.plaque.size}
                    xRange={xRange}

                    yScale={yScale}
                    yDomain={yDomain}
                    yBandwidth={styles.plaque.size}
                    yRange={yRange}

                    colorScale={colorScale}
                    {...restProps}
                >
                    <Plaque
                        opacity={plaqueOpacity}
                        highlight={highlight}
                        styles={styles}
                        events={events}
                    />
                    <Legend styles={styles} legendData={legendData} />
                    <XAxis orientation='top' domainAlignment='middle' hidePath onAxisToolTipChange={this.onAxisToolTipChange}/>
                    <YAxis orientation='left' domainAlignment={moveToCenter} hidePath />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='heatmap-tooltip'
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


