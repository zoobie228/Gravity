import React from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal, scaleQuantile } from 'd3-scale'
import { Container } from './common'
import { treeHeatMapColors, dataVizColorPalette, darkColorsForTreemap, UN_SELECTED } from './common/color-palette'
import { treemap, hierarchy } from "d3-hierarchy";
import { bindEvents } from './common/events'
import { inject } from './common/util'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'

export default class TreeMapChart extends React.Component {

    static defaultProps = {
        padding: 40,
        width: 700,
        height: 700
    }

    static propTypes = {
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        padding: PropTypes.number,
        paddingTop: PropTypes.number,
        paddingRight: PropTypes.number,
        paddingBottom: PropTypes.number,
        paddingLeft: PropTypes.number,
        data: PropTypes.object,
        type: PropTypes.string,
        colors: PropTypes.array,
        styles: PropTypes.object,
        alwaysShowTextAndToolTip: PropTypes.bool,
        toolTip: PropTypes.func,
        showSizeValue: PropTypes.bool,
        events: PropTypes.object,
        selectedData: PropTypes.object
    }

    constructor(props) {
        super(props)
        this.treeMapData = this.getTreeMapData
        this.heatValues = []
        this.min = []
        this.max = []
        this.heatMapColorScale = this.colorGroup
        this.legendData = []
        this.state = {
            hoverIndex: [],
            selectedIndices: this.initialSelectedIndices,
            legendSelectedIndices: this.initialLegendSelectedIndices
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.nameStack = []

    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let { selectedData } = nextProps
        if (selectedData) {
            let selectedIndices = this.convertToSelectedIndices(selectedData)
            let legendSelectedIndices = this.updateLegendSelectedIndices(this.treeMapData, selectedIndices, this.state.legendSelectedIndices)
            this.setState({
                selectedIndices,
                legendSelectedIndices
            })

        }
    }

    showOrHideToolTip = (d, x, y, width, height, color) => {
        const content = d ?
            (
                this.props.toolTip ? this.props.toolTip(d) :
                    <div>{d.data.name + "\n" + (this.props.type === 'heatmap' ? d.data.heat : d.value)}</div>
            )
            : null
        this.setState({
            toolTipProps: {
                show: d ? true : false,
                content: d ? content : null,
                x,
                y,
                width,
                height,
                color
            }
        })
    }

    getHeatValues(data) {

        const children = data.children;

        if (children) {
            children.forEach((child) => {
                if (child.children) {
                    this.getHeatValues(child)
                } else {
                    this.heatValues.push(child.heat)
                }
            })
        }
    }

    get getTreeMapData() {

        let {
            width,
            height,
            data
        } = this.props

        const d3treemap = treemap()
            .size([width, height])
            .round(true)
            .paddingInner(1)
        const root = hierarchy(data)
            .sum((s) => s.size)
            .sort((a, b) => b.height - a.height || b.value - a.value);
        d3treemap(root);

        return root.leaves()
    }

    get colorGroup() {

        this.getHeatValues(this.props.data)

        this.min = Math.min(...this.heatValues)
        this.max = Math.max(...this.heatValues)

        if (this.props.type === 'heatmap') {
            return scaleQuantile().domain([this.min, this.max]).range(this.props.colors || treeHeatMapColors)
        }
    }

    get initialSelectedIndices() {
        if (this.props.selectedData) {
            return this.convertToSelectedIndices(this.props.selectedData)
        } else {
            return this.heatValues.map(i => true)
        }
    }

    get initialLegendSelectedIndices() {
        if (this.props.type === 'heatmap') {
            let heatMapRangeTempArr = this.heatMapColorScale.quantiles()
            heatMapRangeTempArr.push(this.max)
            this.legendData = heatMapRangeTempArr.map((v) => v.toFixed(0)).reverse()

            if (this.props.selectedData) {
                return this.updateLegendSelectedIndices(this.treeMapData, this.convertToSelectedIndices(this.props.selectedData), this.legendData.map(i => true))
            } else {
                return this.heatValues.map(i => true)
            }
        }
    }

    convertToSelectedIndices = selectedData => {
        let isSameNode = (a, b) => {
            let i = a.data.name == b.data.name
            let ii = a.depth == b.depth

            if (i && ii) {
                if (a.depth == 0) {
                    return true
                } else {
                    return isSameNode(a.parent, b.parent)
                }
            } else {
                return false
            }
        }

        const d3treemap = treemap()
            .size([this.props.width, this.props.height])
            .round(true)

        const root = hierarchy(selectedData)
            .sum((s) => s.size)
            .sort((a, b) => b.height - a.height || b.value - a.value);
        d3treemap(root)

        let selectedNodes = root.leaves()
        let result = this.treeMapData.map(a => {
            return selectedNodes.some(b => isSameNode(a, b)) ? true : false
        })

        return result
    }

    updateSelectedIndicesOnclickTree = (treeMapData, selectedIndices, selectedIndex) => {
        let unSelectedCount = selectedIndices.filter(d => d === false)
        let allSelected = unSelectedCount.length === 0

        for (let index = 0; index < treeMapData.length; index++) {

            if (allSelected) {
                let d = selectedIndices[index]
                selectedIndices[index] = index === selectedIndex ? d : !d
            }
            else {
                let d = selectedIndices[index]
                selectedIndices[index] = index === selectedIndex ? !d : d
            }
        }

        selectedIndices = this.isAllLightedUp(selectedIndices)

        return selectedIndices
    }

    getColor(treeMapData, index) {
        let color
        const regularColor = scaleOrdinal().range(this.props.colors || dataVizColorPalette)
        const getRegularColor = (d) => {
            while (d.depth > 1) d = d.parent; return regularColor(d.data.name);
        }
        if (this.props.type === 'heatmap') {
            let heat = treeMapData[index].data.heat
            color = this.heatMapColorScale(heat)
        } else {
            color = getRegularColor(treeMapData[index])
        }
        return color
    }

    updateSelectedIndicesOnClickLegend = (treeMapData, selectedIndices, legendColor) => {
        let lightedUp = []

        for (let index = 0; index < treeMapData.length; index++) {
            let color = this.getColor(treeMapData, index)
            let selected = selectedIndices[index]

            if (color == legendColor) {
                lightedUp.push({ index: index, selected: selected })
                selectedIndices[index] = true
            }
        }

        let allSelected = lightedUp.every(i => i.selected == true)

        if (allSelected) {
            for (let i in lightedUp) {
                let d = selectedIndices[lightedUp[i].index]
                selectedIndices[lightedUp[i].index] = false
            }
        }
        // if(!this.props.selectedData){
        selectedIndices = this.isAllLightedUp(selectedIndices)
        // }

        return selectedIndices
    }

    updateLegendSelectedIndices = (treeMapData, nextSelectedIndices, legendSelectedIndices) => {

        const treeHeatMapColorsForLegend = treeHeatMapColors.slice().reverse()

        let lightedUp = []

        for (let index = 0; index < nextSelectedIndices.length; index++) {
            if (nextSelectedIndices[index]) {
                let heat = treeMapData[index].data.heat
                let color = this.heatMapColorScale(heat)
                if (!lightedUp.some(i => i == color)) {
                    lightedUp.push(color)
                }
            }
        }

        for (let index in treeHeatMapColorsForLegend) {
            let color = treeHeatMapColorsForLegend[index]
            legendSelectedIndices[index] = lightedUp.some(i => i == color) ? true : false
        }

        return legendSelectedIndices

    }

    //when all is unselected, select all
    isAllLightedUp = (selectedIndices) => {
        if (selectedIndices.every(selected => selected == false)) {
            selectedIndices = selectedIndices.map(d => d = !d)
        }

        return selectedIndices
    }

    selectedCallBackData = (item, child) => {
        item.name = child.name;
        item.size = child.size;
        item.heat = child.heat;
        item.selected = child.selected;

        return item
    }

    hasSameAncestor(node) {
        let result = true
        let depth = this.nameStack.length

        if (node.depth != depth) { return false }

        while (depth) {
            if (this.nameStack[depth - 1] != node.parent.data.name) {
                result = false
                break
            }
            node = node.parent
            depth--
        }
        return result
    }

    onClickTree = (evt, item, index) => {

        const { events, data, selectedData } = this.props
        let legendSelectedIndices
        let selectedIndices

        let addOrRemove = node => {
            let stack = []
            stack.push(node.data.name)

            while (node.depth) {
                node = node.parent
                stack.unshift(node.data.name)
            }

            let depth = 0
            let result = cloneDeep(this.props.selectedData)

            let root = result
            let target

            while (depth < stack.length) {
                let name = stack[depth]
                if (depth === 0) {
                    if (root.name != name) throw 'invalid root name in props.selectedData'
                } else {
                    target = root.children.find(i => i.name == name)

                    if (depth == (stack.length - 1)) {
                        if (target) {
                            root.children = root.children.filter(i => i.name != name)
                        } else {
                            root.children.push(item.data)
                        }
                    } else {
                        root = target
                    }
                }
                depth++
            }
            return result
        }


        let findItemPath = item => {
            let clickedItem = new Object
            let node = cloneDeep(item)
            clickedItem = node.data
            if (node.parent) {
                clickedItem = generateClickItem(clickedItem, node.parent)
            }
            return clickedItem
        }

        let generateClickItem = (clickedItem, node) => {
            let rootPath = new Object
            if (node) {
                rootPath.name = node.data.name
                rootPath.children = clickedItem
                clickedItem = rootPath
                return generateClickItem(rootPath, node.parent)
            }
            else {
                return clickedItem
            }
        }


        if (selectedData) {

            let nextselectedData = addOrRemove(item)

            let clickedItem = findItemPath(item)

            if (events && events.onSelectedChange) {
                events.onSelectedChange(clickedItem, nextselectedData)
            }

        }
        else {
            selectedIndices = this.updateSelectedIndicesOnclickTree(this.treeMapData, this.state.selectedIndices, index)
            if (this.props.type === 'heatmap') {
                legendSelectedIndices = this.updateLegendSelectedIndices(this.treeMapData, selectedIndices, this.state.legendSelectedIndices)
            }

            this.setState({
                selectedIndices,
                legendSelectedIndices
            })
        }

    }

    onClickLegend = (evt, legendcolor, index) => {

        let selectedIndices = this.updateSelectedIndicesOnClickLegend(this.treeMapData, this.state.selectedIndices, legendcolor)

        // derive from result
        let legendSelectedIndices = this.updateLegendSelectedIndices(this.treeMapData, selectedIndices, this.state.legendSelectedIndices)

        this.setState({
            selectedIndices,
            legendSelectedIndices
        })

    }


    onMouseOver = (evt, data, index) => {
        let className = evt.target.getAttribute('class')

        if (className == 'tree-plaque-showtooltip') {
            let { top, left, width, height } = evt.target.getBoundingClientRect()
            let color = evt.target.style.fill
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
            hoverIndex: [index]
        })
    }

    onMouseOverLegend = (evt, selectedcolor, index) => {

        const regularColor = scaleOrdinal().range(this.props.colors || dataVizColorPalette)
        const getRegularColor = (d) => {
            while (d.depth > 1) d = d.parent; return regularColor(d.data.name);
        }
        const temp = []
        for (let index = 0; index < this.treeMapData.length; index++) {
            let heat = this.treeMapData[index].data.heat
            let color
            if (this.props.type === 'heatmap') {
                color = this.heatMapColorScale(heat)
            } else {
                color = getRegularColor(this.treeMapData[index])
            }

            if (color == selectedcolor) {
                temp.push(index)
            }
        }

        this.setState({
            hoverIndex: temp
        })
    }

    onMouseLeaveContainer = (evt) => {
        this.debouncedShowOrHideToolTip(null)
    }

    onMouseLeaveLegend = () => {
        this.setState({
            hoverIndex: []
        })
    }

    onMouseLeaveLeaf = () => {
        this.debouncedShowOrHideToolTip(null)
        this.setState({
            hoverIndex: []
        })
    }

    render() {
        let {
            data,
            type,
            colors,
            styles,
            alwaysShowTextAndToolTip,
            showSizeValue
        } = this.props

        let {
            hoverIndex,
            selectedIndices,
            legendSelectedIndices,
            toolTipProps = {}
        } = this.state

        let treeEvents = inject({},
            ['onMouseOver', 'onMouseLeave', 'onClick'],
            [this.onMouseOver, this.onMouseLeaveLeaf, this.onClickTree]
        )

        let legendEvents = inject({},
            ['onMouseOver', 'onMouseLeave', 'onClick'],
            [this.onMouseOverLegend, this.onMouseLeaveLegend, this.onClickLegend]
        )

        return (
            <Container {...this.props}
                onMouseOut={this.onMouseLeaveContainer}
                onMouseLeave={this.onMouseLeaveContainer}
            >
                <Tree
                    data={data}
                    type={type}
                    colors={colors}
                    heatMapColorScale={this.heatMapColorScale}
                    styles={styles}
                    alwaysShowTextAndToolTip={alwaysShowTextAndToolTip}
                    events={treeEvents}
                    showSizeValue={showSizeValue}
                    hoverIndex={hoverIndex}
                    selectedIndices={selectedIndices}
                />
                {
                    type === 'heatmap' &&
                    <Legend
                        legendData={this.legendData}
                        events={legendEvents}
                        selectedIndices={legendSelectedIndices}
                    />
                }

                {
                    <AutoTooltip
                        className='bar-tooltip'
                        {...toolTipProps}
                    />
                }
            </Container>
        )
    }
}

class Tree extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        data: PropTypes.object,
        type: PropTypes.string,
        colors: PropTypes.array,
        heatMapColorScale: PropTypes.func,
        styles: PropTypes.object,
        alwaysShowTextAndToolTip: PropTypes.bool,
        events: PropTypes.object,
        showSizeValue: PropTypes.bool, // for heat version treemap
        hoverIndex: PropTypes.array,
        selectedIndices: PropTypes.array
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: []
        }
    }

    onMouseOver = (i) => {
        return evt => {
            this.setState({
                hoverIndex: this.state.hoverIndex.push(i)
            })
        }
    }

    onMouseLeave = () => {
        this.setState({
            hoverIndex: []
        })
    }

    getTextWidth(text, fontSize, fontFace) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = fontSize + 'px ' + fontFace;
        return context.measureText(text).width;
    }

    render() {
        let {
            width,
            height,
            data,
            type,
            colors,
            heatMapColorScale,
            styles = {},
            alwaysShowTextAndToolTip,
            events: _events = {},
            showSizeValue,
            hoverIndex = [],
            selectedIndices = [] } = this.props

        let {
            labelPadding = 10,
            labelPaddingTop = labelPadding,
            labelPaddingRight = labelPadding,
            labelPaddingBottom = labelPadding,
            labelPaddingLeft = labelPadding,
            mainLabelFontSize = 16,
            secondaryLabelFontSize = 13,
            secondaryLabelMarginTop = 5
        } = styles

        const d3treemap = treemap()
            .size([width, height])
            .round(true)
            .paddingInner(1)
        const root = hierarchy(data)
            .sum((s) => s.size)
            .sort((a, b) => b.height - a.height || b.value - a.value);
        d3treemap(root);
        const treeMapData = root.leaves()
        const regularColor = scaleOrdinal().range(colors || dataVizColorPalette)
        const getRegularColor = (d) => {
            while (d.depth > 1) { d = d.parent }
            return regularColor(d.data.name);
        }

        return (
            treeMapData.map((item, index) => {
                const rectWidth = item.x1 - item.x0
                const rectHeight = item.y1 - item.y0
                const mainLabels = item.data.name.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
                let showToolTip = false
                for (let j = 0; j < mainLabels.length; j++) {
                    if (this.getTextWidth(mainLabels[j], mainLabelFontSize) > (rectWidth - labelPaddingLeft - labelPaddingRight)) {
                        showToolTip = true
                        break
                    }
                }
                let secondaryLabel = type === 'heatmap' ? item.data.heat : item.value
                if (showSizeValue) {
                    secondaryLabel = item.value   // if user set showSizeValue, still use size for heat version
                }
                const secondlabelY = labelPaddingTop + mainLabels.length * mainLabelFontSize + secondaryLabelMarginTop + secondaryLabelFontSize / 2
                const treeFill = type === 'heatmap' ? heatMapColorScale(item.data.heat) : (getRegularColor(item))
                if ((secondlabelY + secondaryLabelFontSize) > (rectHeight - labelPaddingBottom)) {
                    showToolTip = true
                }
                let textColor
                if (darkColorsForTreemap.includes(treeFill)) {
                    textColor = '#FFFFFF'
                }

                let hover = hoverIndex.includes(index)

                let light = selectedIndices.length > 0 ? selectedIndices[index] : true
                let events = bindEvents(_events, item, index)

                return (
                    <g className='tree-g-plaque' key={index} transform={`translate(${item.x0},${item.y0})`}>
                        <rect
                            id={`leaf-${index}`}
                            width={rectWidth > 6 ? rectWidth - 6 : rectWidth - 1}
                            height={rectHeight > 6 ? rectHeight - 6 : rectWidth - 1}
                            key={index}
                            strokeWidth={(rectHeight > 6 && rectWidth > 6) ?
                                (hover ? 8 : 6) : (hover ? 3 : 1)}
                            stroke={hover || light ? treeFill : UN_SELECTED}
                            strokeOpacity={hover ? 0.5 : 1}
                            {...events}
                            style={{ fill: hover || light ? treeFill : UN_SELECTED }}
                            className={(alwaysShowTextAndToolTip || showToolTip) ? 'tree-plaque-showtooltip' : 'tree-plaque-not-showtooltip'}
                        />
                        {(alwaysShowTextAndToolTip || !showToolTip) &&
                            <text transform={`translate(${labelPaddingLeft},${labelPaddingTop})`}>
                                {
                                    mainLabels.map((item, index) => {
                                        let mainLabelY
                                        if (index === 0) {
                                            mainLabelY = labelPaddingTop + mainLabelFontSize / 2
                                        } else {
                                            mainLabelY = mainLabelFontSize * index + labelPaddingTop + mainLabelFontSize / 2
                                        }
                                        return (<tspan
                                            fontSize={mainLabelFontSize}
                                            key={index}
                                            fill={hover || light ? textColor : '#FFFFFF'}
                                            x={0}
                                            y={mainLabelY}
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {item}
                                        </tspan>)
                                    })
                                }
                                <tspan
                                    fontSize={secondaryLabelFontSize}
                                    key={mainLabels.length + 1}
                                    fill={hover || light ? textColor : '#FFFFFF'}
                                    x={0}
                                    y={secondlabelY}
                                    style={{ pointerEvents: 'none' }}
                                >{secondaryLabel}</tspan>

                            </text>
                        }
                    </g>)
            }
            )
        )
    }
}

class Legend extends React.Component {
    static propTypes = {
        legendData: PropTypes.array,
        width: PropTypes.number,
        height: PropTypes.number
    }

    render() {
        let {
            width,
            height,
            legendData,
            events: _events = {},
            selectedIndices = [] } = this.props
        const legendNodeWidth = 67
        const legendNodeHeight = 25
        const treeHeatMapColorsForLegend = treeHeatMapColors.slice().reverse()
        return (
            treeHeatMapColorsForLegend.map((item, index) => {
                const x = width - legendNodeWidth * (index + 1)
                const y = height + 30
                const textX = x + legendNodeWidth / 2
                const textY = y + legendNodeHeight / 2
                let textColor
                if (darkColorsForTreemap.includes(item)) {
                    textColor = '#FFFFFF'
                }

                let events = bindEvents(_events, item, index)
                let light = selectedIndices.length > 0 ? selectedIndices[index] : true

                return (
                    <React.Fragment key={index}>
                        <rect
                            x={x}
                            y={y}
                            width={legendNodeWidth}
                            height={legendNodeHeight}
                            style={{ fill: light ? item : UN_SELECTED }}
                            {...events}
                        />
                        <text
                            fill={light ? textColor : '#FFFFFF'}
                            fontSize={13}
                            x={textX}
                            y={textY}
                            dominantBaseline="middle"
                            textAnchor="middle"
                            style={{ pointerEvents: 'none' }}
                        >
                            {legendData[index]}
                        </text>
                    </React.Fragment>
                )
            }
            )
        )
    }
}

