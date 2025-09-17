const fs = require('node:fs');
const { response } = require('express');
var { QUESTIONS } = require('../data/questions');
const { time, log } = require('node:console');
const { off } = require('node:process');
const logger = require('../middleware/logger').logger;

Array.prototype.random = function (ignore, offset, range) {
  let start = offset || 0;
  let end = typeof range === 'number' ? Math.min(start + range, this.length) : this.length;
  let randomIndex = Math.floor(Math.random() * (end - start)) + start;
  // check if already ignore all value from offset to range
  // Check if all values from offset to range are already ignored
  // logger.debug(`${start} - ${end}`, { at: new Error });


  while (ignore && ignore.length > 0 && ignore.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * (end - start)) + start;
    if (ignore && Array.from({ length: end - start }, (_, i) => i + start).every(idx => ignore.includes(idx))
    ) {
      // console.log('run random break' + randomIndex);
      break;
    // } else {
      // console.log('run random' + randomIndex);


    }
  }
  // logger.debug(randomIndex, { at: new Error });
  // logger.debug(this[randomIndex], { at: new Error });
  
  // if(!this[randomIndex]){
  //   logger.debug(this, { at: new Error });
  // }
  return { ...this[randomIndex], index: randomIndex };
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let q1;
let q2;

exports.getQuestions = (req, res, next) => {
  if (!q1 || !q2) {
    return nextQuestions(req, res, next);
  }
  res.status(200).json(JSON.stringify({ q1, q2 }));
};

let set = "GOI1";
let notTestedQuestion1 = {};
let notTestedQuestion2 = {}
const numberOfQuestionInRange = 5;

Object.keys(QUESTIONS).forEach((key) => {
  notTestedQuestion1[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
  notTestedQuestion2[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
});

const path = require('path')
const { getFirebaseDB } = require('../config/firebase');


const db = getFirebaseDB();
db.ref('clearStorage').set(JSON.stringify({
  timestamp: new Date().toISOString()
}));
db.ref('QUESTIONS').set(QUESTIONS);

let rightAnswerList = {};

const nextQuestions = (req, res, next) => {
  set = req.params.set ? req.params.set : set;
  if (set === 'all') {
    set = 'GOI1';
  }
  const questionSet1 = notTestedQuestion1[set];
  const rangeIndex = QUESTIONS[set]?.length - notTestedQuestion1[set]?.length;
  const offset = 0;//rangeIndex - (rangeIndex % numberOfQuestionInRange);
  const range = offset + numberOfQuestionInRange;


  if (range - offset > 0) {
    const question1 = questionSet1.random([], offset, range);
    // Remove question1 from notTestedQuestion1[set] array
    notTestedQuestion1[set] = questionSet1.filter((q, idx) => idx !== question1?.index);

    const question1BJp = question1?.BJp || questionSet1.random([question1?.index], offset, range);
    const question1CJp = question1?.CJp || questionSet1.random([question1?.index, question1BJp?.index], offset, range);
    const question1DJp = question1?.DJp || questionSet1.random([question1?.index, question1BJp?.index, question1CJp?.index], offset, range);

    const question1BVi = question1?.BVi || questionSet1.random([question1?.index], offset, range);
    const question1CVi = question1?.CVi || questionSet1.random([question1?.index, question1BVi?.index], offset, range);
    const question1DVi = question1?.DVi || questionSet1.random([question1?.index, question1BVi?.index, question1CVi?.index], offset, range);



    const questionSet2 = notTestedQuestion2[set];
    const question2 = questionSet2.random([], offset, range);
    // Remove question2 from notTestedQuestion2[set] array
    notTestedQuestion2[set] = questionSet2.filter((q, idx) => idx !== question2?.index);
    const question2BJp = question2?.BJp || questionSet2.random([question2?.index], offset, range);
    const question2CJp = question2?.CJp || questionSet2.random([question2?.index, question2BJp?.index], offset, range);
    const question2DJp = question2?.DJp || questionSet2.random([question2?.index, question2BJp?.index, question2CJp?.index], offset, range);

    const question2BVi = question2?.BVi || questionSet2.random([question2?.index], offset, range);
    const question2CVi = question2?.CVi || questionSet2.random([question2?.index, question2BVi?.index], offset, range);
    const question2DVi = question2?.DVi || questionSet2.random([question2?.index, question2BVi?.index, question2CVi?.index], offset, range);

    q1 = {
      ro: question1.ro,
      options: [
        { jp: question1.jp, vi: question1.vi },
        { jp: question1BJp.jp, vi: question1BVi.vi },
        { jp: question1CJp.jp, vi: question1CVi.vi },
        { jp: question1DJp.jp, vi: question1DVi.vi }
      ]
    };
    q2 = {
      ro: question2.ro,
      options: [
        { jp: question2.jp, vi: question2.vi },
        { jp: question2BJp.jp, vi: question2BVi.vi },
        { jp: question2CJp.jp, vi: question2CVi.vi },
        { jp: question2DJp.jp, vi: question2DVi.vi }
      ]
    }
    
    db.ref('questions').set(JSON.stringify({
      timestamp: new Date().toISOString()
    }));

    db.ref('manage').set({
      notTestedQuestion1,
      rightAnswerList: rightAnswerList,
      //timestamp: new Date().toISOString()
    });
    res.status(200).json(JSON.stringify({ q1, q2 }));
  } else {
    console.log("error here");
    console.log(set);

  }

};
exports.nextQuestions = nextQuestions;

let notTestedQuestion1SelfPractice = {};
let notTestedQuestion2SelfPractice = {};


const nextQuestionsSelfPractice = (req, res, next) => {
  const setselfpractice = req.params.set ? req.params.set : 'HIRAGANA';
  
  // logger.debug(`setselfpractice: ${setselfpractice}`, { at: new Error });

  const setselfpracticeQuestionListName = setselfpractice?.split('-')?.[0]
  const setselfpracticeQuestionStudent = setselfpractice?.split('-')?.[1] + setselfpractice?.split('-')?.[2]


  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]) {
    notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent] = {}
    notTestedQuestion2SelfPractice[setselfpracticeQuestionStudent] = {}
  }
  // console.log(notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]);
  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] || notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]?.[setselfpracticeQuestionListName]?.length === 0) {
    notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = JSON.parse(JSON.stringify(QUESTIONS[setselfpracticeQuestionListName]?.sort((a, b) => a.jp.length - b.jp.length)))
    notTestedQuestion2SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = JSON.parse(JSON.stringify(QUESTIONS[setselfpracticeQuestionListName].sort((a, b) => a.jp.length - b.jp.length)))
  }
  // logger.debug(`notTestedQuestion1SelfPractice-${setselfpracticeQuestionListName}: ${notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]?.[setselfpracticeQuestionListName]?.length}`, { at: new Error });

  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]) {
    // return 400
    console.log('Invalid self practice set: ' + setselfpractice);
    return res.status(400).json({ error: 'Invalid self practice set' });
  }
  const questionSet1 = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName];
  const questionSet2 = notTestedQuestion2SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName];


  const allThisSetLength = QUESTIONS[setselfpracticeQuestionListName]?.length;
  const numberOfQuestionIgnoreRangeHiraKata = numberOfQuestionInRange
  // const numberOfQuestionIgnoreRangeHiraKata = setselfpracticeQuestionListName === 'HIRAGANA' || setselfpracticeQuestionListName === 'KATAKANA' ? allThisSetLength : numberOfQuestionInRange
  const notTestedQuestion1SelfPracticeLength = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName]?.length
  const rangeIndex = allThisSetLength - notTestedQuestion1SelfPracticeLength;
  const offset = 0;//rangeIndex - (rangeIndex % numberOfQuestionIgnoreRangeHiraKata);
  const range = numberOfQuestionIgnoreRangeHiraKata;
  // logger offser and range
  // logger.debug(`offset: ${offset}, range: ${range}`, { at: new Error });

  const question1 = questionSet1.random([], offset, range);
  // Remove question1 from notTestedQuestion1[setselfpracticeQuestionStudent] array
  notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName].filter((q, idx) => idx !== question1?.index);
  const question1BJp = question1?.BJp || questionSet1.random([question1?.index], offset, range);
  const question1CJp = question1?.CJp || questionSet1.random([question1?.index, question1BJp?.index], offset, range);
  const question1DJp = question1?.DJp || questionSet1.random([question1?.index, question1BJp?.index, question1CJp?.index], offset, range);

  const question1BVi = question1?.BVi || questionSet1.random([question1?.index], offset, range);
  const question1CVi = question1?.CVi || questionSet1.random([question1?.index, question1BVi?.index], offset, range);
  const question1DVi = question1?.DVi || questionSet1.random([question1?.index, question1BVi?.index, question1CVi?.index], offset, range);



  const question2 = questionSet2.random([], offset, range);
  // Remove question2 from notTestedQuestion2SelfPractice[setselfpracticeQuestionStudent] array
  notTestedQuestion2SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = questionSet2.filter((q, idx) => idx !== question2?.index);
  const question2BJp = questionSet2.random([question2?.index], offset, range);
  const question2CJp = questionSet2.random([question2?.index, question2BJp?.index], offset, range);
  const question2DJp = questionSet2.random([question2?.index, question2BJp?.index, question2CJp?.index], offset, range);

  const question2BVi = questionSet2.random([question2?.index], offset, range);
  const question2CVi = questionSet2.random([question2?.index, question2BVi?.index], offset, range);
  const question2DVi = questionSet2.random([question2?.index, question2BVi?.index, question2CVi?.index], offset, range);

  const q1SelftPractice = {
    ro: question1.ro,
    options: [
      { jp: question1.jp, vi: question1.vi },
      { jp: question1BJp.jp, vi: question1BVi.vi },
      { jp: question1CJp.jp, vi: question1CVi.vi },
      { jp: question1DJp.jp, vi: question1DVi.vi }
    ],
    setStatus: `${notTestedQuestion2SelfPractice?.[setselfpracticeQuestionStudent]?.[setselfpracticeQuestionListName]?.length}/${QUESTIONS[setselfpracticeQuestionListName]?.length}`
  };
  const q2SelftPractice = {
    ro: question2.ro,
    options: [
      { jp: question2.jp, vi: question2.vi },
      { jp: question2BJp.jp, vi: question2BVi.vi },
      { jp: question2CJp.jp, vi: question2CVi.vi },
      { jp: question2DJp.jp, vi: question2DVi.vi }
    ]
  }
  res.status(200).json(JSON.stringify({ q1: q1SelftPractice, q2: q2SelftPractice }));
};
exports.nextQuestionsSelfPractice = nextQuestionsSelfPractice;



const resetQuestions = async (req, res, next) => {



  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(Math.floor(now.getMinutes() / 5))
  ].join('-');
  const rightAnswerListSize = Object.keys(rightAnswerList).map(key => {
    let person = {};
    person[key] = rightAnswerList[key].length;
    return person;
  })
  logger.debug(`rightAnswerListSize: ${JSON.stringify(rightAnswerListSize)}`, { at: new Error });
  fs.writeFileSync(`${path.resolve(path.resolve(__dirname, '..'), '..')}/bak/bak${timestamp}.json`, JSON.stringify(rightAnswerListSize), err => {
    if (err) {
      logger.error(err, { at: new Error });
    }
  });

  set = req.params.set ? req.params.set : set;
  
  db.ref('clearStorage').set(JSON.stringify({
    notTestedQuestion1,
    rightAnswerList,
    timestamp: new Date().toISOString()
  }));
  if (set === 'all') {
    rightAnswerList = {};
    Object.keys(QUESTIONS).forEach((key) => {
      notTestedQuestion1[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
      notTestedQuestion2[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
    });
  } else {
    notTestedQuestion1[set] = [...QUESTIONS[set]].sort((a, b) => a.jp.length - b.jp.length);
    notTestedQuestion2[set] = [...QUESTIONS[set]].sort((a, b) => a.jp.length - b.jp.length);
  }
  await sleep(1000);
  nextQuestions(req, res, next);

};
exports.resetQuestions = resetQuestions;

function doubleAnswer(resp) {
  let found = false;
  Object.keys(rightAnswerList).forEach(key => {
    rightAnswerList[key]?.forEach((item) => {
      if (key === resp.name && item?.ro === resp.ro) {
        found = true;
      }
    });
  })
  return found;
}
function removeSpecialChars(str) {
  const specialChars = [".", "#", "$", "/", "[", "]"];
  str = str.replace(/\.|\#|$|\/|\[|\]/g, "");
  return str;
}
exports.postAnswer = (req, res, next) => {
  const answer = req.body;
  // logger.debug('answer: ' + JSON.stringify(answer), { at: new Error });

  const questionSet = QUESTIONS[set];
  if (!questionSet || questionSet.length === 0) {
    logger.error('No question set found for set: ' + set, { at: new Error });
    return res.status(400).json({ error: 'No question set found' });
  }
  const question = questionSet.find((q) => q.ro === answer.ro);
  if(!question){
    logger.debug('bug', { at: new Error })
  }
  const resp = {
    name: answer.name,
    ro: question?.ro,
    jp: question?.jp === answer.jp,
    vi: question?.vi === answer.vi || !question.vi
  }
  // logger.debug('doubleAnswer: ' + doubleAnswer(resp), { at: new Error });
  if (resp.jp && resp.vi && answer.name && !doubleAnswer(resp)) {

    // logger.debug('right answer: ' + JSON.stringify(answer), { at: new Error });
    const answerName = removeSpecialChars(answer.name.trim());
    if (!rightAnswerList[answerName]) {
      rightAnswerList[answerName] = []
    }

    rightAnswerList[answerName].push({ ro: question.ro, time: new Date() });

    // if (Object.keys(rightAnswerList).length < 30) {
    //   for (let i = 1; i < 35; i++) {
    //     if (!rightAnswerList["test" + i]) {
    //       rightAnswerList["test" + i] = []
    //     }
    //     rightAnswerList["test" + i].push({ ro: question.ro, time: new Date() });
    //   }
    // }
    // rightAnswerList = sortByValueLength(rightAnswerList);
    
    
    db.ref('manage').set({
      notTestedQuestion1,
      rightAnswerList,
      //timestamp: new Date().toISOString()
    });

    // logger.debug('rightAnswerList: ' + JSON.stringify(rightAnswerList), { at: new Error });
  }
  res.status(200).json(JSON.stringify(resp));
};
