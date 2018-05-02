'use strict'
const fs = require('fs')
const assert = require('assert')
const { flattenDeep, flow } = require('lodash')

const API_KEY = 'e6178e8a-9501-4ccc-9b9e-da39171998e1'
const { CollegiateDictionary, LearnersDictionary } = require('mw-dict')
const dict = new CollegiateDictionary(API_KEY)


const is = {
  empty: (item) => item === '',
  notEmpty: (item) => !is.empty(item),
  arr: (arr) => Array.isArray(arr) && arr.length,
  satisfy: (str) => str.includes('#') || str.includes('[')
}

const to = {
  json: (item) => JSON.stringify(item, null, 2)
}

const log = (item) => console.log(item)
const logJson = flow([to.json, log])

// interp. 
// and conjunction with ;
/**
 * @desc derive the keyword which next to symbol # or contained by `[]`  
 * @param {string} sentence given sentence with Signal
 * @returns {Object} { word, sentence }
 */
function deriveWord(sentence) {
  const WORD_POSITION = 1
  let word = is.satisfy(sentence)
    // 前置标识符为 # 或被 [] 包裹
    ? (sentence.match(/#([\w|-]+)/) || sentence.match(/\[(.*)\]/))[WORD_POSITION]
    : 'NOSIGNAL'
  // return `${word};${sentence};\n`
  return { word, sentence, }
}

/**
 * @param {String} query 
 * @returns {Array} senses 的数组集合
 * @example
 * maintain -> senses
 */
async function lookUp(query) {
  try {
    let res = await dict.lookup(query)
    // 返回值可能是多个数组对象，默认取第一个
    // proximity -> [{ word: 'proximity' }, { word: 'proximity fuse' }]
    if(is.arr(res)) return res[0]
  } catch (err) {
    console.error(err)
  }
}

/**
 * 
 * @param {Array} array 
 * @param {Function} fn 
 */
async function serialAsyncMap(collection, fn) {
  let result = [];

  for (let item of collection) {
    result.push(await fn(item));
  }

  return result;
}


// ListOfObject -> ListOfString
// interp. retrieve all meaning of given array
function retrieveMeanings(loo) {
  if (!is.arr(loo)) return [];
  const [first, ...rest] = loo
  let { meanings, senses } = first
  if (is.arr(senses)) {
    return retrieveMeanings(senses)
  }
  // : xxx -> xxx
  
  meanings = meanings
    .map(meaning => meaning.replace(/:/g, '').trim())
    .join()
  return [meanings, ...retrieveMeanings(rest)]
}

async function main(inputFile, outFile) {
  // !!! readFile
  const sentences = fs.readFileSync(inputFile, 'utf8')
    .trim()
    .split('\n')

  //  retrieveWord
  let data = sentences
    .filter(is.notEmpty)
    .map(deriveWord)      // [{word, sentence } , {word, sentence } ]
  const wordList = data.map(item => item.word) // [ListOfWord: String]
  

  // query meanings
  try {
    let explainLists = (await serialAsyncMap(wordList, lookUp))
      .map(item => item.definition)
      .map(retrieveMeanings)
    
    data = data.map((val, idx) => {
      return {
        ...val,
        sense: explainLists[idx].join('/n,'),
      }
    })
  } catch (error) {
    console.error(error);
  }

  // convert to anki format, use '\t' to separate
  data = data.map(item => `${item.word}\t${item.sentence}\t${item.sense};`).join('\n')

  // !!! write files
  fs.writeFileSync(outFile, data, (err) => {
    if (err) throw err;
  })
}

const INPUT_FIle = './words.txt'
const OUTPUT_FILE = './output.txt'

main(INPUT_FIle, OUTPUT_FILE)

module.exports = {
  deriveWord,
  retrieveMeanings
}