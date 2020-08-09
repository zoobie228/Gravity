import React from 'react'
import PropTypes from 'prop-types'
import { toStacked, groups } from './util'
import { Area } from './area'

export class StackedArea extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        styles: PropTypes.object
    }

    render() {
        let { data,selectedIndices,hoverIndex, styles: { colors }, ...restProps } = this.props
        let stackedData = toStacked(data)

        return groups(stackedData).map((items, index) => {
            let light = selectedIndices[index]
            let hover= hoverIndex===index
            if(!hover&&!light)return null
            return (
                <Area
                    key={index}
                    data={items}
                    index={index}
                    styles={{ color: colors[index % colors.length] }}
                    {...restProps}
                />
        )})
    }
}


