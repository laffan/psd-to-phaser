/*
- `possibleStates` is an object whose keys refer to the state name and whose values are instances of the `State` class (or subclasses). The class assigns the `stateMachine` property on each instance so they can call `this.stateMachine.transition` whenever they want to trigger a transition.
- `stateArgs` is a list of arguments passed to the `enter` and `execute` functions. This allows us to pass commonly-used values (such as a sprite object or current Phaser Scene) to the state methods.
*/
class StateMachine {
    constructor(initialState, possibleStates, stateArgs=[]) {
        this.initialState = initialState
        this.possibleStates = possibleStates
        this.stateArgs = stateArgs
        this.state = null

        // state instances get access to the state machine via `this.stateMachine`
        // Note: "Object.values() returns an array of a given object's own enumerable property values" (MDN)
        for(const state of Object.values(this.possibleStates)) {
            state.stateMachine = this
        }
    }

    step() {
        // this method should be called in the Scene's update() loop
        // on the first step, the state is null and needs to be initialized
        if(this.state === null) {
            this.state = this.initialState
            this.possibleStates[this.state].enter(...this.stateArgs)
            // note: "Spread syntax allows an iterable such as an array expression to be expanded in places where zero or more arguments or elements are expected." (MDN)
            // translation: the `.enter(...this.stateArgs)` statement allows us to pass an arbitrary number of arguments into the .enter method 
        }

        // run the current state's execute method
        this.possibleStates[this.state].execute(...this.stateArgs)
    }

    transition(newState, ...enterArgs) {
        this.state = newState
        this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs)
    }
}


// parent class structure for all `State` subclasses
class State {
    enter() {
        // this code happens *once* when we enter the state
    }
    execute() {
        // this code happens each update step (ie every frame)
    }
}

export {StateMachine, State};