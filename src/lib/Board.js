// @flow
import { IObservableArray, observable, computed } from 'mobx'
import _ from "lodash"
import Unit from "./Unit"
import { createUnit } from "./Unit"
import Bullet from "./Bullet"

class Board {
    deadUnits: Array<Unit> 
    @observable.shallow units: IObservableArray<Unit> = [];
    @observable.shallow bullets: IObservableArray<Bullet> = [];
    @observable width: number = window.innerWidth;
    @observable height: number = window.innerHeight;

    constructor() {
        this.deadUnits = []
    }

    // Place units relative to the center of the board
    addUnitsToBoard(config: Object) {
        const maxX = _.max(_.map(config.units, u => u.x));
        const maxY = _.max(_.map(config.units, u => u.y));
        const originX = (this.width / 2.0) - (maxX / 2.0);
        const originY = (this.height / 2.0) - (maxY / 2.0) - 10;
        // console.log(config.units)
        for (let unitConfig of config.units) {
            let unit = createUnit({ ...unitConfig, ...{ x: unitConfig.x + originX, y: unitConfig.y + originY } })
            this.addUnit(unit)
        }
    }

    addUnit(unit: Unit) {
        this.units.push(unit);
    }

    removeBullet(bullet: Bullet) {
        // this.bullets.splice( this.bullets.indexOf(bullet), 1 );
        this.bullets.remove(bullet);
    }

    unitIsAlive(unit: Unit) {
        return !unit.dead;
        // return _.includes(this.units, unit)
    }

    // Killed units are brought back to life when the map is reset
    killUnit = (unit: Unit) => {
        unit.dead = true; // used when other objects reference this unit
        if (unit == this.selectedUnit) {
            this.clearDistanceRings();
        }
        this.deadUnits.push(unit)
        this.units.remove(unit)
    }

    deleteUnit = (unit: Unit) => { 
        unit.dead = true; // used when other objects reference this unit
        this.units.remove(unit)
    }

    @computed get selectedUnit(): ?Unit {
        return this.units.filter(u => u.showDistanceRings)[0]
    }

    hasSelectedUnit(): boolean {
        return this.selectedUnit !== undefined
    }

    clickOnUnit = (unit: Unit) => {
        let showingDistanceRings = unit.showDistanceRings
        this.clearDistanceRings()
        unit.showDistanceRings = !showingDistanceRings
        this.setDistanceToSelectedUnit()
    }

    clearDistanceRings = () => {
        this.units.forEach(u => {
            u.showDistanceRings = false
            u.distanceToSelectedUnit = 0
        })
    }

    // If a unit is selected then set the distance to the selected unit for each unit
    // so we can indicate it in the view
    setDistanceToSelectedUnit() {
        let unit = this.selectedUnit
        if (unit) {
            this.units
                .forEach(u => {
                    if(u !== unit)
                        u.distanceToSelectedUnit = unit.distance(u)
                })
        } else {
            // if selected unit has died then reset all distances
            this.units.forEach(u => u.hideDistanceRings())
        }
    }

}

export default Board
