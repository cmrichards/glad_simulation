import React, { Component } from 'react'
import { computed } from "mobx"
import { observer } from 'mobx-react'
import Slider from 'rc-slider'
import { allUnitTypes, allTeams } from "../lib/gameInfo"
import { allAis, findAi } from "../ais"

import 'rc-slider/assets/index.css';

@observer
export default class EditUnitForm extends Component {

    updateUnitType = (unitTypeId) => {
        const { unit } = this.props
        unit.unitType = allUnitTypes.find(ut => ut.id === unitTypeId)
        unit.hp = unit.unitType.hp
        unit.shield = unit.unitType.shield
        this.saveDefault()
    }

    updateTeam = (teamId) => {
        const { unit } = this.props
        unit.team = allTeams.find(t => t.id === teamId)
        this.saveDefault()
    }

    updateAi = (event) => {
        const { unit } = this.props
        unit.ai = findAi(parseInt(event.target.value))
        this.saveDefault()
    }

    updateXPosition = (diff) => {
        const { unit, board } = this.props
        unit.setInitialX(unit.x += diff)
        board.setDistanceToSelectedUnit()
    }

    updateYPosition = (diff) => {
        const { unit, board } = this.props
        unit.setInitialY(unit.y += diff)
        board.setDistanceToSelectedUnit()
    }

    saveDefault() {
        const { unit, saveBotDefaults } = this.props
        saveBotDefaults({ type: unit.unitType, team: unit.team, ai: unit.ai })
    }

    render() {
        const { unit, board,deleteUnit, unselectUnit } = this.props
        if (!unit) return null
        const extraClass = unit.x > (0.6 * board.width) ? "left_side" : "right_side"
        return (
            <div className={"editUnitForm "+extraClass}>
                <button onClick={() => deleteUnit(unit)} className="btn btn-danger btn-block" style={{ marginTop: 20 }}>
                    Delete Bot
                </button>
                {
                        allUnitTypes.map(
                            t => <label 
                                    key={t.id} 
                                    className={"unitType "+(t.id === unit.unitType.id ? "selected" : "")}
                                    onClick={()=>this.updateUnitType(t.id)} 
                                    >
                                    { t.short }
                                 </label>
                        )
                }
                {
                        allTeams.map(
                            t => <label 
                                    key={t.id} 
                                    style={{ backgroundColor: t.colour }}
                                    className={"teamSelect "+(t.id === unit.team.id ? "selectedTeam" : "")}
                                    onClick={()=>this.updateTeam(t.id)} 
                                    >
                                    { t.name }
                                 </label>
                        )
                }
                <select className="ai-select form-control form-control-lg" ref="ai" value={unit.ai.id} onChange={this.updateAi}>
                    {
                        allAis.map(
                            t => <option key={t.id} value={t.id}>AI: {t.name}</option>
                        )
                    }
                </select>

                {/* <p>
                    <span style={{ paddingRight: 60 }} className="coordinate">Shield: {unit.shield}</span>
                    <span className="coordinate">HP: {Math.round(unit.hp)}</span>
                </p> */}

                <div style={{ marginTop: 20, marginBottom: 50 }}>
                    Shield: { Math.round(unit.shield) }
                    <Slider 
                        min={0} max={unit.unitType.shield} 
                        defaultValue={unit.shield} 
                        onChange={(value) => unit.setInitialShield(value)}
                        />
                </div>
                <div style={{ marginTop: 10, marginBottom: 50 }}>
                    Health: { Math.round(unit.hp) }
                    <Slider 
                        className={unit.team.name}
                        min={0} max={unit.unitType.hp} 
                        defaultValue={unit.hp} 
                        onChange={(value) => unit.setInitialHp(value) }
                        />
                </div>
                <p>
                    <span style={{ paddingRight: 110 }} className="coordinate">X: {Math.round(unit.x)}</span>
                    <span className="coordinate">Y: {Math.round(unit.y)}</span>
                </p>

                <button className="btn btn-primary btn-lg" onClick={() => this.updateXPosition(5)} style={{ marginRight: 20 }}>
                    +
                </button>
                <button className="btn btn-primary btn-lg" onClick={() => this.updateXPosition(-5) } style={{ marginRight: 20 }}>
                    -
                </button>
                <button className="btn btn-primary btn-lg" onClick={() => this.updateYPosition(5) } style={{ marginRight: 20 }}>
                    +
                </button>
                <button className="btn btn-primary btn-lg" onClick={() => this.updateYPosition(-5) } style={{ marginRight: 0 }}>
                    -
                </button>

                <button onClick={unselectUnit} className="btn btn-default btn-lg btn-block" style={{ marginTop: 20 }}>
                    Close
                </button>
            </div>
        )
    }

}