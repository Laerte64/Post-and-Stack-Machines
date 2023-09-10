import { Container, Box, Transition } from "./flow"
import { DataPack, QueuePack, StackPack } from "./data"

type _Event = () => undefined

type EventPack = [_Event, _Event, _Event, _Event, _Event]

class State <T extends DataPack>
{
    dataPack: T
    box: Box
    machine: FlowMachine<T>

    constructor(dataPack: T, box: Box, machine: FlowMachine<T>)
    {
        this.dataPack = dataPack
        this.box = box
        this.machine = machine
    }

    copy(): State<T>
    {
        return new State<T>(this.dataPack.copy(), this.box, this.machine)
    }

    doStep(): State<T>[]
    {
        let newStates: State<T>[] = []
        const type = this.box.type
        if (type === "Start")
        {
            if(this.box.transitions.length > 0)
            {
                this.box = this.box.transitions[0].target
                newStates.push(this)
            }
        }
        if (type === "Read")
        {
            let index = this.box.index
            let symbol = this.dataPack.pull(index)
            let transition = this.box.transitions.find(transition => transition.symbol === symbol)
            if (transition !== undefined)
            {
                this.box = transition.target
                newStates.push(this)
            }
        }
        else if (type === "Write")
        {
            let index = this.box.index
            let transition = this.box.transitions.find(transition => transition.symbol != "\\epsilon")
            if (transition !== undefined)
            {
                this.dataPack.push(index, transition.symbol)
                this.box = transition.target
                newStates.push(this)
            }
        }
        else if (type === "Accept")
        {
            throw "Accept"
        }
        else if (type === "Reject")
        {
            throw "Reject"
        }
        else
        {
            throw "Unvalid Box Type"
        }
        return newStates
    }

    static propagate<T extends DataPack>(states: State<T>[]): State<T>[]
    {
        let lastRound: State<T>[]
        let thisRound = [...states]
        do
        {
            lastRound = [...thisRound]
            lastRound.forEach(state => {
                let box = state.box
                box.transitions.forEach(transition => {
                    if(transition.symbol === "\\epsilon")
                    {
                        let newState = state.copy()
                        newState.box = transition.target
                        let copy = thisRound.find(state => state.box === newState.box && DataPack.isEquivalent<T>(state.dataPack, newState.dataPack))
                        if (copy === undefined)
                        {
                            thisRound.push(newState)
                        }
                    }
                });
            });
        }
        while(thisRound.length > lastRound.length)
        return lastRound
    }
}

abstract class FlowMachine <T extends DataPack>
{
    start: State<T>
    container: Container
    states: State<T>[]
    events: EventPack

    constructor(dataPack: T, start: Box, events: EventPack)
    {
        this.events = events
        this.container = start.container
    
        this.start = new State<T>(dataPack, start, this)
        this.states = [this.start.copy()]
    }

    restart()
    {
        this.states = [this.start.copy()]
    }

    setStack(piles: number)
    {
        if (piles <= 0)
        {
            return
        }
        while (this.start.dataPack.data.length > piles)
        {
            this.start.dataPack.data.pop()
        }
        while (this.start.dataPack.data.length < piles)
        {
            this.start.dataPack.data.push([])
        }   
    }

    loadLanguage(input: string[])
    {
        this.start.dataPack.data[0] = [...input]
    }

    doStep()
    {
        try
        {
            let newStates = this.states.reduce((acc, state) => {
            let resultStates = state.doStep()
            acc.concat(resultStates)
            return acc
            }, [] as State<T>[])
            newStates = State.propagate<T>(newStates)
        }
        catch (exception)
        {
            if (exception == "Accept")
            {
        
            }
            else if (exception == "Reject")
            {
        
            }
            else
            {
                console.error("Error: ", exception);
            }
        }
    }
}

class PostMachine extends FlowMachine <QueuePack>
{
    constructor(numQueues: number, start: Box, events: EventPack)
    {
        const queuePack = new QueuePack(numQueues)
        super(queuePack, start, events)
    }
}

class StackMachine extends FlowMachine <StackPack>
{
    constructor(numStacks: number, start: Box, events: EventPack)
    {
        const stackPack = new StackPack(numStacks)
        super(stackPack, start, events)
    }
}