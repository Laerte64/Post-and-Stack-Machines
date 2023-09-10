export abstract class DataPack
{
  data: string[][]

  constructor(numData: number)
  {
    if (numData === 0) {
      throw new Error('Value must be non-zero.');
    }
    this.data = []
    for (let i = 0; i < numData; i++) {
      this.data.push([]);
    }
  }

  push(id: number, symbol: string)
  {
    this.data[id].push(symbol)
  }

  abstract pull(id: number): string | undefined

  abstract copy<T extends DataPack>(): T
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