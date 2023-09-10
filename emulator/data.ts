export abstract class DataPack
{
    data: string[][]

    constructor(numData: number)
    {
        if (numData === 0)
        {
            throw new Error('Value must be non-zero.');
        }
        this.data = []
        for (let i = 0; i < numData; i++)
        {
            this.data.push([]);
        }
    }

    push(id: number, symbol: string)
    {
        this.data[id].push(symbol)
    }

    abstract pull(id: number): string | undefined

    abstract copy<T extends DataPack>(): T

    static isEquivalent<T extends DataPack>(pack1: T, pack2: T): boolean
    {
        let data1 = pack1.data
        let data2 = pack2.data
        if (data1.length !== data2.length)
        {
            return false
        }
        for (let i = 0; i < data1.length; i++)
        {
            let array1 = data1[i]
            let array2 = data2[i]
            if(array1.length !== array2.length)
            {
                return false
            }
            for (let j = 0; j < array1.length; j++)
            {
                if(array1[j] !== array2[j])
                {
                    return false
                }
            }
        }
        return true
    }
}

export class QueuePack extends DataPack
{
    pull(id: number): string | undefined
    {
        return this.data[id].shift()
    }

    copy<T extends DataPack>(): T
    {
        let newData = this.data.map(pile => [...pile])
        let newPack = new QueuePack(newData.length)
        newPack.data = newData
        return newPack as T
    }
}

export class StackPack extends DataPack
{
    pull(id: number): string | undefined
    {
        return this.data[id].pop();
    }

    copy<T extends DataPack>(): T
    {
        let newData = this.data.map(pile => [...pile])
        let newPack = new StackPack(newData.length)
        newPack.data = newData
        return newPack as T
    }
}