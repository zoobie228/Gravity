import React from 'react'
import PropTypes from 'prop-types'
import { scaleLinear } from 'd3-scale'
import { autoRange, Bubble, Grids, XAxis, YAxis, Container, Legend, containerCommonPropTypes, assignStyle } from './common'
import { distinct, inject } from './common/util'
import { ShareProps } from './common/propsHelper'
import { dataVizColorPalette } from './common/color-palette'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const colors = [
    dataVizColorPalette[4], 
    dataVizColorPalette[7], 
    dataVizColorPalette[1], 
    dataVizColorPalette[10]
]

const defaultStyles = {
    legend: {
        colors: colors
    },
    bubble: {
        color: colors[0],
        opacity: 0.5
    }
}

export default class BubbleChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.number,
            radius: PropTypes.number // 0 - 1
        })),
        xGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        yGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        showValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendArrangement: PropTypes.string,
        styles: PropTypes.object
    }

    static defaultProps = {
        width: 500,
        height: 500
    }

    constructor(props) {
        super(props)
        this.state = {}
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

    onMouseOverDot = (evt, data) => {
        let target = evt.target
        let color = target.getAttribute('fill')
        let { top, left, width, height } = target.getBoundingClientRect()
        this.debouncedShowOrHideToolTip(
            data,
            left,
            top,
            width,
            height,
            color
        )
    }

    onMouseLeaveChart = () => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    render() {
        let { toolTipProps, axisToolTipProps } = this.state
        let {
            data,
            dataMapper,
            events,
            range,
            styles: _styles,
            legendData,
            legendArrangement,
            legendX,
            legendY,
            xDomain,
            yDomain,
            xGrid = true,
            yGrid = true,
            toolTip,
            xToolTip,
            ...restProps } = this.props
        let styles = assignStyle(defaultStyles, _styles)
        let userEvents = inject(events,
            ['onMouseOver'],
            [this.onMouseOverDot]
        )

        return (
            <Container {...this.props} onMouseLeave={this.onMouseLeaveChart}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={scaleLinear()}
                    xDomain={xDomain || (data => distinct(data, 'name'))}
                    yScale={scaleLinear()}
                    yDomain={yDomain || (data => autoRange(data.map(d => d.value)))}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    <Bubble
                        styles={styles.bubble}
                        events={userEvents}
                    />
                    <Legend
                        legendData={legendData}
                        legendArrangement={legendArrangement}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                    />
                    <XAxis domainAlignment='start' onAxisToolTipChange={this.onAxisToolTipChange}/>
                    <YAxis />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='bubble-tooltip'
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
