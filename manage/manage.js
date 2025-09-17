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
document.addEventListener("DOMContentLoaded", async function () {

  const { initializeApp } = await import('../lib/firebase-app.js');
  const { getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator } = await import('../lib/firebase-database.js');
  const firebaseConfig = {
    databaseURL: window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":9000/?ns=hopejapaneseshiken"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  connectDatabaseEmulator(db, window.location.href.split(":")[1], 9000);

  get(ref(db, "QUESTIONS")).then((snapshot) => {
    if (snapshot.exists()) {
      // console.log("QUESTIONS", snapshot.val());
      const QUESTIONS = snapshot.val();
      onValue(ref(db, "manage"), (snapshotManage) => {
        if (snapshotManage.exists()) {
          let { notTestedQuestion1, rightAnswerList } = snapshotManage.val();
          console.log("manage", snapshotManage.val());

          document.getElementById("ContentButton").innerHTML = `
            ${Object.keys(QUESTIONS).map((key) => {
            return `<button onclick="nextQuestion('${key}')" class="me-1 w-25">${key} ${QUESTIONS[key]?.length - (notTestedQuestion1[key]?.length || 0)}/${QUESTIONS[key]?.length}</button> <button onclick="resetQuestion('${key}')" class="me-1">&#x21bb;</button>`;
          }).join('')}`;

          if (!rightAnswerList) {
            return;
          };
          rightAnswerList = sortByValueLength(rightAnswerList);
          // Prepare data for chart
          let chartLabels = Object.keys(rightAnswerList);
          // Prepare chart data: count of right answers per user
          let chartCounts = chartLabels.map(name => rightAnswerList[name].length);
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
                      size: getFontSize(rightAnswerList ? Object.keys(rightAnswerList).length : 1)
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
      });
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


