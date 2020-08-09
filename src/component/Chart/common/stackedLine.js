import React from 'react'
import PropTypes from 'prop-types'
import { toStacked, groups, inject } from './util'
import { bindEvents } from './events'
import { Line } from './line'
import { UN_SELECTED } from './color-palette'

export class StackedLine extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        styles: PropTypes.object
    }



    render() {
        let { data,
            events: _events,
            hoverIndex,
            selectedIndices,
            styles: { colors },
            ...restProps
        } = this.props
        let stackedData = toStacked(data)

        return groups(stackedData).map((items, i) => {
            let events = bindEvents(_events, items, i)
            let hover = hoverIndex === i
            let light = selectedIndices[i]
            let fill = colors[i % colors.length]
            return (
                <React.Fragment key={i}>
                    <Line
                        key={'line' + i}
                        index={i}
                        data={toData(items)}
                        styles={{ color: hover || light ? fill : UN_SELECTED }}
                        hover={hover}
                        events={events}
                        {...restProps}
                    />
                </React.Fragment>
            )
        }
        )
    }
}

function toData(data) {
    return data.map(i => Object.assign(i, { value: i.y1 }))
}