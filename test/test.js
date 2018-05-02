const expect = require('chai').expect;
const assert = require('chai').assert
const ak = require('../ak-en')


describe('deriveWord()', () => {
  it('should retrieve the word from given sentence by signal', () => {
    const STR0 = '';
    const STR1 = 'this is #hello world';
    const STR2 = 'this is #hello-world times';
    const STR3 = 'this is [hello world]';
    const STR4 = 'this is hello world';

    const ERR_MSG = 'NOSIGNAL';

    expect(ak.deriveWord(STR0)).to.deep.equal({ word: ERR_MSG, sentence: STR0 })
    expect(ak.deriveWord(STR1)).to.deep.equal({ word: 'hello', sentence: STR1 })
    expect(ak.deriveWord(STR2)).to.deep.equal({ word: 'hello-world', sentence: STR2 })
    expect(ak.deriveWord(STR3)).to.deep.equal({ word: 'hello world', sentence: STR3 })
    expect(ak.deriveWord(STR4)).to.deep.equal({ word: ERR_MSG, sentence: STR4 })

  });
});

describe('retrieveMeanings()', () => {
  it('should destruct all meanings from the give list of obejct ', () => {
    const LOS0 = []
    const LOS1 = [{ meanings: ['a'] }, { meanings: ['b'], senses: [] }]
    const LOS2 = [{ meanings: ['c'] }, { senses: LOS1 }]

    assert.deepEqual(ak.retrieveMeanings(LOS0), [])
    assert.deepEqual(ak.retrieveMeanings(LOS1), ['a', 'b'])
    assert.deepEqual(ak.retrieveMeanings(LOS2), ['c', 'a', 'b'])
  });

});