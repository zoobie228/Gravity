import React from 'react';
import PropTypes from 'prop-types'
import { Container, containerCommonPropTypes } from '../common'
import { Label } from '../common/label'
import { colorWithMeaningPalette } from '../common/color-palette'
import { line } from 'd3-shape'
import { scaleBand, scaleLinear } from 'd3-scale'
import { getXDomain, getYDomain } from '../common/util'

const PartArrow = ({ x1: _x1, x2: _x2, y1: _y1, y2: _y2, width: chartWidth, height: chartHeight, stroke: stroke, ...restProps }) => {
    let x1 = _x1(chartWidth, chartHeight)
    let x2 = _x2(chartWidth, chartHeight)
    let y1 = _y1(chartWidth, chartHeight)
    let y2 = _y2(chartWidth, chartHeight)

    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={'1'} stroke={stroke} strokeLinecap={'round'} {...restProps}/>
    )
}

class Line extends React.Component {
    render() {
        let { data, w, h, x: _x, y: _y, width: chartWidth, height: chartHeight } = this.props
        let xScale = scaleBand()
        let yScale = scaleLinear()
        let x = _x(chartWidth, chartHeight)
        let y = _y(chartWidth, chartHeight)
        let width = w(chartWidth, chartHeight)
        let height = h(chartWidth, chartHeight)

        let xDomain = getXDomain(data)
        let yDomain = getYDomain(data)
        let xOffset = width / xDomain.length / 2

        xScale.domain(xDomain)
        xScale.range([0, width])
        yScale.domain(yDomain)
        yScale.range([height, 0])

        let _line = line()
            .x(i => xScale(i.name) + xOffset)
            .y(i => yScale(i.value))
        let d = _line(data)

        return (
            <g transform={`translate(${x}, ${y})`}>
                <path
                    className='line'
                    d={d}
                    fill={'none'}
                    stroke={this.props.stroke}
                    strokeWidth={2}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                    pointerEvents="none"
                />
            </g>
        )
    }
}

export default class KLine extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        ...containerCommonPropTypes
    }

    static defaultProps = {
        padding: 0
    }

    render() {
        let { data,
            label,
            secondaryLabel } = this.props
        let labelSpace = 45
        let increase = this.props.increase >= 0 ? true : false

        return (
            <Container {...this.props} >
                <Label
                    key={0}
                    className='kpi-label'
                    x={width => width / 2 + 4}
                    y={(width, height) => height / 2 - 10}
                    dy={'.66ex'}
                    textAnchor="end"
                    fill={colorWithMeaningPalette.ELI}
                    fontSize={48}
                    fontWeight={500}
                >
                    {label}
                </Label>
                <Label
                    key={1}
                    className='kpi-label'
                    x={width => width / 2 + labelSpace}
                    y={(width, height) => height / 2 - 10}
                    dy={'.66ex'}
                    textAnchor="start"
                    fill={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                    fontSize={16}
                >
                    {secondaryLabel}
                </Label>
                <Line
                    data={data}
                    x={width => 0}
                    y={(width, height) => height / 2 + 30}
                    w={(width, height) => width}
                    h={(width, height) => 40}
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                <PartArrow 
                    key={4}
                    x1={width => width / 2 + 37} 
                    y1={increase ? (width, height) => height / 2 - 15 : (width, height) => height / 2 - 5}
                    x2={width => width / 2 + 33}
                    y2={increase ? (width, height) => height / 2 - 11 : (width, height) => height / 2 - 9} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                <PartArrow 
                    key={5}
                    x1={width => width / 2 + 37} 
                    y1={increase ? (width, height) => height / 2 - 15 : (width, height) => height / 2 - 5}
                    x2={width => width / 2 + 41}
                    y2={increase ? (width, height) => height / 2 - 11 : (width, height) => height / 2 - 9} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                 <PartArrow 
                    key={6}
                    x1={width => width / 2 + 37} 
                    y1={(width, height) => height / 2 - 5}
                    x2={width => width / 2 + 37}
                    y2={(width, height) => height / 2 - 15} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
            </Container>
        )
    }
}
