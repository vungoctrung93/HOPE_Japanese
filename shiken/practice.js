// practice.js
// This script provides a single-user practice mode for Hope Japanese self practice.
// It does not use ranking or require a second player.

const numberOfQuestionInRange = 5;


// const HOST_URL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":8080";

let setName;
let setInputHalfPoint;
let QUESTIONS = {};
let correctQuizAnswer = false;
let correctTypeAnswer = false;
let answerChecked = false;
let firebaseApp;
let db;
let getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator;
let notTestedQuestion1SelfPractice = localStorage.getItem("notTestedQuestion1SelfPractice") ? JSON.parse(localStorage.getItem("notTestedQuestion1SelfPractice")) : {};

const localhost = window.location.href.includes("localhost") || window.location.href.includes("mb-pro.local") || window.location.href.includes("mb-air.local");


window.addEventListener('DOMContentLoaded', async () => {
  
  ({ setInputbyJP } = await import('./const.js'));
  ({ setInputHalfPoint } = await import('./const.js'));
  
  const { initializeApp } = await import('./lib/firebase-app.js');
  ({ getDatabase, ref, once, get, set, update, onValue, connectDatabaseEmulator } = await import('./lib/firebase-database.js'));
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
  // listen to clearStorage value change
  onValue(ref(db, "QUESTIONS"), async (snapshot) => {
    if(!snapshot.val()) {
      console.log("No QUESTIONS data in firebase");
      const res = await fetch("http://localhost:8080/questionsData", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const response = await res.json();
      QUESTIONS = JSON.parse(response);
      set(ref(db, "QUESTIONS"), QUESTIONS);
      console.log("Fetch QUESTIONS from localhost:8080", QUESTIONS);
    } else {
      QUESTIONS = snapshot.val();
      nextQuestionSelfPractice();
    }
  });


  // listen to clearStorage value change
  onValue(ref(db, "clearStorage"), (snapshot) => {
    if(!snapshot.val()) return;
    const { timestamp } = JSON.parse(snapshot.val());
    console.log("clearStorage changed", timestamp);
    console.log("localStorage", localStorage.getItem("clearStorage"));
    
    if(localStorage.getItem("clearStorage") !== timestamp) {
      // const data = snapshot.val();
      const Q1Name = localStorage.getItem("Q1Name");
      const Q2Name = localStorage.getItem("Q2Name");
      const adminPassword = localStorage.getItem("adminPassword");
      const typeOrSelect = localStorage.getItem('typeOrSelect');
      localStorage.clear();
      localStorage.setItem("Q1Name", Q1Name? Q1Name : "");
      localStorage.setItem("Q2Name", Q2Name? Q2Name : "");
      localStorage.setItem("adminPassword", adminPassword? adminPassword : "");
      localStorage.setItem("typeOrSelect", typeOrSelect? typeOrSelect : "");
      console.log("localStorage clear");
      localStorage.setItem("clearStorage", timestamp);
    }
  });
});



const nextQuestionSelfPractices = (set ) => {
  const setselfpractice = set || 'HIRAGANA';
  
  // logger.debug(`setselfpractice: ${setselfpractice}`, { at: new Error });

  const setselfpracticeQuestionListName = setselfpractice && setselfpractice.split('-').length > 0 && setselfpractice.split('-')[0]
  const setselfpracticeQuestionStudent = setselfpractice && setselfpractice.split('-').length > 1 && setselfpractice.split('-')[1]


  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]) {
    notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent] = {}
  }
  // console.log(notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]);
  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] || notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName].length === 0) {
    notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = JSON.parse(JSON.stringify(QUESTIONS[setselfpracticeQuestionListName].sort((a, b) => a.jp.length - b.jp.length)))
  }
  // logger.debug(`notTestedQuestion1SelfPractice-${setselfpracticeQuestionListName}: ${notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent].[setselfpracticeQuestionListName].length}`, { at: new Error });

  if (!notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent]) {
    // return 400
    console.log('Invalid self practice set: ' + setselfpractice);
  }
  const questionSet1 = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName];


  const allThisSetLength = QUESTIONS[setselfpracticeQuestionListName].length;
  const numberOfQuestionIgnoreRangeHiraKata = numberOfQuestionInRange
  // const numberOfQuestionIgnoreRangeHiraKata = setselfpracticeQuestionListName === 'HIRAGANA' || setselfpracticeQuestionListName === 'KATAKANA' ? allThisSetLength : numberOfQuestionInRange
  const notTestedQuestion1SelfPracticeLength = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName].length
  const rangeIndex = allThisSetLength - notTestedQuestion1SelfPracticeLength;
  const offset = 0;//rangeIndex - (rangeIndex % numberOfQuestionIgnoreRangeHiraKata);
  const range = numberOfQuestionIgnoreRangeHiraKata;
  // logger offser and range
  // logger.debug(`offset: ${offset}, range: ${range}`, { at: new Error });
  
  const question1 = questionSet1.random([], offset, range);
  // Remove question1 from notTestedQuestion1[setselfpracticeQuestionStudent] array
  notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName] = notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName].filter((q, idx) => idx !== question1.index);

  localStorage.setItem("notTestedQuestion1SelfPractice", JSON.stringify(notTestedQuestion1SelfPractice));
  const question1BJp = question1.BJp || questionSet1.random([question1.index], offset, range);
  const question1CJp = question1.CJp || questionSet1.random([question1.index, question1BJp.index], offset, range);
  const question1DJp = question1.DJp || questionSet1.random([question1.index, question1BJp.index, question1CJp.index], offset, range);

  const question1BVi = question1.BVi || questionSet1.random([question1.index], offset, range);
  const question1CVi = question1.CVi || questionSet1.random([question1.index, question1BVi.index], offset, range);
  const question1DVi = question1.DVi || questionSet1.random([question1.index, question1BVi.index, question1CVi.index], offset, range);




  const q1SelftPractice = {
    ro: question1.ro,
    options: [
      { jp: question1.jp, vi: question1.vi },
      { jp: question1BJp.jp, vi: question1BVi.vi },
      { jp: question1CJp.jp, vi: question1CVi.vi },
      { jp: question1DJp.jp, vi: question1DVi.vi }
    ],
    setStatus: `${notTestedQuestion1SelfPractice[setselfpracticeQuestionStudent][setselfpracticeQuestionListName].length}/${QUESTIONS[setselfpracticeQuestionListName].length}`
  };
  return { q1: q1SelftPractice };
};

async function setFirebaseValue(path, value) {
  set(ref(db, path), value);
  // set(ref(db, "SelfPractice/" + studentName + "/type2_" + setName + jpInput.value.trim().toLowerCase()), true);
}


function nextQuestionSelfPractice(nextSetName) {
  correctQuizAnswer = false;
  correctTypeAnswer = false;
  answerChecked = false;
  if (!localStorage.getItem("Q1Name") || localStorage.getItem("Q1Name") === '') {
    localStorage.setItem("Q1Name", prompt("Hãy điền tên của bạn:"));
  }
  setName = typeof nextSetName === 'string' ? nextSetName : 'HIRAGANA';
  // console.log(setName);

  const set = setName + '-' + localStorage.getItem("Q1Name");
  const resJson = nextQuestionSelfPractices(set);
  const app = document.getElementById('practice-app');

  const q = resJson.q1;
  const options = q.options;
  const setStatus = q.setStatus;
  // Shuffle options for randomness
  const shuffled = options.map((v, i) => ({ ...v, index: i })).sort(() => Math.random() - 0.5);
  
  app.innerHTML = `
    <div id="practice-message"></div>
    <div class="Question mt-5">
      <div class="mx-auto text-center">
        <span class="me-3">
          <a href="./" class="btn bg-warning text-white decoration-none">←</a>
        </span>
        <span class="me-3">
          <a href="./manage" class="btn bg-warning text-white decoration-none">&#x1F4CA;</a>
        </span>
        <label style="cursor:pointer;">
          Gõ <input type="radio" name="typeOrSelect" value="type" class="radio" ${localStorage.getItem('typeOrSelect') === "type" ? "checked" : ""}/>
        </label>
        <label style="cursor:pointer;">
          Trắc nghiệm <input type="radio" name="typeOrSelect" value="select" class="radio" ${localStorage.getItem('typeOrSelect') !== "type" ? "checked" : ""}/>
        </label>
      </div>
      <div id="questionRo" class="text-center no-selectable">${localStorage.getItem('typeOrSelect') === "type" && !setInputbyJP.includes(setName) ? q.options[0].jp : q.ro}　　　${setStatus}</div>
      <div id="questionJPType" class="mx-auto text-center">
        <input id="jpInput" type="text" class="w-75" autocomplete="off" placeholder="Nhập ${ setInputbyJP.includes(setName) ? "hiragana" : "romaji" } "/>
      </div>
      <div id="questionJPSelect">
        <div class="jp">
          ${shuffled.map((opt, idx) => opt.jp ? `<div id="Jp${idx}" class='btn'>${opt.jp}</div>` : '').join('')}
        </div>
      </div>
      ${options[0].vi && q.ro !== options[0].vi ? `<br/><div class="vi">${shuffled.map((opt, idx) => opt.vi ? `<div id="Vi${idx}" class='btn'>${opt.vi}</div>` : '').join('')}</div>` : ''}

      ${Object.keys(QUESTIONS).map((key) => {
        return `<button class="btn next-btn bg-primary">${key}</button>`;
      }).join('')}
    </div>
  `;
  const jpInput = document.getElementById('jpInput');
  if(localStorage.getItem("typeOrSelect") === "type") {
    document.getElementById('questionJPSelect').classList.add("d-none");
    document.getElementById('questionJPType').classList.remove("d-none");
    jpInput.focus();
    jpInput.select();
  } else {
    document.getElementById('questionJPSelect').classList.remove("d-none");
    document.getElementById('questionJPType').classList.add("d-none");
  }
  // if typeOrSelect value is type, focus on jpInput
  if (jpInput) {
    jpInput.addEventListener('keyup', async function () {
      if ((jpInput.value.trim().toLowerCase() === q.ro.toLowerCase() && !setInputbyJP.includes(setName)) || (jpInput.value.trim() === q.options[0].jp && setInputbyJP.includes(setName))){
        correctTypeAnswer = true;
        jpInput.style.backgroundColor = "green"
        jpInput.style.color = "white"
        if((correctQuizAnswer || q.options[0].vi === undefined || q.options[0].vi === '') && !answerChecked) {
          // student Name
          const studentName = localStorage.getItem("Q1Name") ? localStorage.getItem("Q1Name") : 'Người chơi 1' + Math.floor(Math.random() * 1000000);
          setFirebaseValue("SelfPractice/" + studentName + "/type_" + setName + "_" + jpInput.value.trim().toLowerCase(), setInputbyJP.includes(setName) ? jpInput.value.trim().length : setInputHalfPoint.includes(setName) ? 0.5 : 1);
        }
      } else {
        jpInput.style.backgroundColor = ""
        jpInput.style.color = ""
      }
    });
  }

  // when click on typeOrSelect set localStorage of typeOrSelect to selected value
  document.querySelectorAll('input[name="typeOrSelect"]').forEach(radio => {
    radio.addEventListener('change', function (e) {
      localStorage.setItem('typeOrSelect', e.target.value);
      answerChecked = true;
      if (e.target.value === "type") {
        jpInput.focus();
        jpInput.select();
        document.getElementById('questionJPSelect').classList.add("d-none");
        document.getElementById('questionJPType').classList.remove("d-none");
        questionRo.innerHTML = (setInputbyJP.includes(setName) ? q.ro : q.options[0].jp) + "　　　" + setStatus;
      }else {
        document.getElementById('questionJPSelect').classList.remove("d-none");
        document.getElementById('questionJPType').classList.add("d-none");
        questionRo.innerHTML = q.ro + "　　　" + setStatus;
      }
    });
  });

  // Add click listeners
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      if (!e.target.classList.contains('next-btn')) {
        document.querySelectorAll('.btn').forEach(b => {
          b.style.backgroundColor = '';
          b.style.color = '';
        });
        // Show result
        correctQuizAnswer = (e.target.innerText === q.options[0].jp || e.target.innerText === q.options[0].vi);
        const msg = document.getElementById('practice-message');
        if (correctQuizAnswer) {
          e.target.style.backgroundColor = 'green';
          if(correctTypeAnswer && !answerChecked) {
            // student Name
            const studentName = localStorage.getItem("Q1Name") ? localStorage.getItem("Q1Name") : 'Người chơi 1' + Math.floor(Math.random() * 1000000);
            setFirebaseValue("SelfPractice/" + studentName + "/type_" + setName + "_" + jpInput.value.trim().toLowerCase(), setInputbyJP.includes(setName) ? jpInput.value.trim().length : 1);
          }
        } else {
          e.target.style.backgroundColor = 'red';
          e.target.style.color = 'white';
          // msg.innerHTML = '<b class="text-danger">Sai!</b>';
        }
        e.target.style.color = 'white';
      } else if (e.target.classList.contains('btn')) {
        nextQuestionSelfPractice(e.target.innerText);
      }
    });
  });
}


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