import React from 'react'
import PropTypes from 'prop-types'
import { dataVizColorPalette } from './common/color-palette'
import DonutStatusChart from './DonutStatusChart'
import { containerCommonPropTypes, assignStyle } from './common'

const defaultStyles = {
    summary: {
        color: dataVizColorPalette[0]
    }
}

export default class DonutPercentageChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.number),
        color: PropTypes.string,
        styles: PropTypes.shape({
            donut: PropTypes.shape({
                innerRadius: PropTypes.number
            }),
            summary: PropTypes.shape({
                color: PropTypes.string
            })
        })

    }

    static defaultProps = {
        onClick: function (evt, data) { },
        width: 300,
        height: 300,
        color: dataVizColorPalette[0],
        value: 0
    }

    render() {
        let { value, color, styles: _styles, ...restProps } = this.props

        color = color ? color : dataVizColorPalette[0];

        let styles = assignStyle(assignStyle(defaultStyles, { summary: { color: color } }), _styles)
        return (
            <DonutStatusChart styles={styles} colors={[color]} summary={value + "%"} data={[value]} hideLegend {...restProps} />
        )
    }
}