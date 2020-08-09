import React from 'react'
import PropTypes from 'prop-types'
import { toStacked, groups } from './util'
import { Dot } from './dot'

export class StackedDot extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        styles: PropTypes.object,
        events: PropTypes.object,
        hoverIndex: PropTypes.number,
        selectedIndices: PropTypes.array
    }

    render() {
        let { data,
            events,
            hoverIndex,
            selectedIndices,
            styles: { colors },
            ...restProps
        } = this.props
        let stackedData = toStacked(data)

        return groups(stackedData).map((items, i) => {
            let hover = hoverIndex === i
            let selected = selectedIndices[i]
            let fill = colors[i % colors.length]
            return (
                <Dot
                    key={i}
                    index={i}
                    selected={selected}
                    hover={hover}
                    data={toData(items)}
                    styles={{ color: fill }}
                    events={events}
                    {...restProps}
                />
            )
        })
    }
}

function toData(data) {
    return data.map(i => Object.assign(i, { value: i.y1 }))
}