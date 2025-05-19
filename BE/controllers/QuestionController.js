
const { response } = require('express');
var { QUESTIONS } = require('../data/questions');
const { time } = require('node:console');
const logger = require('../middleware/logger').logger;

Array.prototype.random = function (ignore) {
  let randomIndex = Math.floor(Math.random() * this.length);
  while (ignore && ignore.length > 0 && ignore.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * this.length);
  }
  return { ...this[randomIndex], index: randomIndex };
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
Object.keys(QUESTIONS).forEach((key) => {
  notTestedQuestion1[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
  notTestedQuestion2[key] = [...QUESTIONS[key]].sort((a, b) => a.jp.length - b.jp.length);
});
console.log(notTestedQuestion1);
console.log(notTestedQuestion2);
let notTestedQuestionCount = {};

Object.keys(QUESTIONS).forEach((key) => {
  notTestedQuestionCount[key] = QUESTIONS[key].length;
});


const nextQuestions = (req, res, next) => {
  set = req.params.set ? req.params.set : set;
  const questionSet1 = notTestedQuestion1[set];
  const question1 = questionSet1.random();
  // Remove question1 from notTestedQuestion1[set] array
  notTestedQuestion1[set] = questionSet1.filter((q, idx) => idx !== question1.index);
  notTestedQuestionCount[set] = notTestedQuestion1[set].length;
  const question1BJp = questionSet1.random([question1.index]).jp;
  const question1CJp = questionSet1.random([question1.index, question1BJp.index]).jp;
  const question1DJp = questionSet1.random([question1.index, question1BJp.index, question1CJp.index]).jp;

  const question1BVi = questionSet1.random(question1.index).vi;
  const question1CVi = questionSet1.random([question1.index, question1BVi.index]).vi;
  const question1DVi = questionSet1.random([question1.index, question1BVi.index, question1CVi.index]).vi;


  const questionSet2 = notTestedQuestion2[set];
  const question2 = questionSet2.random();
  // Remove question2 from notTestedQuestion2[set] array
  notTestedQuestion2[set] = questionSet2.filter((q, idx) => idx !== question2.index);
  const question2BJp = questionSet2.random(question2.index).jp;
  const question2CJp = questionSet2.random([question2.index, question2BJp.index]).jp;
  const question2DJp = questionSet2.random([question2.index, question2BJp.index, question2CJp.index]).jp;

  const question2BVi = questionSet2.random(question2.index).vi;
  const question2CVi = questionSet2.random([question2.index, question2BVi.index]).vi;
  const question2DVi = questionSet2.random([question2.index, question2BVi.index, question2CVi.index]).vi;

  q1 = {
    ro: question1.ro,
    options: [
      { jp: question1.jp, vi: question1.vi },
      { jp: question1BJp, vi: question1BVi },
      { jp: question1CJp, vi: question1CVi },
      { jp: question1DJp, vi: question1DVi }
    ]
  };
  q2 = {
    ro: question2.ro,
    options: [
      { jp: question2.jp, vi: question2.vi },
      { jp: question2BJp, vi: question2BVi },
      { jp: question2CJp, vi: question2CVi },
      { jp: question2DJp, vi: question2DVi }
    ]
  }
  const fs = require('node:fs');
  const content = 'const a = "Some content!' + Math.random() + '"';
  fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/FE/index2.js', content, err => {
    if (err) {
      logger.error(error, {at : new Error});
    }
  });
  res.status(200).json(JSON.stringify({ q1, q2 }));
};
exports.nextQuestions = nextQuestions;


let rightAnswerList = {};

exports.postAnswer = (req, res, next) => {
  const answer = req.body;
    logger.debug('answer: ' + JSON.stringify(answer), {at : new Error});
  
  const questionSet = QUESTIONS[set];
  const question = questionSet.find((q) => q.ro === answer.ro);
  
  const resp = {
    ro: question.ro,
    jp: question.jp === answer.jp,
    vi: question.vi === answer.vi
  }
  if (resp.jp && resp.vi && answer.name) {

    logger.debug('right answer: ' + JSON.stringify(answer), {at : new Error});
    if (!rightAnswerList[question.ro]) {
      rightAnswerList[question.ro] = []
    }

    rightAnswerList[question.ro].push({ name: answer.name, time: new Date() });
    logger.debug('rightAnswerList: ' + JSON.stringify(rightAnswerList), {at : new Error});



  const fs = require('node:fs');
  const content = `
    <html>
      <head>
        <title>Right Answer List</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          .fixed {
            position: fixed;
            top: 20;
          }
          .pt-5 {
            padding-top: 3rem;
          }
        </style>
      </head>
      <body>
        <div class="fixed">
        ${Object.keys(notTestedQuestionCount).map((key) => {
          return `<button onclick="nextQuestion('${key}')">Next ${key}</button>
          <span>${notTestedQuestionCount[key]}</span>`;
        }).join('')}
        </div>
        <h1 class="pt-5">Right Answer List</h1>
        <table>
          <tr>
          <th>Top</th>
            <th></th>
            <th>Name</th> 
          </tr>
          ${Object.keys(rightAnswerList).map((jp) => {
            return rightAnswerList[jp].map((item, index) => {
              return `<tr ${index===0 || index===1 ? "class='bg-success'": ""}><td>${index + 1}</td><td>${jp}</td><td>${item.name}</td></tr>`;
            }).join('');
          }).join('')}
        </table>
        <script src="manage.js"></script>
      </body>
  `;
  fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/manage/index.html', content, err => {
    if (err) {
      logger.error(error, {at : new Error});
    }
  });
  }

  res.status(200).json(JSON.stringify(resp));
};