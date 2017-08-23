import React, { Component } from "react"
import ReactModal from "react-modal"
import { observer } from 'mobx-react'
import { formatTime } from "../lib/TickUtils"

@observer
export default class CloneMapForm extends Component {

    render() {
        const { show, cancelCloning, seconds, cloneMap, cloneMapAtCurrentTime } = this.props
        return (
            <ReactModal
                isOpen={show}
                contentLabel="Cloning Map"
                onAfterOpen={() => this.name.focus()}
                onRequestClose={cancelCloning} >

                <h3>Cloning Map</h3>

                <input
                    ref={(input) => this.name = input}
                    style={{ marginBottom: 20 }}
                    type="text"
                    className="form-control"
                    placeholder="Enter New Map Name"
                    required={true}
                />

                <button className="btn btn-primary" onClick={() => cloneMap(this.name.value)}>
                    Clone Current Map at Time = 0 seconds
                </button>

                {seconds > 0 &&
                    <button className="btn btn-primary" onClick={() => cloneMapAtCurrentTime(this.name.value)} style={{ marginLeft: 20 }} >
                        Clone Current Map at Time = {formatTime(seconds)}
                    </button>}

                <button className="btn btn-default" onClick={cancelCloning} style={{ marginLeft: 20 }}>
                    Cancel
                </button>
            </ReactModal>
        )
    }
}