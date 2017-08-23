// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import DistanceCircles from "./DistanceCircles"
import UnitView from "./UnitView"
import Board from "../lib/Board"
import CanvasBullets from "./CanvasBullets"
import CanvasShootingLevels from "./CanvasShootingLevels"
//import CanvasLines from "./CanvasLines"


@observer
class BoardView extends Component {

    props: {
        board: Board,
        boardClick: mixed,
        clickOnUnit: mixed
    }

    boardClick = (e) => {
        if(this.refs.board === e.target) {
            this.props.boardClick(e.pageX,  e.pageY)
        }
    }

    render() {
        const { clickOnUnit, board: { width, height, units, bullets } } = this.props
        return (
            <div ref="board" className="board" onMouseDown={this.boardClick} style={{ width: width, height: height }}>
                <CanvasBullets width={width} height={height} units={units} bullets={bullets} />
                {/* <CanvasLines width={width} height={height} units={units} />  */}
                <CanvasShootingLevels width={width} height={height} units={units} />
                {units.map(unit => <DistanceCircles key={unit.id} unit={unit} />)}
                {units.map(unit => <UnitView key={unit.id} unit={unit} clickOnUnit={clickOnUnit} />)}
            </div>
        )
    }
}


export default BoardView
