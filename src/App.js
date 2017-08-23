// @flow
import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import firebase from "firebase"
import './App.css'

import BoardView from "./components/BoardView"
import GameControls from "./components/GameControls"
import TopMenu from "./components/TopMenu"
import Fps from "./components/Fps"
import TimeElapsed from "./components/TimeElapsed"
import ScenarioChooser from "./components/ScenarioChooser"
import EditUnitForm from "./components/EditUnitForm"
import CloneMapForm from "./components/CloneMapForm"

import { createUnit } from "./lib/Unit"
import Game from "./lib/Game"
import { createConfig } from "./maps"
import { unitTypes, teams } from "./lib/gameInfo"
import { findAi, ais } from "./ais"

@observer
class App extends Component {

    initialMapId: number
    defaultsForNewBots: Object
    firebaseConnection: Object
    @observable.ref currentMap: Object
    @observable showCloneMapForm: boolean
    @observable.ref game: Game
    @observable.ref maps: Array<Object>

    constructor(props: Object) {
        super(props);
        this.maps = []
        this.setupFirebase()
        this.loadMaps()
        this.defaultsForNewBots = {}
        this.showCloneMapForm = false
        if (window.location.hash) {
            this.initialMapId = window.location.hash.replace("#", "")
        }
    }

    // Setup connection to FirebaseDB to load the Maps
    setupFirebase() {
        var config = {
            apiKey: "",
            authDomain: "railsproject-167109.firebaseapp.com",
            databaseURL: "https://railsproject-167109.firebaseio.com",
            projectId: "railsproject-167109",
            storageBucket: "railsproject-167109.appspot.com",
            messagingSenderId: "111385380920"
        };
        this.firebaseConnection = firebase.initializeApp(config);
        this.database = firebase.database()
        this.mapsRef = this.database.ref("maps")
    }

    // Load all the maps from Firebase
    loadMaps() {
        this.mapsRef.on("value", snapshot => {
            this.maps = Object.entries(snapshot.val()).map(([key, val]) => {
                val.id = key
                return val
            })
            if (!this.currentMap) {
                this.currentMap = this.initialMapId ? this.maps.filter(m => m.id == this.initialMapId)[0] : this.maps[0]
                this.createNewGame()
                this.updateWindowDimensions()
            }
        })
    }

    selectMap = (map: Object) => {
        window.location.hash = "#" + map.id
        this.currentMap = map
        let config = createConfig(this.currentMap)
        this.game = new Game(config)
    }

    createNewGame = () => {
        this.game = new Game(createConfig(this.currentMap), 0)
    }

    reset = ({ jumpToTickNumber = 0 }: { jumpToTickNumber: number} = {}) => {
        this.game.resetBoard()
        this.game.jumpForwardToTick(jumpToTickNumber)
    }

    // User has clicked an empty space on the board
    boardClick = (x: number, y: number) => {
        this.game.board.clearDistanceRings()
        // TODO: Cleanup. Hides then shows the form due to react state issue in the form.
        setTimeout(() => {
            let unit = createUnit({
                ai: findAi(ais.justAttack), 
                // Round to nearest coordinate divisible by 5
                x: Math.round(x/5) * 5,  
                y: Math.round(y/5) * 5, 
                team: teams.red, 
                type: unitTypes.assault,
                ...this.defaultsForNewBots
            })
            this.game.board.addUnit(unit)
            this.game.board.clickOnUnit(unit)
        }, 50)
    }

    clickOnUnit = (unit: Unit) => {
        if (unit !== this.game.board.selectedUnit) {
            this.game.board.clearDistanceRings()
        }
        // TODO: Cleanup. Hides then shows the form due to react state issue in the form.
        setTimeout(() => {
            this.game.board.clickOnUnit(unit)
        }, 50)
    }

    saveBotDefaults = (defaults: Object): void => {
        this.defaultsForNewBots = defaults
    }

    startCloning = () => {
        this.game.pause()
        this.showCloneMapForm = true
    }

    cancelCloning = () => {
        this.showCloneMapForm = false
    }

    cloneMap = (name: string, atCurrentTime: boolean = false) => {
        let mapConfig = this.game.generateMapConfig({ name, atCurrentTime: atCurrentTime })
        var newMapRef = this.mapsRef.push();
        newMapRef.set(mapConfig);
        this.cancelCloning()
    }
    cloneMapAtCurrentTime = (name) => { this.cloneMap(name, true) }

    saveMap = () => {
        this.database.ref("maps/" + this.currentMap.id).set({
            ...this.game.generateMapConfig({ atCurrentTime: false }),
            name: this.currentMap.name
        })
        this.cancelCloning()
    }

    render() {
        // Show nothing if maps are not loaded
        if (!this.game) return null;

        const { board } = this.game
        return (
            <div className="App">
                <ScenarioChooser
                    currentMap={this.currentMap}
                    selectMap={this.selectMap}
                    maps={this.maps} />
                <CloneMapForm
                    cloneMap={this.cloneMap}
                    cloneMapAtCurrentTime={this.cloneMapAtCurrentTime}
                    show={this.showCloneMapForm}
                    cancelCloning={this.cancelCloning}
                    map={this.currentMap}
                    seconds={this.game.timeElapsedInSeconds} />
                <EditUnitForm
                    saveBotDefaults={this.saveBotDefaults}
                    board={board}
                    unit={board.selectedUnit}
                    unselectUnit={board.clearDistanceRings}
                    deleteUnit={board.deleteUnit} />
                <Fps game={this.game} />
                <BoardView
                    board={board}
                    clickOnUnit={this.clickOnUnit}
                    boardClick={this.boardClick} />
                <TimeElapsed
                    seconds={this.game.timeElapsedInSeconds} />
                <GameControls
                    game={this.game}
                    reset={this.reset} />
                <TopMenu
                    canSave={!this.currentMap.locked}
                    saveMap={this.saveMap}
                    startCloning={this.startCloning} />
            </div>
        );
    }

    // Resize the board when the screen is resized (mobile changed from portrait to landscape)
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', () => this.updateWindowDimensions());
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.updateWindowDimensions());
    }

    updateWindowDimensions() {
        if (this.game) {
            this.game.board.width = window.innerWidth
            this.game.board.height = window.innerHeight
        }
    }
}

export default App;
