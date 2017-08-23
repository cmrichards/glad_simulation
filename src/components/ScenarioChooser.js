import React, { Component } from "react"

// import { findMap } from "../maps"

export default class ScenarioChooser extends Component {
    render() {
        const { maps, selectMap, currentMap } = this.props
        return (
            <div className="scenarioChooser">
                <ul>
                    {
                        maps.map((map, i) =>
                            <li key={i} onClick={() => selectMap(map)} className={currentMap == map ? "selected" : ""}>
                                { map.locked && <i className="fa fa-lock" style={{ marginRight: 10 }}/> }
                                { map.name }
                            </li>
                        )
                    }
                </ul>
            </div>
        )
    }
}
 