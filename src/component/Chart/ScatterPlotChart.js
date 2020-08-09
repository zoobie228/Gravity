import React from 'react'
import PropTypes from 'prop-types'
import { assignStyle } from './common'
import BubbleChart from './BubbleChart'
import { dataVizColorPalette } from './common/color-palette'

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
        radius: 5,
        opacity: 0.5
    }
}

export default class ScatterPlotChart extends React.Component {
    static propTypes = BubbleChart.propTypes

    render() {
        let { styles: _styles, ...restprops } = this.props
        let styles = assignStyle(defaultStyles, _styles)
        return (
            <BubbleChart styles={styles} {...restprops} />
        )
    }
}
