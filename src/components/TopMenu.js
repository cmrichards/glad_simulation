import { observer } from 'mobx-react'
import React, { Component } from "react"

@observer
export default class TopMenu extends Component {

    render() {
        const { canSave, saveMap, startCloning } = this.props
        return (
            <div className="topMenu">
                <button
                    style={!canSave ? { opacity: 0.2 } : {}}
                    onClick={canSave ? saveMap : () => alert("Cannot save a locked map. Clone first")} >
                    <i className="fa fa-floppy-o"></i>
                    &nbsp; Save
                </button>
                <button onClick={startCloning}>
                    <i className="fa fa-clone"></i>
                    &nbsp; Clone
                </button>
            </div>
        )

    }

}