
const { response } = require('express');
var { QUESTIONS } = require('../data/questions');
const { time } = require('node:console');

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


const nextQuestions = (req, res, next) => {
  const question1 = QUESTIONS.random();
  const question1BRo222 = QUESTIONS.random([question1.index]).jp;
  const question1CRo222 = QUESTIONS.random([question1.index, question1BRo222.index]).jp;
  const question1DRo222 = QUESTIONS.random([question1.index, question1BRo222.index, question1CRo222.index]).jp;

  const question1BVi = QUESTIONS.random(question1.index).vi;
  const question1CVi = QUESTIONS.random([question1.index, question1BVi.index]).vi;
  const question1DVi = QUESTIONS.random([question1.index, question1BVi.index, question1CVi.index]).vi;


  const question2 = QUESTIONS.random();
  const question2BRo222 = QUESTIONS.random(question1.index).jp;
  const question2CRo222 = QUESTIONS.random([question1.index, question2BRo222.index]).jp;
  const question2DRo222 = QUESTIONS.random([question1.index, question2BRo222.index, question2CRo222.index]).jp;

  const question2BVi = QUESTIONS.random(question1.index).vi;
  const question2CVi = QUESTIONS.random([question1.index, question2BVi.index]).vi;
  const question2DVi = QUESTIONS.random([question1.index, question2BVi.index, question2CVi.index]).vi;

  q1 = {
    ro: question1.ro,
    options: [
      { jp: question1.jp, vi: question1.vi },
      { jp: question1BRo222, vi: question1BVi },
      { jp: question1CRo222, vi: question1CVi },
      { jp: question1DRo222, vi: question1DVi }
    ]
  };
  q2 = {
    ro: question2.ro,
    options: [
      { jp: question2.jp, vi: question2.vi },
      { jp: question2BRo222, vi: question2BVi },
      { jp: question2CRo222, vi: question2CVi },
      { jp: question2DRo222, vi: question2DVi }
    ]
  }
  const fs = require('node:fs');
  const content = 'const a = "Some content!' + Math.random() + '"';
  fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/FE/index2.js', content, err => {
    if (err) {
      console.error(err);
    }
  });
  res.status(200).json(JSON.stringify({ q1, q2 }));
};
exports.nextQuestions = nextQuestions;


let rightAnswerList = {};

exports.postAnswer = (req, res, next) => {
  const answer = req.body;
  console.log(answer);

  const question = QUESTIONS.find((q) => q.ro === answer.ro);
  const resp = {
    ro: question.ro,
    jp: question.jp === answer.jp,
    vi: question.vi === answer.vi
  }
  if (resp.jp && resp.vi && answer.name) {

    console.log(rightAnswerList);
    if (!rightAnswerList[question.ro]) {
      rightAnswerList[question.ro] = []
    }

    rightAnswerList[question.ro].push({ name: answer.name, time: new Date() });
    console.log(rightAnswerList);



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
        </style>
      </head>
      <body>
        <button onclick="nextQuestion()">Next Question</button>
        <h1>Right Answer List</h1>
        <table>
          <tr>
          <th>Top</th>
            <th>ロマン字</th>
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
      console.error(err);
    }
  });
  }

  res.status(200).json(JSON.stringify(resp));
};