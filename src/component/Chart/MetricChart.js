import React from 'react';
import { DEFAULT_COLOR } from './common/color-palette'
import PropTypes from 'prop-types'
import { Container, containerCommonPropTypes } from './common'
import { Label } from './common/label'

export default class MetricChart extends React.Component {
    static propTypes = {
        primaryLabel: PropTypes.string,
        secondaryLabel: PropTypes.string,
        label: PropTypes.string.isRequired,
        color: PropTypes.string,
        ...containerCommonPropTypes
    }

    static defaultProps = {
        width: 200,
        height: 100,
        padding: 0,
        defaultColor: DEFAULT_COLOR
    }

    render() {
        return (
            <Container {...this.props} >
                <Label
                    key={1}
                    className='label'
                    x={width => width / 2}
                    y={(width, height) => height / 2}
                    dy={'.66ex'}
                    textAnchor="middle"
                    fill={this.props.color ? this.props.color : this.props.defaultColor}
                >
                    {this.props.label}
                </Label>
                <Label
                    key={2}
                    className='primary-label'
                    x={width => width / 2}
                    y={(width, height) => height / 2 + 40}
                    textAnchor="middle"
                >
                    {this.props.primaryLabel}
                </Label>
                <Label
                    key={3}
                    className='secondary-label'
                    x={width => width / 2}
                    y={(width, height) => height / 2 + 56}
                    textAnchor="middle"
                >
                    {this.props.secondaryLabel}
                </Label>
            </Container>
        )
    }
}
