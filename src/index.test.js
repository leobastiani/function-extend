jest.useFakeTimers()

const {
  prependFunction,
  appendFunction,
  prependFunctionAsync,
  appendFunctionAsync,
  appendToFunction,
  prependToFunction,
  appendToAsyncFunction,
  prependToAsyncFunction
} = require('./')

const { isPromisePending } = require('promise-status-async')

it('methods are defined', () => {
  expect(prependFunction).toBeInstanceOf(Function)
  expect(appendFunction).toBeInstanceOf(Function)
  expect(prependFunctionAsync).toBeInstanceOf(Function)
  expect(appendFunctionAsync).toBeInstanceOf(Function)
  expect(appendToFunction).toBeInstanceOf(Function)
  expect(prependToFunction).toBeInstanceOf(Function)
  expect(appendToAsyncFunction).toBeInstanceOf(Function)
  expect(prependToAsyncFunction).toBeInstanceOf(Function)
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

    appendToAsyncFunction(object, 'first', second)

    expect(await runTimers(object.first(4, 5, 6))).toBe(1)
    expect(object.i).toBe(602)
  })

  it('prepends', async () => {
    const object = {
      i: 0,
      first
    }
    await runTimers(object.first(1, 2, 3))

    prependToAsyncFunction(object, 'first', second)

    expect(await runTimers(object.first(4, 5, 6))).toBe(1)
    expect(object.i).toBe(736)
  })
})
