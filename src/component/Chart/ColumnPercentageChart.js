import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { XAxis, YAxis, Container, Legend, Grids, StackedBar, containerCommonPropTypes, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import uniq from 'lodash/uniq'
import { inject, groups, updateSelectedIndices, getDOMEvents } from './common/util'
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

export default class ColumnPercentageChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        onSelectionChange: PropTypes.func,
        selectedIndices: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        pivot: PropTypes.bool,
        yAxisName: PropTypes.string,
        xToolTip: PropTypes.func
    }

    static defaultProps = {
        width: 500,
        height: 500
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null,
            selectedIndices: this.initialSelectedIndices
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get data() {
        let { data, dataMapper = d => d } = this.props
        data = data.map(dataMapper)
        data = flatTwoDimensionArray(data)
        data = toPercentageArray(data)
        return data
    }

    get initialSelectedIndices() {
        return groups(this.data, 'name')[0].map(i => true)
    }

    get selectedIndices() {
        let {selectedIndices} = this.props

        if(selectedIndices){
            if(typeof selectedIndices[0] === "number"){
                let selected = groups(this.data, 'name')[0].map(i => false)
        
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
            hoverIndex: index
        })
    }

    onMouseLeaveBar = () => {
        this.setState({
            hoverIndex: null
        })
    }

    onMouseLeaveChart = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    onClickBar = (evt, data, index) => {
    
        let { events, onSelectionChange } = this.props
        
        let selectedIndices = updateSelectedIndices(this.selectedIndices, index)

        if(onSelectionChange){
            let callBackSelectedIndices =[]
            selectedIndices.forEach((selected, index) => {
                if(selected){
                    callBackSelectedIndices.push(index)
                }
            })

            onSelectionChange(index, callBackSelectedIndices)
        }
        else if(events && events.onSelectedChange){
            let dataWidthSelectedStatus = []
            let groupData =  groups(this.props.data, 'name')
            groupData.forEach(items => {
                    items.forEach( (item, index) =>{
                    dataWidthSelectedStatus.push(Object.assign({}, item, { selected: selectedIndices[index]}))
                })
            })
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
            toolTipProps,
            axisToolTipProps
        } = this.state
        let { data: _data,
            dataMapper,
            events,
            pivot = false,
            range,
            styles: _styles,
            legendData,
            legendArrangement,
            legendX,
            legendY,
            xGrid,
            yGrid,
            toolTip,
            selectedIndices,
            xToolTip,
            ...restProps
        } = this.props
        let data = this.data
        let styles = assignStyle(defaultStyles, _styles)
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
                    xScale={pivot ? scaleLinear() : scaleBand()}
                    xDomain={pivot ? [0, 100] : data => uniq(data.map(d => d.name))}
                    yScale={pivot ? scaleBand() : scaleLinear()}
                    yDomain={pivot ? data => uniq(data.map(d => d.name)) : [0, 100]}
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
                        selectedIndices={this.selectedIndices}
                        events={userEvents}
                        stackDepth={12}
                    />
                    <Legend
                        legendData={legendData}
                        legendArrangement={legendArrangement}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                        events={builtInEvents}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
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

function flatTwoDimensionArray(data) {
    let result = []
    data.forEach(i => {
        if (Array.isArray(i)) {
            result = result.concat(i)
        }
        else {
            result.push(i)
        }
    })
    return result
}

function toPercentageArray(data) {
    let names = uniq(data.map(d => d.name)),
        reducer = (accumulator, current) => accumulator + current.value,
        result = [],
        sumMap = {}

    names.forEach(name => {
        let sum = data.filter(d => d.name === name).reduce(reducer, 0)
        sumMap[name] = sum
    })

    result = data.map(d => {
        return { ...d, value: d.value / sumMap[d.name] * 100 }
    })

    return result
}