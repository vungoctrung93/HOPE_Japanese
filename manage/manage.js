
Array.prototype.random = function (ignore) {
  let randomIndex = Math.floor(Math.random() * this.length);
  while (this[randomIndex] === ignore) {
    randomIndex = Math.floor(Math.random() * this.length);
  }
  return this[randomIndex];
}
function getFontSize(rightAnswerListSize) {
  // Responsive font size based on window width
  const width = window.innerWidth || document.documentElement.clientWidth;
  const fontSize = Math.min(45, width / rightAnswerListSize * 1.5);
  return fontSize;
}

const sortByValueLength = function (object, smallToBig) {
  return Object.fromEntries(
    Object.entries(object).sort(([, a], [, b]) => smallToBig ? a.length - b.length : b.length - a.length)
  );
}
let chart; // Global chart variable
let db;
let firebaseApp;
let isSelfPractice;
document.addEventListener("DOMContentLoaded", async function () {

  const res = await fetch(HOST_URL + "/questionsData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const response = await res.json();
  QUESTIONS = JSON.parse(response);

  const { initializeApp } = await import('../lib/firebase-app.js');
  const { getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator } = await import('../lib/firebase-database.js');
  const firebaseConfig = {
    databaseURL: window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":9000/?ns=hopejapaneseshiken"
  };
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    db = getDatabase(firebaseApp);
    connectDatabaseEmulator(db, window.location.href.split(":")[1], 9000);
  }
  onValue(ref(db, "manage"), (snapshotManage) => {
    if (snapshotManage.exists()) {
      let { notTestedQuestion1, rightAnswerList } = snapshotManage.val();

      document.getElementById("ContentButton").innerHTML = `
            ${Object.keys(QUESTIONS).map((key) => {
        return ` <button onclick="nextQuestion('${key}')" class="w-25">${key} ${(QUESTIONS[key] && QUESTIONS[key].length) - ((notTestedQuestion1[key] && notTestedQuestion1[key].length) || 0)}/${QUESTIONS[key] && QUESTIONS[key].length}</button><button onclick="resetQuestion('${key}')">&#x21bb;</button>`;
      }).join('')}
      <button onclick="selfPractice()" class="w-25">Tự luyện tập</button><button onclick="resetSelfPractice()">&#x21bb;</button>`;

      if (!rightAnswerList) {
        return;
      };
      rightAnswerList = sortByValueLength(rightAnswerList);
      chartDraw(rightAnswerList);
    }
  });
  onValue(ref(db, "questions"), (snapshot) => {
    if (snapshot.exists() && !isSelfPractice) {
      const { q1, q2 } = snapshot.val();
      document.getElementById("q1").innerHTML = `Q1: ${((q1 && q1.options && q1.ro) || '')}`// - ${((q1 && q1.options && q1.options[0] && q1.options[0].vi) || '')}`;
      document.getElementById("q2").innerHTML = `Q2: ${((q2 && q2.options && q2.ro) || '')}`// - ${((q2 && q2.options && q2.options[0] && q2.options[0].vi) || '')}`;
    }
  });

});



const HOST_URL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":8080";
function nextQuestion(set) {
  fetch(HOST_URL + "/nextquestion/" + set, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      const resJson = JSON.parse(response);
      console.log(resJson);
    })
    .catch(error => console.log("Error: " + error));
}


function resetQuestion(set) {
  fetch(HOST_URL + "/resetquestion/" + set, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      const resJson = JSON.parse(response);
      console.log(resJson);
    })
    .catch(error => console.log("Error: " + error));
}

function chartDraw(data, chartCountsBySum) {

  // Prepare data for chart
  let chartLabels = Object.keys(data);
  // Prepare chart data: count of right answers per user
  let chartCounts = chartCountsBySum || chartLabels.map(name => data[name].length);
  console.log(chartCounts);
  if (chart) {
    chart.destroy();
  }
  const ctx = document.getElementById('top3Chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels.filter((element, index) => index < chartLabels.length)
      ,
      datasets: [{
        label: '',
        data: chartCounts.filter((element, index) => index < chartCounts.length),
        backgroundColor: 'rgba(15, 124, 0, 0.6)'
      }]
    },
    options: {
      animation: false,
      indexAxis: 'x',
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: {
              size: getFontSize(data ? Object.keys(data).length : 1)
            },
            minRotation: 90,
            maxRotation: 90,
            color: '#000'
          }
        },
        y: {
          ticks: {
            callback: function (value) {
              return Number.isInteger(value) ? value : '';
            },
            font: {
              size: 24
            }
          }
        }
      },
      aspectRatio: 2.5
    }
  });
}

async function selfPractice() {
  isSelfPractice = true;
  const { getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator } = await import('../lib/firebase-database.js');
  onValue(ref(db, "SelfPractice"), (snapshotManage) => {
    if (snapshotManage.exists() && isSelfPractice) {
      console.log("SelfPractice", snapshotManage.val());
      const rightAnswerList = {};
      const chartCounts = [];

      Object.keys(snapshotManage.val()).map((studentName) => {
        rightAnswerList[studentName] = Object.keys(snapshotManage.val()[studentName]);
        let chartCount = 0;
        rightAnswerList[studentName].forEach((key) => {
          chartCount += snapshotManage.val()[studentName][key] || 0;
          console.log(key, snapshotManage.val()[studentName][key], chartCount);

        });
        chartCounts.push(chartCount);
      });

      // sort rightAnswerList by chartCounts
      const sortedRightAnswerList = {};
      const sortedChartCounts = [];
      chartCounts.slice().sort((a, b) => b - a).forEach((count) => {
        const studentName = Object.keys(rightAnswerList).find(name => {
          return rightAnswerList[name].reduce((sum, key) => sum + (snapshotManage.val()[name][key] || 0), 0) === count && !sortedRightAnswerList[name];
        });
        if (studentName) {
          sortedRightAnswerList[studentName] = rightAnswerList[studentName];
          sortedChartCounts.push(count);
        }
      });
      console.log("sortedRightAnswerList", sortedRightAnswerList, sortedChartCounts);
      chartDraw(sortedRightAnswerList, sortedChartCounts);
    }
  });
}

async function resetSelfPractice() {

  const { getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator } = await import('../lib/firebase-database.js');

  onValue(ref(db, "SelfPractice"), async (snapshotManage) => {
    if (snapshotManage.exists() && isSelfPractice) {
      const res = await fetch(HOST_URL + "/questionsData", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const response = await res.json();
      set(ref(db, "SelfPractice/"), {});
    }
  });
}