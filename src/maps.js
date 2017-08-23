// @flow
import _ from "lodash"
import { findAi, ais } from "./ais"
import { allUnitTypes, unitTypes, teams } from "./lib/gameInfo"
import { metersToPixel } from "./lib/TickUtils"

function randomUnit() {
    return _.sample(unitTypes)
}

function findUnitType(id) {
    return allUnitTypes.find(ut => ut.id === id)
}

// combine maps object with setup object
export function createConfig(map: Object): Object {
    let mapUnits = _.isFunction(map.units) ? map.units() : (map.units || [])
    let config = {
        map: map,
        units: mapUnits.map(unit => {
            let ai = findAi(unit.ai)
            let unitType = findUnitType(unit.type) || unitTypes.assault

            switch (unit.team) {
                case 0:
                    var team = teams.red
                    break;
                case 1:
                    var team = teams.blue
                    break;
                default:
                    var team = unit.red
                    break;
            }
            return {
                ...unit, ai: ai, team: team, type: unitType,  x: metersToPixel(unit.x), y: metersToPixel((unit.y))
            }
        })
    }
    return config
}