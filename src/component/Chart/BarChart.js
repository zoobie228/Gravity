import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { Bar, XAxis, YAxis, Container, containerCommonPropTypes, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import { Text } from './common/text'
import { Grids } from './common/grids'
import { getXDomain, getYDomain, inject } from './common/util'
import { ToolTip, AutoTooltip } from './common/tooltip'
import debounce from 'lodash/debounce'

const defaultStyles = {
    bar: {}
}

export default class BarChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        range: PropTypes.array,
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        showValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        toolTip: PropTypes.func,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string,
        hideXAxis: PropTypes.bool,
        hideYAxis: PropTypes.bool,
        hideAxisPath: PropTypes.bool,
        pivot: PropTypes.bool
    }

    static defaultProps = {
        width: 500,
        height: 500
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedIndices: this.initialSelectedIndices,
            toolTipX: -1,
            toolTipY: -1,
            showToolTip: false,
            toolTipContent: null
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get initialSelectedIndices() {
        return this.props.data.map(i => true)
    }

    get selectedIndices() {
        return this.props.selectedIndices || this.state.selectedIndices
    }

    onMouseOverBar = (evt, data, index) => {
        const className = evt.target.getAttribute('class')
        if (className == 'bar' && this.props.toolTip) {
            let { top, left, width, height } = evt.target.getBoundingClientRect()
            let color = evt.target.getAttribute('fill')
            let x = left
            let y = top
            this.debouncedShowOrHideToolTip(
                data,
                x,
                y,
                width,
                height,
                color
            )
        }
        this.setState({ hoverIndex: index })
    }

    onMouseLeaveBar = () => {
        this.setState({ hoverIndex: null })
    }

    onMouseLeaveChart = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    showOrHideToolTip = (data, x, y, width, height, color) => {
        if (!this.props.toolTip) { return }
        this.setState({
            tooltipProps: {
                show: data? true : false,
                content: data ? this.props.toolTip(data) : null,
                x,
                y,
                width,
                height,
                color,
                prefer: this.props.pivot ? AutoTooltip.preferRight : AutoTooltip.preferTop
            }
        })
    }

    render() {
        let {
            hoverIndex,
            tooltipProps,
            axisToolTipProps
        } = this.state
        let {
            data = [],
            dataMapper = d => d,
            events,
            range,
            showValue = false,
            styles,
            hideYAxis = false,
            hideXAxis = false,
            hideAxisPath = false,
            xDomain,
            yDomain = range || getYDomain,
            pivot = false,
            xGrid = false,
            yGrid = false,
            toolTip,
            xToolTip,
            ...restProps } = this.props
        let moveBarToCenter = (bandwidth, barWidth) => (bandwidth - barWidth) / 2
        let moveTextToCenter = bandwidth => bandwidth / 2
        let maxBarWidth = (bandwidth, barWidth) => bandwidth * 0.7
        styles = assignStyle(defaultStyles, styles)

        let userEvents = inject(events,
            ['onMouseOver', 'onMouseLeave'],
            [this.onMouseOverBar, this.onMouseLeaveBar]
        )

        return (
            <Container {...this.props} onMouseLeave={this.onMouseLeaveChart}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={pivot ? scaleLinear() : scaleBand()}
                    xDomain={pivot ? yDomain : getXDomain}
                    yScale={pivot ? scaleBand() : scaleLinear()}
                    yDomain={pivot ? getXDomain : yDomain}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    <Bar
                        xOffset={pivot ? 0 : moveBarToCenter}
                        yOffset={pivot ? moveBarToCenter : 0}
                        styles={styles.bar}
                        events={userEvents}
                        pivot={pivot}
                        hoverIndex={hoverIndex}
                        maxBarWidth={maxBarWidth}
                        selectedIndices={this.selectedIndices}
                    />
                    <Text
                        xOffset={pivot ? 10 : moveTextToCenter}
                        yOffset={pivot ? moveTextToCenter : -10}
                        showValue={showValue}
                        pivot={pivot}
                        styles={{
                            textAnchor: pivot ? 'start' : 'middle',
                            width: styles.bar.width,
                            dy: pivot ? '.66ex' : 0
                        }}
                    />
                    {
                        !hideXAxis &&
                        <XAxis
                            domainAlignment={pivot ? 'start' : 'middle'}
                            hidePath={hideAxisPath}
                            onAxisToolTipChange={this.onAxisToolTipChange}
                        />
                    }

                    {
                        !hideYAxis &&
                        <YAxis
                            domainAlignment={pivot ? 'middle' : 'start'}
                            hidePath={hideAxisPath}
                        />
                    }
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='bar-tooltip'
                        {...tooltipProps}
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
