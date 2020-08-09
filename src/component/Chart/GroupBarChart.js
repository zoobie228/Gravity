import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { XAxis, YAxis, Container, GroupBar, Legend, assignStyle } from './common'
import { Grids } from './common/grids'
import { GroupText } from './common/text'
import { ShareProps } from './common/propsHelper'
import { getXDomain, getYDomain, inject, updateSelectedIndices, groups, getDOMEvents } from './common/util'
import { dataVizColorPalette as colorPalette } from './common/color-palette'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'

const colors = [colorPalette[4], colorPalette[7], colorPalette[1], colorPalette[10]]

const defaultStyles = {
    groupBar: {
        colors: colors
    },
    legend: {
        colors: colors
    }
}

export default class GroupBarChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        onSelectionChange: PropTypes.func,
        selectedIndices: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendArrangement: PropTypes.string,
        width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        dataMapper: PropTypes.func,
        range: PropTypes.array,
        showValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        pivot: PropTypes.bool,
        styles: PropTypes.object,
        toolTip: PropTypes.func,
        xDomain: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
        yDomain: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
        xGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        yGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
    }

    static defaultProps = {
        width: 800,
        height: 600
    }

    constructor(props) {
        super(props)
        this.state = {
            toolTipX: -1,
            toolTipY: -1,
            showToolTip: false,
            toolTipContent: null,
            hoverBarIndex: null,
            hoverLegendIndex: null,
            selectedIndices: this.initialSelectedIndices,
            legendSelectedIndices: this.initialLegendSelectedIndices
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get mapData() {
        let { data, dataMapper } = this.props
        let mapData = cloneDeep(data)
        if (dataMapper) {
            let mappers = [
                dataMapper,
                (d, i) => Object.assign({ order: i }, d)
            ]
            mappers.forEach(map => {
                if (map) mapData = mapData.map(map)
            })
        }
        return mapData
    }

    get initialSelectedIndices() {
        return this.props.data.map(i => true)
    }

    get selectedIndices() {
        let { selectedIndices } = this.props

        if (selectedIndices) {
            if (typeof selectedIndices[0] === "number") {
                let selected = this.props.data.map(i => false)

                selectedIndices.forEach(item => {
                    selected[item] = true
                })
                return selected
            }
            else {
                return selectedIndices
            }
        }

        return this.state.selectedIndices
    }

    get initialLegendSelectedIndices() {
        return groups(this.mapData, 'name')[0].map(i => true)
    }

    get legendSelectedIndices() {
        let { selectedIndices } = this.props

        if (selectedIndices) {
            let groupIndicesMap = this.getGroupIndicesMap(this.selectedIndices)
            let legendSelectedIndices = this.updateLegendSelectedIndices(this.state.legendSelectedIndices, groupIndicesMap)
            return legendSelectedIndices
        }
        return this.state.legendSelectedIndices
    }

    getGroupIndicesMap(selectedIndices) {
        let groupIndicesMap = []
        this.mapData.forEach((item, index) => {
            groupIndicesMap.push(Object.assign({}, item, { selected: selectedIndices[index] }))
        })

        return groups(groupIndicesMap, 'name')
    }

    onMouseOverBar = (evt, data, index) => {
        const className = evt.target.getAttribute('class')
        if (className == 'bar' && this.props.toolTip) {
            const { pivot } = this.props
            const { top, left, width, height } = evt.target.getBoundingClientRect()
            const color = evt.target.getAttribute('fill')
            const x = left
            const y = top
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
            hoverBarIndex: [data.order],
            hoverLegendIndex: index
        })
    }

    onMouseOverLegend = (evt, data, index) => {
        let groupIndicesMap = this.getGroupIndicesMap(this.selectedIndices)
        let hoverBarIndex = []
        groupIndicesMap.forEach((group, groupIndex) => {
            group.forEach((item, itemIndex) => {
                if (itemIndex == index) {
                    hoverBarIndex.push(itemIndex + groupIndex * group.length)
                }
            })
        })
        this.setState({
            hoverBarIndex,
            hoverLegendIndex: index
        })
    }

    onMouseLeaveBar = (evt) => {
        const className = evt.target.getAttribute('class')
        if (className == 'bar' && this.props.toolTip) {
            this.debouncedShowOrHideToolTip(null) // hide
        }
        this.setState({
            hoverBarIndex: null,
            hoverLegendIndex: null
        })
    }

    showOrHideToolTip = (data, x, y, width, height, color) => {
        if (data === null) {
            this.setState({
                toolTipProps: {
                    show: false,
                    content: null
                }
            })
        } else {
            const { toolTip } = this.props
            this.setState({
                toolTipProps: {
                    show: true,
                    content: toolTip(data),
                    x: x,
                    y: y,
                    width,
                    height,
                    color,
                    prefer: this.props.pivot ? AutoTooltip.preferRight : AutoTooltip.preferTop
                }
            })
        }
    }

    onClickBar = (evt, data, index) => {
        let { events, onSelectionChange } = this.props

        let selectedIndices = updateSelectedIndices(this.selectedIndices, data.order)

        if (onSelectionChange) {
            let callBackSelectedIndices = []

            selectedIndices.forEach((selected, index) => {
                if (selected) {
                    callBackSelectedIndices.push(index)
                }
            })

            onSelectionChange([data.order], callBackSelectedIndices)
        }
        else if (events && events.onSelectedChange) { // to remove
            let dataWidthSelectedStatus = []
            let groupData = groups(this.props.data, 'name')
            groupData.forEach((group, groupIndex) => {
                group.forEach((item, itemIndex) => {
                    dataWidthSelectedStatus.push(Object.assign({}, item, { selected: selectedIndices[itemIndex + groupIndex * group.length] }))
                })
            })
            events.onSelectedChange(dataWidthSelectedStatus)
        }
        else {
            let groupIndicesMap = this.getGroupIndicesMap(selectedIndices)
            let legendSelectedIndices = this.updateLegendSelectedIndices(this.state.legendSelectedIndices, groupIndicesMap)
            this.setState({
                selectedIndices,
                legendSelectedIndices
            })
        }
    }

    onClickLegend = (evt, data, index) => {
        let { events, onSelectionChange } = this.props

        let selectedIndices = []
        let temp = []

        let groupIndicesMap = this.getGroupIndicesMap(this.selectedIndices)
        groupIndicesMap.forEach(group => {
            group.forEach((item, itemIndex) => {
                if (itemIndex == index) {
                    temp.push(item.selected)
                }
            })
        })
        let lightedUp = temp.some(i => i == false)
        let allLightedUp = this.selectedIndices.every(i => i)

        groupIndicesMap.forEach(group => {
            group.forEach((item, itemIndex) => {
                if (itemIndex == index) {
                    item.selected = lightedUp
                }
                if (allLightedUp) {
                    item.selected = !item.selected
                }
                selectedIndices.push(item.selected)
            })
        })
        if (selectedIndices.every(i => !i)) {
            selectedIndices = []
            groupIndicesMap.forEach(group => {
                group.forEach((item) => {
                    item.selected = true
                    selectedIndices.push(item.selected)
                })
            })
        }
        let legendSelectedIndices = this.updateLegendSelectedIndices(this.state.legendSelectedIndices, groupIndicesMap)

        if (onSelectionChange) {
            let clickedIndices = []
            let callBackSelectedIndices = []
            let groupIndicesMap = this.getGroupIndicesMap(selectedIndices)
            groupIndicesMap.forEach((group, groupIndex) => {
                group.forEach((item, itemIndex) => {
                    if (itemIndex == index) {
                        clickedIndices.push(itemIndex + groupIndex * group.length)
                    }
                })
            })
            selectedIndices.forEach((item, index) => {
                if (item) {
                    callBackSelectedIndices.push(index)
                }
            })
            onSelectionChange(clickedIndices, callBackSelectedIndices)
        }
        else if (events && events.onSelectedChange) {
            let dataWidthSelectedStatus = []
            let groupData = groups(this.mapData, 'name')
            groupData.forEach((group, groupIndex) => {
                group.forEach((item, itemIndex) => {
                    dataWidthSelectedStatus.push(Object.assign({}, item, { selected: selectedIndices[itemIndex + groupIndex * group.length] }))
                })
            })
            events.onSelectedChange(dataWidthSelectedStatus)
        }
        else {
            this.setState({
                selectedIndices,
                legendSelectedIndices
            })
        }
    }

    updateLegendSelectedIndices(legendSelectedIndices, groupIndicesMap) {
        let result = legendSelectedIndices.map(i => false)

        groupIndicesMap.forEach(group => {
            group.forEach((item, index) => {
                item.selected ? result[index] = true :
                    result[index] ? result[index] = true : result[index] = false
            })
        })

        return result

    }

    render() {
        let {
            hoverBarIndex,
            hoverLegendIndex,
            toolTipProps,
            axisToolTipProps
        } = this.state
        let {
            data,
            dataMapper,
            events,
            range,
            showValue = false,
            styles: _styles,
            legendData,
            legendArrangement,
            legendX,
            legendY,
            xDomain = getXDomain,
            yDomain = range || (data => getYDomain(data, 'value')),
            pivot = false,
            xGrid,
            yGrid,
            toolTip,
            xToolTip,
            selectedIndices,
            ...restProps
        } = this.props

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
            'onMouseOver': this.onMouseOverLegend,
            'onMouseLeave': this.onMouseLeaveBar,
            'onClick': this.onClickLegend
        }

        return (
            <Container {...this.props} onMouseLeave={this.onMouseLeaveBar}>
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
                    <GroupBar
                        pivot={pivot}
                        styles={styles.groupBar}
                        hoverIndex={hoverBarIndex}
                        selectedIndices={this.selectedIndices}
                        events={userEvents}
                    />
                    <GroupText
                        pivot={pivot}
                        styles={{
                            textAnchor: pivot ? 'start' : 'middle',
                            width: styles.groupBar.width,
                            dy: pivot ? '.65ex' : 0
                        }}
                        xOffset={pivot ? 6 : 0}
                        yOffset={pivot ? 0 : -6}
                        showValue={showValue}
                    />
                    <Legend
                        legendArrangement={legendArrangement}
                        legendData={legendData}
                        hoverIndex={hoverLegendIndex}
                        selectedIndices={this.legendSelectedIndices}
                        events={builtInEvents}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                    />
                    <XAxis
                        domainAlignment={pivot ? 'start' : 'middle'}
                        onAxisToolTipChange={this.onAxisToolTipChange}
                    />
                    <YAxis
                        domainAlignment={pivot ? 'middle' : 'start'}
                    />
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
