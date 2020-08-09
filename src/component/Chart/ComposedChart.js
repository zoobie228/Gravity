import React from 'react'
import PropTypes from 'prop-types'
import { scaleLinear, scaleBand } from 'd3-scale'
import { autoRange, Grids, XAxis, YAxis, Container, Legend, containerCommonPropTypes } from './common'
import { Bar } from './common/bar'
import { Line } from './common/line'
import { Dot } from './common/dot'
import { Bubble } from './common/bubble'
import { distinct } from './common/util'
import { ShareProps } from './common/propsHelper'
import { Square, CircleUponLine } from './common/legend-decorator'
import flatten from 'lodash/flatten'

export default class ComposedChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes
    }

    static defaultProps = {
        width: 500,
        height: 500
    }

    get data() {
        let { children } = this.props
        let dataSet = React.Children.toArray(children).map(c => {
            let { data } = c.props
            return data || []
        })
        return flatten(dataSet)
    }

    get scales() {
        let xScale
        let yScale
        let { children } = this.props
        React.Children.toArray(children).forEach(c => {
            xScale = c.props.xScale || xScale
            yScale = c.props.yScale || yScale
        })

        return {
            xScale: xScale || scaleBand(),
            yScale: yScale || scaleLinear()
        }
    }

    render() {
        let {
            xDomain,
            yDomain,
            children,
            ...restProps } = this.props

        let { xScale, yScale } = this.scales
        let data = this.data

        return (
            <Container {...this.props}>
                <ShareProps
                    xScale={xScale}
                    xDomain={xDomain || distinct(data, 'name')}
                    yScale={yScale}
                    yDomain={yDomain || autoRange(distinct(data, 'value'))}
                    {...restProps}
                >
                    {
                        children
                    }
                </ShareProps>
            </Container>
        )
    }
}

ComposedChart.Bar = clone(Bar)
ComposedChart.Dot = clone(Dot)
ComposedChart.Grids = clone(Grids)
ComposedChart.Line = clone(Line)
ComposedChart.Bubble = clone(Bubble)
ComposedChart.XAxis = clone(XAxis)
ComposedChart.YAxis = clone(YAxis)
ComposedChart.Legend = clone(Legend)
ComposedChart.Legend.Square = clone(Square)
ComposedChart.Legend.CircleUponLine = clone(CircleUponLine)

/**
* clone to prevent original component being mutated
*/
function clone(C) {
    return class ChartElement extends React.Component {
        static defaultProps = C.defaultProps
        render() {
            return <C {...this.props}/>
        }
    }
}