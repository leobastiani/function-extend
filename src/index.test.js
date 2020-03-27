jest.useFakeTimers()

const {
  prependFunction,
  appendFunction,
  wrapFunction,
  appendToFunction,
  prependToFunction,
  wrapToFunction,
  Stop
} = require('./')

const { isPromisePending } = require('promise-status-async')

it('methods are defined', () => {
  expect(prependFunction).toBeInstanceOf(Function)
  expect(appendFunction).toBeInstanceOf(Function)
  expect(wrapFunction).toBeInstanceOf(Function)
  expect(appendToFunction).toBeInstanceOf(Function)
  expect(prependToFunction).toBeInstanceOf(Function)
  expect(wrapToFunction).toBeInstanceOf(Function)
  expect(Stop).toBeInstanceOf(Function)
})

describe('sync', () => {
  const first = function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a
    this.i *= b
    this.i += c
    return 1
  }

  const second = function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a * 2
    this.i *= b * 2
    this.i += c * 2
    return 2
  }

  const three = function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a * 3
    this.i *= b * 3
    this.i += c * 3
    return 3
  }

  it('appends', () => {
    const object = {
      i: 0,
      first
    }
    object.first(1, 2, 3)

    appendToFunction(object, 'first', second)

    expect(object.first(4, 5, 6)).toBe(1)
    expect(object.i).toBe(602)
  })

  it('prepends', () => {
    const object = {
      i: 0,
      first
    }
    object.first(1, 2, 3)

    prependToFunction(object, 'first', second)

    expect(object.first(4, 5, 6)).toBe(1)
    expect(object.i).toBe(736)
  })

  it('wrap', () => {
    const object = {
      i: 0,
      first
    }
    object.first(1, 2, 3)

    wrapToFunction(object, 'first', second, three)

    expect(object.first(4, 5, 6)).toBe(1)
    expect(object.i).toBe(11238)
  })
})

describe('async', () => {
  const sleep = delay => new Promise(resolve => setTimeout(resolve, delay * 10))

  const first = async function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a
    await sleep(this.i)
    this.i *= b
    await sleep(this.i)
    this.i += c
    await sleep(this.i)
    return 1
  }

  const second = async function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a * 2
    await sleep(this.i)
    this.i *= b * 2
    await sleep(this.i)
    this.i += c * 2
    await sleep(this.i)
    return 2
  }

  const three = async function (a, b, c) {
    expect(this).toHaveProperty('i')
    this.i += a * 3
    await sleep(this.i)
    this.i *= b * 3
    await sleep(this.i)
    this.i += c * 3
    await sleep(this.i)
    return 3
  }

  const runTimers = async (promise, ...args) => {
    while (await isPromisePending(promise)) {
      jest.runOnlyPendingTimers()
    }
    return promise
  }

  it('appends', async () => {
    const object = {
      i: 0,
      first
    }
    await runTimers(object.first(1, 2, 3))

    appendToFunction(object, 'first', second)

    expect(await runTimers(object.first(4, 5, 6))).toBe(1)
    expect(object.i).toBe(602)
  })

  it('prepends', async () => {
    const object = {
      i: 0,
      first
    }
    await runTimers(object.first(1, 2, 3))

    prependToFunction(object, 'first', second)

    expect(await runTimers(object.first(4, 5, 6))).toBe(1)
    expect(object.i).toBe(736)
  })

  it('wrap', async () => {
    const object = {
      i: 0,
      first
    }
    await runTimers(object.first(1, 2, 3))

    wrapToFunction(object, 'first', second, three)

    expect(await runTimers(object.first(4, 5, 6))).toBe(1)
    expect(object.i).toBe(11238)
  })
})

const object = {}
describe.each`
  type        | stop                | result
  ${'Any'}    | ${null}             | ${undefined}
  ${'Class'}  | ${Stop}             | ${undefined}
  ${'Object'} | ${new Stop(object)} | ${object}
`('stops as $type', ({ stop, result }) => {
  it('appends', () => {
    const first = () => stop
    const second = jest.fn()

    const ret = appendFunction(first, second)()

    expect(second).toHaveBeenCalledTimes(stop === null ? 1 : 0)
    if (result) {
      expect(ret === result).toBe(true)
    }
  })

  it('prepends', () => {
    const first = jest.fn()
    const second = () => stop

    const ret = prependFunction(first, second)()

    expect(first).toHaveBeenCalledTimes(stop === null ? 1 : 0)
    if (result) {
      expect(ret === result).toBe(true)
    }
  })
})

describe('keep function keys', () => {
  class Funktion extends Function {}
  const fn = new Funktion('return 1')
  fn.key1 = 1
  fn.key2 = 2

  it('appends', () => {
    const newFn = appendFunction(fn, () => {})
    expect(Object.keys(newFn)).toEqual(['key1', 'key2'])
    expect(fn).toBeInstanceOf(Funktion)
    expect(newFn()).toBe(1)
  })

  it('prepends', () => {
    const newFn = prependFunction(fn, () => {})
    expect(Object.keys(newFn)).toEqual(['key1', 'key2'])
    expect(fn).toBeInstanceOf(Funktion)
    expect(newFn()).toBe(1)
  })
})

it('works with [].push', () => {
  const array = []
  const pushCallback = jest.fn()
  appendToFunction(array, 'push', pushCallback)
  array.push(1)
  expect(array).toEqual([1])
  expect(pushCallback).toHaveBeenCalled()
})
