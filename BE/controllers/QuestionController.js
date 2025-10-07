const fs = require('node:fs');
const { response } = require('express');
const { QUESTIONS } = require('../data/QUESTIONS');
const { time, log } = require('node:console');
const { off } = require('node:process');
const logger = require('../middleware/logger').logger;

let rightAnswerList = {};
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
exports.getQUESTIONSData = (req, res, next) => {

  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(Math.floor(now.getMinutes() / 5))
  ].join('-');
  if(rightAnswerList && Object.keys(rightAnswerList).length > 0 ){
    const rightAnswerListSize = Object.keys(rightAnswerList).map(key => {
      let person = {};
      person[key] = rightAnswerList[key].length;
      return person;
    })
    fs.writeFileSync(`${path.resolve(path.resolve(path.resolve(__dirname, '..'), '..'), '..')}/BakupJapaneseHope/bak${timestamp}.json`, JSON.stringify(rightAnswerListSize), err => {
      if (err) {
        logger.error(err, { at: new Error });
      }
    });
  }
  res.status(200).json(JSON.stringify(QUESTIONS));
};


const nextQuestions = (req, res, next) => {

  if(rightAnswerList && Object.keys(rightAnswerList).length > 0){
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
    // backup answered count list
    fs.writeFileSync(`${path.resolve(path.resolve(path.resolve(__dirname, '..'), '..'), '..')}/BakupJapaneseHope/next${timestamp}.json`, JSON.stringify(rightAnswerListSize), err => {
      if (err) {
        logger.error(err, { at: new Error });
      }
    });
  }
  
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
        { jp: question1.jp, vi: question1.vi || '' },
        { jp: question1BJp.jp, vi: question1BVi.vi || '' },
        { jp: question1CJp.jp, vi: question1CVi.vi || '' },
        { jp: question1DJp.jp, vi: question1DVi.vi || '' }
      ]
    };
    q2 = {
      ro: question2.ro,
      options: [
        { jp: question2.jp, vi: question2.vi || '' },
        { jp: question2BJp.jp, vi: question2BVi.vi || '' },
        { jp: question2CJp.jp, vi: question2CVi.vi || '' },
        { jp: question2DJp.jp, vi: question2DVi.vi || ''   }
      ]
    }

    db.ref('questions').set({
      q1, q2
    });
    db.ref('manage').set({
      notTestedQuestion1,
      rightAnswerList
    });
    res.status(200).json(JSON.stringify({ q1, q2 }));
  } else {
    console.log("error here");
    console.log(set);

  }

};
exports.nextQuestions = nextQuestions;



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
  // backup answered count list
  fs.writeFileSync(`${path.resolve(path.resolve(path.resolve(__dirname, '..'), '..'), '..')}/BakupJapaneseHope/bak${timestamp}.json`, JSON.stringify(rightAnswerListSize), err => {
    if (err) {
      logger.error(err, { at: new Error });
    }
  });
  set = req.params.set ? req.params.set : set;
  
  db.ref('clearStorage').set(JSON.stringify({
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


exports.backupFirebase = (req, res, next) => {

  db.ref('SelfPractice').once('value', (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if(val){
          const now = new Date();
          const pad = n => n.toString().padStart(2, '0');
          const timestamp = [
            now.getFullYear(),
            pad(now.getMonth() + 1),
            pad(now.getDate()),
            pad(now.getHours()),
            pad(Math.floor(now.getMinutes() / 5))
          ].join('-');
          
          const rightAnswerListSize = Object.keys(val).map(key => {
            let person = {};
            person[key] = Object.keys(val[key]).length;
            return person;
          })
          logger.debug(`rightAnswerListSize: ${JSON.stringify(rightAnswerListSize)}`, { at: new Error });
          // backup answered count list
          fs.writeFileSync(`${path.resolve(path.resolve(path.resolve(__dirname, '..'), '..'), '..')}/BakupJapaneseHope/self${timestamp}.json`, JSON.stringify(rightAnswerListSize), err => {
            if (err) {
              logger.error(err, { at: new Error });
            }
          });
        }
      }
      
      res.status(200).json({mess: "ok"});
    }
  );


}