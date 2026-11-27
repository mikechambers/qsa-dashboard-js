/* MIT License
 *
 * Copyright (c) 2026 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//note, I used AI to help write the tests.
import { describe, it, expect } from 'vitest'
//import radio from '@/utils/radio'

import {isValidCallsign, isValidUSCallsign, isValidGlobalCallsign, normalizeMaidenHeadGrid, isValidMaidenHeadGrid, gridsDiffer} from "@/utils/radio"


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
    // Special events
    'GB100RS', '3DA0RU', 'VI110WIA', 'TM100AB', 'DL2025X', 'II0IARU',
    'OE2025XXX', 'K4A', 'W1A', 'N5N',
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

describe('isValidCallsign: portable', () => {
  it.each([
    'W1AW/P', 'W1AW/M', 'W1AW/MM', 'W1AW/QRP', // suffix
    'W1AW/7', 'W6MSH/1',                        // numeric region suffix
    'DL/W1AW', 'VE3/W6MSH', 'KH6/W1AW',         // prefix
    'DL/W1AW/P', 'EA8/DL1ABC/M',                // prefix and suffix
    'w1aw/p', ' W1AW/P ',                       // case and whitespace
  ])('accepts %s', (call) => {
    expect(isValidCallsign(call)).toBe(true)
  })

  it.each([
    'W1AW/',        // empty suffix
    '/P',           // no base call
    '/W1AW',        // empty prefix
    'W1AW//P',      // empty part
    'ABC/DEF',      // no valid base call
    'P/QRP',        // no valid base call
    'W1AW/K1ABC',   // two base calls
    'DL/W1AW/P/M',  // too many parts
    'W1AW/TOOLONG', // not a prefix or suffix
    'W1AW/P!',      // punctuation
  ])('rejects "%s"', (call) => {
    expect(isValidCallsign(call)).toBe(false)
  })
})

describe('known gaps (not implemented yet)', () => {
  it.todo('rejects 1x1 special-event calls like W1A if you decide to')
})

describe('normalizeMaidenHeadGrid', () => {
    
    // --- 1. Type Safety & Guard Tests ---
    describe('Type Safety & Inputs', () => {
        it('should return an empty string if input is not a string', () => {
            expect(normalizeMaidenHeadGrid(null)).toBe("");
            expect(normalizeMaidenHeadGrid(undefined)).toBe("");
            expect(normalizeMaidenHeadGrid(1234)).toBe("");
            expect(normalizeMaidenHeadGrid({})).toBe("");
        });

        it('should return an empty string for an empty input string', () => {
            expect(normalizeMaidenHeadGrid("")).toBe("");
            expect(normalizeMaidenHeadGrid("   ")).toBe("");
        });
    });

    // --- 2. Length Constraints ---
    describe('Short Strings (< 4 characters)', () => {
        it('should uppercase and return strings shorter than 4 characters without slicing', () => {
            expect(normalizeMaidenHeadGrid("fn")).toBe("FN");
            expect(normalizeMaidenHeadGrid("fn4")).toBe("FN4");
        });
    });

    // --- 3. Standard 4-Character Grids ---
    describe('4-Character Grids', () => {
        it('should convert a lowercase 4-character grid to uppercase', () => {
            expect(normalizeMaidenHeadGrid("fn42")).toBe("FN42");
            expect(normalizeMaidenHeadGrid("em12")).toBe("EM12");
        });

        it('should preserve an already uppercase 4-character grid', () => {
            expect(normalizeMaidenHeadGrid("FN42")).toBe("FN42");
        });

        it('should clean up surrounding whitespace from 4-character grids', () => {
            expect(normalizeMaidenHeadGrid("  fn42  ")).toBe("FN42");
        });
    });

    // --- 4. Standard 6-Character Grids ---
    describe('6-Character Grids (Ham Radio Convention)', () => {
        it('should format a fully lowercase 6-character grid correctly', () => {
            expect(normalizeMaidenHeadGrid("fn42bb")).toBe("FN42bb");
        });

        it('should format a fully uppercase 6-character grid correctly', () => {
            expect(normalizeMaidenHeadGrid("FN42BB")).toBe("FN42bb");
        });

        it('should handle messy mixed-case inputs gracefully', () => {
            expect(normalizeMaidenHeadGrid("fN42bB")).toBe("FN42bb");
            expect(normalizeMaidenHeadGrid("Fn42Bb")).toBe("FN42bb");
        });

        it('should trim whitespace and cleanly isolate indices 4 and 5', () => {
            expect(normalizeMaidenHeadGrid("   em12bb   ")).toBe("EM12bb");
        });
    });

    // --- 5. Structural Edge Cases ---
    describe('Extended or Unusual Formats', () => {
        it('should cut grids longer than 6 characters down to 6', () => {
            // Only 4 and 6 character grids are supported, so an 8 character
            // locator like FN42bbcc is truncated to FN42bb.
            expect(normalizeMaidenHeadGrid("fn42bbcc")).toBe("FN42bb");
            expect(normalizeMaidenHeadGrid("FN42BBCC")).toBe("FN42bb");
        });

        it('should reject 8 character grids as invalid', () => {
            expect(isValidMaidenHeadGrid("FN42bbcc")).toBe(false);
            expect(isValidMaidenHeadGrid("FN42bb22")).toBe(false);
        });
    });
});

describe("gridsDiffer", () => {
  it("tells different places apart", () => {
    expect(gridsDiffer("CM87", "DM79")).toBe(true);
    expect(gridsDiffer("CM87tl", "CM87ss")).toBe(true);
  });

  it("ignores case and how precise each one is", () => {
    expect(gridsDiffer("cm87TL", "CM87tl")).toBe(false);
    expect(gridsDiffer("CM87", "CM87tl")).toBe(false);
    expect(gridsDiffer("CM87tl", "CM87")).toBe(false);
  });

  it("is false without two grids to compare", () => {
    expect(gridsDiffer("CM87", "")).toBe(false);
    expect(gridsDiffer(undefined, "CM87")).toBe(false);
    expect(gridsDiffer("CM87", "nope")).toBe(false);
  });
});
