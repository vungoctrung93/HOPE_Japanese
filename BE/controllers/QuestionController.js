const fs = require('node:fs');
const { response } = require('express');
var { QUESTIONS } = require('../data/questions');
const { time, log } = require('node:console');
const { off } = require('node:process');
const logger = require('../middleware/logger').logger;

Array.prototype.random = function (ignore, offset, range) {
  let start = offset || 0;
  let end = typeof range === 'number' ? Math.min(start + range, this.length - 1) : this.length;
  let randomIndex = Math.floor(Math.random() * (end - start)) + start;
  while (ignore && ignore.length > 0 && ignore.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * (end - start)) + start;
  }

  return { ...this[randomIndex], index: randomIndex };
}

Object.prototype.sortByValueLength = function (smallToBig) {
  return Object.fromEntries(
    Object.entries(this).sort(([, a], [, b]) => smallToBig ? a.length - b.length : b.length - a.length)
  );
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

const localStorageClear = `
  const Q1Name = localStorage.getItem("Q1Name");
  const Q2Name = localStorage.getItem("Q2Name");
  localStorage.clear();
  localStorage.setItem("Q1Name", Q1Name? Q1Name : "");
  localStorage.setItem("Q2Name", Q2Name? Q2Name : "");
  console.log("localStorage clear");
  `;
fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/FE/index2.js', localStorageClear, err => {
  if (err) {
    logger.error(err, { at: new Error });
  }
});

let rightAnswerList = {};

const nextQuestions = (req, res, next) => {
  set = req.params.set ? req.params.set : set;
  const questionSet1 = notTestedQuestion1[set];
  const rangeIndex = QUESTIONS[set].length - notTestedQuestion1[set].length;
  const offset = rangeIndex - (rangeIndex % numberOfQuestionInRange);
  const range = offset + numberOfQuestionInRange;

  if (range - offset > 0) {
    const question1 = questionSet1.random([], offset, range);
    // Remove question1 from notTestedQuestion1[set] array
    notTestedQuestion1[set] = questionSet1.filter((q, idx) => idx !== question1.index);
    const question1BJp = questionSet1.random([question1.index], offset, range);
    const question1CJp = questionSet1.random([question1.index, question1BJp.index], offset, range);
    const question1DJp = questionSet1.random([question1.index, question1BJp.index, question1CJp.index], offset, range);

    const question1BVi = questionSet1.random([question1.index], offset, range);
    const question1CVi = questionSet1.random([question1.index, question1BVi.index], offset, range);
    const question1DVi = questionSet1.random([question1.index, question1BVi.index, question1CVi.index], offset, range);



    const questionSet2 = notTestedQuestion2[set];
    const question2 = questionSet2.random([], offset, range);
    // Remove question2 from notTestedQuestion2[set] array
    notTestedQuestion2[set] = questionSet2.filter((q, idx) => idx !== question2.index);
    const question2BJp = questionSet2.random([question2.index], offset, range);
    const question2CJp = questionSet2.random([question2.index, question2BJp.index], offset, range);
    const question2DJp = questionSet2.random([question2.index, question2BJp.index, question2CJp.index], offset, range);

    const question2BVi = questionSet2.random([question2.index], offset, range);
    const question2CVi = questionSet2.random([question2.index, question2BVi.index], offset, range);
    const question2DVi = questionSet2.random([question2.index, question2BVi.index, question2CVi.index], offset, range);

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
    const fs = require('node:fs');
    const content = 'const a = "Some content!' + Math.random() + '"';
    fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/FE/index2.js', content, err => {
      if (err) {
        logger.error(err, { at: new Error });
      }
    });
    writeRightAnswerListHtml();
    res.status(200).json(JSON.stringify({ q1, q2 }));
  } else {
    console.log("error here");

  }

};
exports.nextQuestions = nextQuestions;


exports.postAnswer = (req, res, next) => {
  const answer = req.body;
  logger.debug('answer: ' + JSON.stringify(answer), { at: new Error });

  const questionSet = QUESTIONS[set];
  const question = questionSet.find((q) => q.ro === answer.ro);

  const resp = {
    ro: question.ro,
    jp: question.jp === answer.jp,
    vi: question.vi === answer.vi
  }
  if (resp.jp && resp.vi && answer.name) {

    logger.debug('right answer: ' + JSON.stringify(answer), { at: new Error });
    if (!rightAnswerList[answer.name]) {
      rightAnswerList[answer.name] = []
    }

    rightAnswerList[answer.name].push({ ro: question.ro, time: new Date() });

    // if (Object.keys(rightAnswerList).length < 30) {
    //   for (let i = 1; i < 35; i++) {
    //     if (!rightAnswerList["test" + i]) {
    //       rightAnswerList["test" + i] = []
    //     }
    //     rightAnswerList["test" + i].push({ ro: question.ro, time: new Date() });
    //   }
    // }
    rightAnswerList = rightAnswerList.sortByValueLength();
    logger.debug('rightAnswerList: ' + JSON.stringify(rightAnswerList), { at: new Error });

    writeRightAnswerListHtml();
  }

  res.status(200).json(JSON.stringify(resp));
};

function writeRightAnswerListHtml() {


  // Prepare data for chart
  let chartLabels = Object.keys(rightAnswerList);
  // Prepare chart data: count of right answers per user
  let chartCounts = chartLabels.map(name => rightAnswerList[name].length);

  log(chartLabels)
  log(chartCounts)


  const content = `
    <html>
    <head>
      <title>Top 3 Chart</title>
      <script src="./chart.js"></script>
      <style>
        .fixed {
          position: fixed;
          top: 0;
          background-color: white;
          padding: 2.6vh;
          width: 100%;
        }
        .pt-5 {
          padding-top: 3vh;
        }
        .pb-5 {
          padding-bottom: 3vh;
        }
        .mt-5 {
          margin-top: 5.1vh;
        }
        .pe-5 {
          padding-right: 3vw;
        }
        
      </style>
    </head>
    <body>
      <div class="fixed">
        ${Object.keys(notTestedQuestion1).map((key) => {
    return `<button onclick="nextQuestion('${key}')">Next ${key}</button>
          <span class="pe-5">${QUESTIONS[key]?.length}-${notTestedQuestion1[key]?.length}=${QUESTIONS[key]?.length - notTestedQuestion1[key]?.length}</span>`;
  }).join('')}
      </div> 
      <canvas id="top3Chart" class="mt-5 pb-5"></canvas>
      <script>
        function getFontSize() {
          // Responsive font size based on window width
          const width = window.innerWidth || document.documentElement.clientWidth;
          const fontSize = Math.min(45, width / (${Object.keys(rightAnswerList).length} * 1.5));
          return fontSize;
        }
        const ctx = document.getElementById('top3Chart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(chartLabels.filter((element, index) => index < chartLabels.length))},
            datasets: [{
              label: '',
              data: ${JSON.stringify(chartCounts.filter((element, index) => index < chartCounts.length))},
              backgroundColor: 'rgba(15, 124, 0, 0.6)'
            }]
          },
          options: {
            indexAxis: 'x',
            scales: {
              x: { 
                beginAtZero: true,
                ticks: {
                  font: {
                    size: getFontSize()
                  },
                  // Rotate x-axis labels by 10 degrees
                  minRotation: 90,
                  maxRotation: 90,
                  color: '#000'
                }
              },
              y: {
                ticks: {
                  callback: function(value) {
                    return Number.isInteger(value) ? value : '';
                  },
                  font: {
                    size: 24
                  }
                }
              }
            }
          }
        });
      </script>
      <script src="manage.js"></script>
    </body>
    </html>
  `;
  fs.writeFile('/Users/trung/TermGit/HOPE_Japanese_2/manage/index.html', content, err => {
    if (err) {
      logger.error(err, { at: new Error });
    }
  });
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(Math.floor(now.getMinutes()/5))
  ].join('-');
  fs.writeFile(`/Users/trung/Documents/Study/Hope_Japanese/HOPE_Japanese_Bak/bak${timestamp}.json`, JSON.stringify(rightAnswerList), err => {
    if (err) {
      logger.error(err, { at: new Error });
    }
  });
}