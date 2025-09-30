
const localhost = window.location.href.includes("localhost") || window.location.href.includes("mb-pro.local");
let admin = false;
const password = localStorage.getItem('adminPassword') || prompt("enter admin password to reset all data:");
if(password !== 'ádkjfhalsjdfhal') {
  if(password != undefined && password !== '' && password !== 'null' &&password !== 'asdfasdcasdfasf') {
    alert("wrong password!" + password);
  } else {
    localStorage.setItem('adminPassword', 'asdfasdcasdfasf');
  }
} else {
  admin = true;
  localStorage.setItem('adminPassword', password);
}
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
let getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator;
document.addEventListener("DOMContentLoaded", async function () {

  // const res = await fetch(HOST_URL + "/questionsData", {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });
  // const response = await res.json();
  // QUESTIONS = JSON.parse(response);
  // try {
  //   await import('../lib/chart.js');    
  // } catch (ex) {
  //   console.error(ex);
  // }
  const { initializeApp } = await import('../lib/firebase-app.js');
  ( {getDatabase, ref, get, set, update, onValue, connectDatabaseEmulator } = await import('../lib/firebase-database.js'));
  let databaseURL;
  if(localhost) {
    databaseURL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":9000/?ns=hopejapaneseshiken"
  } else {
    databaseURL = "https://hopejapaneseshiken-default-rtdb.asia-southeast1.firebasedatabase.app"
  }
  const firebaseConfig = {
    apiKey: "AIzaSyBWe_u9D9dVxtbawXnQcEnPVbrloO0DR8A",
    authDomain: "hopejapaneseshiken.firebaseapp.com",
    databaseURL,
    projectId: "hopejapaneseshiken",
    storageBucket: "hopejapaneseshiken.firebasestorage.app",
    messagingSenderId: "319879010332",
    appId: "1:319879010332:web:7cea0395b1e3597098e7d9"
  };
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    db = getDatabase(firebaseApp);
    if(localhost) {
      connectDatabaseEmulator(db, window.location.href.split(":")[1], 9000);
    }
  }
  onValue(ref(db, "QUESTIONS"), async (snapshot) => {
    if(snapshot.exists()) {
      QUESTIONS = snapshot.val()
    }
  });
  document.getElementById("loading").innerHTML = `
    <div style='background-color: #fff; position: fixed; top:15vh; width:100%; height: 90vh; text-align: center; '><div style='position:fixed; transform: translate(35vw, 40vh); font-size:5vh;'>Loading...</div></div>
    `
  if(admin && localhost) {
    document.getElementById('resetall').innerHTML = `<button onclick="resetSelfPractice()">&#x21bb;</button>
    <button onclick="resetQuestion('all')" class="w-25">&#x21bb; All</button>`;
    onValue(ref(db, "manage"), (snapshotManage) => {
      if (snapshotManage.exists()) {
        let { notTestedQuestion1, rightAnswerList } = snapshotManage.val();
        
        document.getElementById("ContentButton").innerHTML = `
          ${Object.keys(QUESTIONS).map((key) => {
          return ` <button onclick="nextQuestion('${key}')" class="w-25">${key} ${(QUESTIONS[key] && QUESTIONS[key].length) - ((notTestedQuestion1[key] && notTestedQuestion1[key].length) || 0)}/${QUESTIONS[key] && QUESTIONS[key].length}</button><button onclick="resetQuestion('${key}')">&#x21bb;</button>`;
        }).join('')}
        `;

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
  } else {
    document.getElementById("SelfPracticeButton").style.display = "none"
    selfPractice();
  }

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

  
  // Prepare chart data: count of right answers per user
  let chartCounts = chartCountsBySum || Object.keys(data).map(name => data[name].length);
  // Prepare data for chart
  let chartLabels = Object.keys(data).map((name, index) => {
    return name + (chartCounts[index] < 10 ? `-00${chartCounts[index]}` : chartCounts[index] < 100 ? `-0${chartCounts[index]}` : `-${chartCounts[index]}`);
  });
  if (chart) {
    chart.destroy();
  }
  const ctx = document.getElementById('top3Chart').getContext('2d');

  // Get the Q1Name from localStorage
  const q1Name = localStorage.getItem('Q1Name');

  // Set background colors: orange if label matches q1Name, else default green
  const backgroundColors = chartLabels.map(label => {
    // Remove the "-00x" suffix to compare only the name part
    const name = label.split('-')[0];
    return name === q1Name ? 'orange' : 'rgba(15, 124, 0, 0.6)';
  });

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Số câu đúng',
        data: chartCounts,
        backgroundColor: backgroundColors
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
              size: getFontSize(chartLabels.length),
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
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true
        }
      },
      aspectRatio: (16/7)
    }
  });

  document.getElementById("loading").innerHTML = '';
}

async function selfPractice() {
  isSelfPractice = true;
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
  const res = await fetch(HOST_URL + "/backupfirebase", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const response = await res.json();
  await set(ref(db, "SelfPractice/"), {});
}