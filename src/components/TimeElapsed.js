import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { formatTime } from "../lib/TickUtils"

@observer
export default class TimeElapsed extends Component {

    render() {
        const { seconds } = this.props
        return (
            <div className="timeElapsed">
                {formatTime(seconds)}
            </div>
        )
    }

}