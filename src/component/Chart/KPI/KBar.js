import React from 'react';
import PropTypes from 'prop-types'
import { Container, containerCommonPropTypes } from '../common'
import { Label } from '../common/label'
import { assignStyle } from '../common/util'
import { colorWithMeaningPalette } from '../common/color-palette'

const Rect = ({ x: _x, y: _y, w: _width, h: _height, width: chartWidth, height: chartHeight, ...restProps }) => {
    let x = _x(chartWidth, chartHeight)
    let y = _y(chartWidth, chartHeight)
    let width = _width(chartWidth, chartHeight)
    let height = _height(chartWidth, chartHeight)

    return (
        <rect x={x} y={y} width={width} height={height} {...restProps} />
    )
}



const PartArrow = ({ x1: _x1, x2: _x2, y1: _y1, y2: _y2, width: chartWidth, height: chartHeight, stroke: stroke, ...restProps }) => {
    let x1 = _x1(chartWidth, chartHeight)
    let x2 = _x2(chartWidth, chartHeight)
    let y1 = _y1(chartWidth, chartHeight)
    let y2 = _y2(chartWidth, chartHeight)

    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={'1'} stroke={stroke} strokeLinecap={'round'} {...restProps}/>
    )
}

const defaultStyles = {
    bar : {
        height: 20,
        fill: colorWithMeaningPalette.KAI
    }
}

export default class Bar extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        increase: PropTypes.number,
        ...containerCommonPropTypes
    }

    static defaultProps = {
        padding: 0
    }

    render() {
        let { percentage = 0,
        styles: _styles,
        label,
        secondaryLabel } = this.props
        let styles = assignStyle(defaultStyles, _styles)
        let { bar = {} } = styles
        let gap = 2
        let labelSpace = 45
        let barSpace = 30
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
                <Rect
                    key={2}
                    className='kpi-bar'
                    x={width => barSpace / 2}
                    y={(width, height) => height / 2 + 40}
                    w={(width, height) => (width - barSpace) * percentage}
                    h={(width, height) => bar.height}
                    fill={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                <Rect
                    key={3}
                    className='kpi-bar-background'
                    x={width => (width - barSpace) * percentage + gap + barSpace / 2 }
                    y={(width, height) => height / 2 + 40}
                    w={(width, height) => (width - barSpace) * (1 - percentage)}
                    h={(width, height) => bar.height}
                    fill={colorWithMeaningPalette.KIT}
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
