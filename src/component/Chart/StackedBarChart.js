
import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { XAxis, YAxis, Container, Legend, Grids, StackedBar, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import { getYDomain, getXDomain, inject, updateSelectedIndices, getDOMEvents } from './common/util'
import { dataVizColorPalette as colorPalette } from './common/color-palette'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const colors = [
    colorPalette[3],
    colorPalette[4],
    colorPalette[5],
    colorPalette[6],
    colorPalette[7],
    colorPalette[8],
    colorPalette[0],
    colorPalette[1],
    colorPalette[2],
    colorPalette[9],
    colorPalette[10],
    colorPalette[11]
]

const defaultStyles = {
    stackedBar: {
        cap: {
            height: 2
        },
        colors: colors
    },
    legend: {
        colors: colors
    }
}

export default class StackedBarChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        events: PropTypes.object,
        onSelectionChange: PropTypes.func,
        selectedIndices: PropTypes.array,
        width: PropTypes.number,
        height: PropTypes.number,
        dataMapper: PropTypes.func,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendArrangement: PropTypes.string,
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        range: PropTypes.array,
        styles: PropTypes.object,
        pivot: PropTypes.bool,
        xGrid: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        yGrid: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        xDomain: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
        yDomain: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 500,
        height: 500
    }
    constructor(props) {
        super(props)
        this.state = {
            selectedIndices: this.initialSelectedIndices,
            hoverIndex: null,
            gIndex: null
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get initialSelectedIndices() {
        return this.props.data.map(i => true)
    }

    get selectedIndices() {
        let {selectedIndices} = this.props
        if(selectedIndices){
            if(typeof selectedIndices[0] === "number"){
                let selected = this.props.data.map(i => false)
        
                selectedIndices.forEach(item => {
                    selected[item] = true
                })
                return selected
            }
            else{
                return selectedIndices
            }
        }

        return this.state.selectedIndices
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
                color,
                prefer: this.props.pivot ? AutoTooltip.preferRight : AutoTooltip.preferTop
            }
        })
    }

    onMouseOverBar = (evt, data, index, gIndex) => {
        let gIndex2 = Math.floor(index / 3)
        let className = evt.target.getAttribute('class')
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
        this.setState({
            hoverIndex: index % 3,
            gIndex: gIndex || gIndex2
        })
    }

    onMouseLeaveBar = () => {
        this.setState({
            hoverIndex: null,
            gIndex: null
        })
    }

    onMouseLeaveChart = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    onClickBar = (evt, data, index, gIndex) => {
        const { events, onSelectionChange } = this.props
        let gIndex2 = Math.floor(index / 3)
        let actualIndex = index % 3 + 3 * (gIndex || gIndex2)
        let selectedIndices = updateSelectedIndices(this.selectedIndices, actualIndex)

        if(onSelectionChange) {
            let callBackSelectedIndices =[]
            selectedIndices.forEach((selected, index) => {
                if(selected){
                    callBackSelectedIndices.push(index)
                }
            })

            onSelectionChange(index, callBackSelectedIndices)
        }
        else if(events && events.onSelectedChange) {
            let dataWidthSelectedStatus = this.props.data.map((item, index) => Object.assign({}, item, { selected: selectedIndices[index]}))
            events.onSelectedChange(dataWidthSelectedStatus)
        } 
        else {
            this.setState({
                selectedIndices
            })
        }
    }

    render() {
        let {
            hoverIndex,
            gIndex,
            toolTipProps,
            axisToolTipProps
        } = this.state
        let {
            data,
            dataMapper,
            events,
            pivot = false,
            range,
            styles: _styles,
            legendData,
            legendArrangement,
            legendX,
            legendY,
            xDomain = getXDomain,
            yDomain = range || (data => getYDomain(data, 'value', 'name')),
            xGrid,
            yGrid,
            toolTip,
            xToolTip,
            selectedIndices,
            ...restProps } = this.props
        let styles = assignStyle(defaultStyles, _styles)
        let mappers = [
            dataMapper,
            (d, i) => Object.assign({ order: i }, d)
        ]
        let userEvents = inject(getDOMEvents(events),
            ['onMouseOver', 'onMouseLeave', 'onClick'],
            [this.onMouseOverBar, this.onMouseLeaveBar, this.onClickBar]
        )
        let builtInEvents = {
            'onMouseOver': this.onMouseOverBar,
            'onMouseLeave': this.onMouseLeaveBar,
            'onClick': this.onClickBar
        }

        return (
            <Container {...this.props} onMouseLeave={this.onMouseLeaveChart}>
                <ShareProps
                    data={data}
                    dataMapper={mappers}
                    xScale={pivot ? scaleLinear() : scaleBand()}
                    xDomain={pivot ? yDomain : xDomain}
                    yScale={pivot ? scaleBand() : scaleLinear()}
                    yDomain={pivot ? xDomain : yDomain}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    <StackedBar
                        pivot={pivot}
                        styles={styles.stackedBar}
                        hoverIndex={hoverIndex}
                        gIndex={gIndex}
                        selectedIndices={this.selectedIndices}
                        events={userEvents}
                        stackDepth={3}
                    />
                    <Legend
                        legendArrangement={legendArrangement}
                        legendData={legendData}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                        hoverIndex={hoverIndex != null ? (hoverIndex + 3 * gIndex) : null}
                        selectedIndices={this.selectedIndices}
                        events={builtInEvents}
                    />
                    <XAxis domainAlignment={pivot ? 'start' : 'middle'} onAxisToolTipChange={this.onAxisToolTipChange}/>
                    <YAxis domainAlignment={pivot ? 'middle' : 'start'} />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='bar-tooltip'
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


