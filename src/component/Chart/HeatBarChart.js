import React from 'react'
import PropTypes from 'prop-types'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { select } from 'd3-selection'
import {colorWithMeaningPalette} from './common/color-palette'
import { Container, XAxis, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import { bindEvents } from './common/events'
import { ShareProps } from './common/propsHelper'

const defaultStyles = {
    bar: {
        height: 40,
        fill: colorWithMeaningPalette.KIT,
        marginBottom: 10
    },
    pointer: {
        size: 12,
        marginBottom: 7
    },
    axis: {
        stroke: 'black'
    },
    legend: {
        marginBottom: 37
    }
}

class Bar extends React.Component {
    static get propTypes() {
        return {
            yScale: PropTypes.func,
            width: PropTypes.number,
            styles: PropTypes.object
        }
    }

    render() {
        let { width, styles: { bar }, yScale } = this.props

        return (<rect y={`${yScale(50) - bar.height - bar.marginBottom}`} width={width} height={bar.height} fill={bar.fill} />)
    }
}

class Pointer extends React.Component {
    static get propTypes() {
        return {
            events: PropTypes.object,
            yScale: PropTypes.func,
            value: PropTypes.number,
            xScale: PropTypes.func,
            styles: PropTypes.object
        }
    }

    render() {
        let { events, xScale, yScale, value, styles, ...restProps } = this.props, node = select(this.nodeRef)
        let size = styles.pointer.size, half = size / 2
        let y = yScale(50) - styles.bar.height - styles.bar.marginBottom - styles.pointer.marginBottom

        let _events = bindEvents(events, value)
        return (
            <polygon
                className='pointer'
                points={`0,0 -${half},-${size} ${half},-${size}`}
                transform={`translate(${xScale(value)},${y})`}
                {..._events}
            />
        )
    }
}

class Legend extends React.Component {
    static get propTypes() {
        return {
            yScale: PropTypes.func,
            legendData: PropTypes.string,
            legendX: PropTypes.number,
            legendY: PropTypes.number,
            value: PropTypes.number,
            styles: PropTypes.object,
            valueFormatter: PropTypes.func
        }
    }

    constructor(props) {
        super(props)
        this.nodeRef = null
    }

    componentDidMount() {
        this.renderLegend()
    }

    componentDidUpdate() {
        this.renderLegend()
    }

    renderLegend() {
        if (!this.props.legendData) return

        let { yScale, legendData, legendX, legendY, value, valueFormatter, styles: { bar, pointer, legend } } = this.props, node = select(this.nodeRef)

        let x = isFinite(legendX) ? legendX : 0
        let y = isFinite(legendY) ? legendY : yScale(50) - bar.height - bar.marginBottom - pointer.marginBottom - legend.marginBottom


        node.selectAll('.legend').remove()
        node.selectAll('.legend')
            .data([{ legendData }])
            .enter()
            .append('text')
            .attr('class', 'legend')
            .attr('transform', `translate(${x},${y})`)
            .text(d => `${d.legendData}: ${valueFormatter(value)}`)

    }

    render() {
        return (<g ref={ref => this.nodeRef = ref} />)
    }
}

export default class HeatBarChart extends React.Component {
    static get defaultProps() {
        return {
            width: 500,
            height: 500,
            valueFormatter: value => value
        }
    }

    static get propTypes() {
        return {
            ...containerCommonPropTypes,
            events: PropTypes.object,
            range: PropTypes.array.isRequired,
            value: PropTypes.number.isRequired,
            legendData: PropTypes.string,
            legendX: PropTypes.number,
            legendY: PropTypes.number,
            styles: PropTypes.object,
            valueFormatter: PropTypes.func
        }
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { events, value, valueFormatter, innerRadius, range, styles, legendData, legendX, legendY, ...restProps } = props

        styles = assignStyle(defaultStyles, styles)

        return (
            <Container {...containerProps}>
                <ShareProps
                    xScale={scaleOrdinal()}
                    xDomain={range}
                    xRange={(xBandwidth, xTicks, width) => xTicks.map((tick, i) => i * width / (xTicks.length - 1))}
                    yScale={scaleLinear()}
                    yDomain={[0, 100]}
                    {...restProps}
                >
                    <Bar styles={styles} />
                    <Pointer value={value} styles={styles} events={events} />
                    <Legend legendData={legendData} legendX={legendX} legendY={legendY} value={value} valueFormatter={valueFormatter} styles={styles} />
                    <XAxis tickSize={0} yOffset={(width, height) => height / 2 * -1} styles={styles.axis} />
                </ShareProps>
            </Container>
        )
    }
}