// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

@observer
class Bar extends Component {

    props: {
        color: string,
        percent: number,
        maxLevel: number
    }

    render() {
        const { color, percent, maxLevel } = this.props
        const width = maxLevel / 120;
        return (
            <div className="bar" style={{ width: width }}>
                <div className="level" style={{ backgroundColor: color, width: percent + "%" }} />
            </div>
        )
    }

    shouldComponentUpdate(nextProps, _) {
        return nextProps.percent !== this.props.percent || 
            nextProps.color !== this.props.color || 
            nextProps.maxLevel !== this.props.maxLevel
    }
}

export default Bar
