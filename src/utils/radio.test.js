//note, I used AI to help write the tests.
import { describe, it, expect } from 'vitest'
import radio from './radio'


const { isValidCallsign, isValidUSCallsign, isValidGlobalCallsign } = radio

describe('isValidCallsign: valid', () => {
  it.each([
    // US 1x2, 1x3, 2x1... formats
    'W1AW', 'K1ABC', 'N1AB', 'KA1ABC', 'WB4XYZ', 'AA1AA', 'AL7XYZ',
    // Non-US that start with A, K, N, W-like letters
    'AM3XYZ', 'AP2ABC', 'NA1ABC',
    // Europe
    'DL1ABC', 'G3ABC', 'F5ABC', 'HB9ABC', 'OZ1ABC', 'EA8ABC', 'SM5ABC', 'S51ABC',
    // Americas / Pacific / Asia
    'VE3ABC', 'PY2ABC', 'LU1ABC', 'JA1ABC', 'VK2ABC', 'ZL1ABC', 'BV1ABC',
    // Digit-first prefixes
    '9A1A', '4X4AA', '2E0ABC', '5B4ABC',
  ])('accepts %s', (call) => {
    expect(isValidCallsign(call)).toBe(true)
  })
})

describe('isValidCallsign: invalid', () => {
  it.each([
    '',               // empty
    'HELLO',          // no digit
    'ABC',            // no digit
    'W1',             // no suffix
    'W1A1',           // digit in suffix
    'W1AW1',          // ends in digit
    '1234',           // all digits
    '12ABC',          // two leading digits, no valid structure
    'AM',             // prefix only
    'AM3',            // no suffix
    'AB1',            // no suffix
    'W1ABCD',         // US suffix too long, not a valid global shape either
    'WWW1AW',         // not a real prefix shape
    'W-1AW',          // punctuation
    'W1 AW',          // internal space
    'W1AW!',          // trailing junk
    "N0CALL",
  ])('rejects "%s"', (call) => {
    expect(isValidCallsign(call)).toBe(false)
  })
})

describe('isValidUSCallsign', () => {
  it.each(['W1AW', 'K1ABC', 'KA1ABC', 'N1AB', 'AA1AA', 'AL1AAA', 'w1aw'])(
    'accepts %s', (call) => {
      expect(isValidUSCallsign(call)).toBe(true)
    })

  it.each([
    'AM1AA',    // A prefix only US for AA-AL
    'AZ1AA',
    'DL1ABC',   // not a US prefix
    'W1ABCD',   // suffix too long
    'W1',
    '',
  ])('rejects %s', (call) => {
    expect(isValidUSCallsign(call)).toBe(false)
  })
})

describe('isValidGlobalCallsign', () => {
  it.each(['DL1ABC', 'JA1ABC', '9A1A', '4X4AA', 'S51ABC', 'AM3XYZ'])(
    'accepts %s', (call) => {
      expect(isValidGlobalCallsign(call)).toBe(true)
    })

  it.each(['', 'HELLO', 'W1', '1234', 'DL1ABCDE', 'DL1AB1'])(
    'rejects %s', (call) => {
      expect(isValidGlobalCallsign(call)).toBe(false)
    })
})

describe('input handling', () => {
  it('is case-insensitive', () => {
    expect(isValidCallsign('w1aw')).toBe(true)
    expect(isValidCallsign('W1aW')).toBe(true)
    expect(isValidCallsign('dl1abc')).toBe(true)
  })

  it.each([undefined, null, 42, {}, []])('returns false for non-string %p', (v) => {
    expect(isValidCallsign(v)).toBe(false)
  })
})

describe('known gaps (not implemented yet)', () => {
  it.todo('accepts portable suffix: W1AW/P')
  it.todo('accepts numeric region suffix: W1AW/7')
  it.todo('accepts prefix-style portable: DL/W1AW')
  it.todo('rejects 1x1 special-event calls like W1A if you decide to')
})