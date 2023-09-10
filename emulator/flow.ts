export class Container
{
    boxes: Box[]

    constructor()
    {
        this.boxes = []
    }

    haveBox(box: Box): boolean
    {
        let clone = this.boxes.find(B => B.isEqual(box))
        return clone != undefined
    }

    addBox(box: Box)
    {
        this.boxes.push(box)
    }

    deleteBox(box: Box)
    {
        if (!this.haveBox(box))
        {
            return;
        }
        this.boxes = this.boxes.filter(B => !B.isEqual(box))
        this.boxes.forEach(B => {B.transitions = B.transitions.filter(T => !T.target.isEqual(box))})
    }
}

export class Box
{
     type: string
    index: number
    transitions: Transition[]
    container: Container
  
    constructor(container: Container, type: string, index: number, transitions: Transition[])
    {
        this.type = type
        this.index = index
        this.transitions = transitions
        this.container = container
        container.addBox(this)
    }

    isEqual(box: Box): boolean
    {
        return this === box
    }

    addTransition(transition: Transition)
    {
        if (!this.container.haveBox(transition.target))
        {
            return
        }
        this.removeTransition(transition)
        this.transitions.push(transition)
    }

    removeTransition(transition: Transition)
    {
        this.transitions = this.transitions.filter(T => !transition.isCopy(T))
    }
}

export class Transition
{
    symbol: string
    target: Box
  
    constructor(symbol: string, target: Box)
    {
        this.symbol = symbol
        this.target = target
    }

    isCopy(transition: Transition): boolean
    {
        let b = this.symbol == transition.symbol
        b = b && this.target === transition.target
        return b
    }
}