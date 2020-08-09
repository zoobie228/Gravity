import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, XAxis, YAxis, Container, Legend, GroupLine, containerCommonPropTypes, extractContainerCommonProps, assignStyle, Slider, Position } from './common'
import uniq from 'lodash/uniq'
import { ShareProps } from './common/propsHelper'

const colors = [
    '#9F3AB7', '#F8984C', '#F56D00',
    '#D4A6DE', '#BB75CC', '#9F3AB7',
    '#B9E8F5', '#92DBEF', '#64CCE9',
    '#A39491', '#6F5953', '#000000'
]

const defaultStyles = {
    groupLine: {
        line: {
            strokeWidth: 2
        },
        colors: colors
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    },
    axis: {
        stroke: 'black'
    }
}

export default class LineSliderChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        range: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.number,
        legendY: PropTypes.number,
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 800,
        height: 600,
        dataMapper: item => item
    }

    constructor(props) {
        super(props)
        this.state = {
            data: props.data,
            min: 0,
            max: props.data.length
        }
        this.slide = this.slide.bind(this)
        this.xTickFormatter = this.xTickFormatter.bind(this)
        this.getDivisor = this.getDivisor.bind(this)
    }

    slide(values) {
        let original = this.props.data, min = values[0], max = values[1] || original.length
        let data = original.slice(min, max)

        if(this.state.data.length != data.length && data.length > 0) {
            this.setState({data, min, max})
        }
    }

    xTickFormatter(tickText, index) {
        let divisor = this.getDivisor(this.state.data)
        let originalIndex = index + this.state.min

        if(originalIndex % divisor === 0 ){
            return tickText
        }
        else {
            return ''
        }
    }

    getDivisor(array) {
        this.getDivisor.queue = this.getDivisor.queue || [0]

        let divisorQueue = this.getDivisor.queue
    
        let divisor = 1, arrLen = array.length, maxTicks = 10
        
        while(arrLen / divisor > maxTicks) {
            divisor++
        }
    
        const divisorLen = divisorQueue.length
        const lastDivisor = divisorQueue[divisorLen - 1]

        if((divisor < lastDivisor || lastDivisor === 0) && lastDivisor % divisor === 0) {
            divisorQueue.push(divisor)
        }
        else if(divisor > lastDivisor ) {
            divisorQueue.pop()
        }
    
        const newDivisorLen = divisorQueue.length
        const newLastDivisor = divisorQueue[newDivisorLen - 1]
    
        return newLastDivisor
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data:originalData, dataMapper, range, styles, legendData, legendX, legendY, width, height, padding, ...restProps } = props, state = this.state
        let data = state.data.map(dataMapper)

        styles = assignStyle(defaultStyles, styles)

        const count = originalData.length

        const yDomain = range || autoRange(originalData.map(d => d.value))

        return (
            <Container {...containerProps}>
                <Position x={0} y={0} heightPercentage={0.8}>
                    <ShareProps
                        data={data}
                        xScale={scaleBand()}
                        xDomain={data => uniq(data.map(d => d.name))}
                        yScale={scaleLinear()}
                        yDomain={yDomain}
                        {...restProps}
                    >
                        <GroupLine styles={styles.groupLine} />
                        <Legend legendData={legendData} x={isFinite(legendX) ? legendX : (width, height) => width + 10} y={isFinite(legendY) ? legendY : 0} styles={styles.legend} />
                        <XAxis tickSize={0} domainAlignment='middle' styles={styles.axis} xTickFormatter={this.xTickFormatter} />
                        <YAxis tickSize={0} styles={styles.axis} />
                    </ShareProps>
                </Position>
                <Position x={0} y={(width, height) => height * 0.8 + 50}>
                    <Slider values={[0, count]} min={0} max={count} slide={this.slide} />
                </Position>
            </Container>
        )
    }
}



