import React from 'react';
import PropTypes from 'prop-types'
import { Container, containerCommonPropTypes } from '../common'
import { Label } from '../common/label'
import { colorWithMeaningPalette } from '../common/color-palette'

const PartArrow = ({ x1: _x1, x2: _x2, y1: _y1, y2: _y2, width: chartWidth, height: chartHeight, stroke: stroke, ...restProps }) => {
    let x1 = _x1(chartWidth, chartHeight)
    let x2 = _x2(chartWidth, chartHeight)
    let y1 = _y1(chartWidth, chartHeight)
    let y2 = _y2(chartWidth, chartHeight)

    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={'2'} stroke={stroke} strokeLinecap={'round'} {...restProps}/>
    )
}

export default class Arrow extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        increase: PropTypes.number,
        ...containerCommonPropTypes
    }

    static defaultProps = {
        padding: 0
    }

    render() {
        let {label,
            secondaryLabel} = this.props
        let labelSpace = 25
        let increase = this.props.increase >= 0 ? true : false
      

        return (
            <Container {...this.props} >
                <Label
                    key={1}
                    className='kpi-label'
                    x={width => width / 2 - labelSpace}
                    y={(width, height) => height / 2 - 10}
                    dy={'.66ex'}
                    textAnchor="start"
                    fill={colorWithMeaningPalette.ELI}
                    fontSize={48}
                    fontWeight={500}
                >
                    {label}
                </Label>
                <Label
                    key={0}
                    className='kpi-label'
                    x={width => width / 2 - 20}
                    y={(width, height) => height / 2 + labelSpace}
                    dy={'.66ex'}
                    textAnchor="start"
                    fill={colorWithMeaningPalette.ELI}
                    fontSize={16}
                >
                    {secondaryLabel}
                </Label>
                <PartArrow 
                    key={4}
                    x1={width => width / 2 - 45} 
                    y1={increase ? (width, height) => height / 2 - 26 : (width, height) => height / 2 + 6}
                    x2={width => width / 2 - 33}
                    y2={increase ? (width, height) => height / 2 - 14 : (width, height) => height / 2 - 6} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                <PartArrow 
                    key={5}
                    x1={width => width / 2 - 45} 
                    y1={increase ? (width, height) => height / 2 - 26 : (width, height) => height / 2 + 6}
                    x2={width => width / 2 - 57}
                    y2={increase ? (width, height) => height / 2 - 14 : (width, height) => height / 2 - 6} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />
                <PartArrow 
                    key={6}
                    x1={width => width / 2 - 45} 
                    y1={(width, height) => height / 2 + 6}
                    x2={width => width / 2 - 45}
                    y2={(width, height) => height / 2 - 26} 
                    stroke={increase ? colorWithMeaningPalette.MAX : colorWithMeaningPalette.KAI}
                />

            </Container>
        )
    }
}