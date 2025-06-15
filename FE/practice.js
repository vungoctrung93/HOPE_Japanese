// practice.js
// This script provides a single-user practice mode for Hope Japanese self practice.
// It does not use ranking or require a second player.


const HOST_URL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":8080";

let setName;

function nextQuestionSelfPractice(nextSetName) {
  if (!localStorage.getItem("Q1Name") || localStorage.getItem("Q1Name") === '') {
    alert("Hãy quay lại trang trước và điền tên của cả 2 người");
    document.location = "./";
  }
  setName = typeof nextSetName === 'string' ? nextSetName : 'HIRAGANA';
  // console.log(setName);

  const randomId = localStorage.getItem("Q1NameSelftPractice") ? localStorage.getItem("Q1NameSelftPractice") : Math.floor(Math.random() * 100000)
  const set = setName + '-' + localStorage.getItem("Q1Name") + '-' + randomId;
  localStorage.setItem("Q1NameSelftPractice", randomId);
  fetch(HOST_URL + "/nextquestionselfpractice/" + set, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      const resJson = JSON.parse(response);

      console.log(resJson);


      const app = document.getElementById('practice-app');

      const q = resJson.q1;
      const options = q.options;
      const setStatus = q.setStatus;
      // Shuffle options for randomness
      const shuffled = options.map((v, i) => ({ ...v, index: i })).sort(() => Math.random() - 0.5);
      const typeOrSelect = document.getElementsByName("typeOrSelect")
      // if typeOrSelect are type, make input text instead of div.jp

      app.innerHTML = `
        <div id="practice-message"></div>
        <div class="Q">
          <div id="questionRo" class="text-center">${q.ro}　　　${setStatus}</div>
          <div id="questionJPType" class="mx-auto text-center">
            <input id="jpInput" type="text" class="w-75" autocomplete="off" placeholder="Nhập tiếng Nhật: "/>
          </div>
          <div id="questionJPSelect">
            <div class="jp pt-5">
              ${shuffled.map((opt, idx) => opt.jp ? `<div id="Jp${idx}" class='btn'>${opt.jp}</div>` : '').join('')}
            </div>
          </div>
          ${options[0].vi && q.ro !== options[0].vi ? `<br/><div class="vi">${shuffled.map((opt, idx) => opt.vi ? `<div id="Vi${idx}" class='btn'>${opt.vi}</div>` : '').join('')}</div>` : ''}
        </div>
        <div class="pt-5">
          <label style="cursor:pointer;">
        Gõ <input type="radio" name="typeOrSelect" value="type" class="radio" ${localStorage.getItem('typeOrSelect') === "type" ? "checked" : ""}/>
          </label>
          <label style="cursor:pointer;">
        Trắc nghiệm <input type="radio" name="typeOrSelect" value="select" class="radio" ${localStorage.getItem('typeOrSelect') !== "type" ? "checked" : ""}/>
          </label>
          <button class="btn next-btn bg-success text-white">GOI1</button>
          <button class="btn next-btn bg-success text-white">HIRAGANA</button>
          <button class="btn next-btn bg-success text-white">KATAKANA</button>
          <button class="btn next-btn bg-success text-white">KANJI1</button>
          <button class="btn next-btn bg-success text-white">OLD CLASS</button>
          </div>
      `;
      const jpInput = document.getElementById('jpInput');
      if(localStorage.getItem("typeOrSelect") === "type") {
        document.getElementById('questionJPSelect').classList.add("d-none");
        document.getElementById('questionJPType').classList.remove("d-none");
        jpInput.focus();
      } else {
        document.getElementById('questionJPSelect').classList.remove("d-none");
        document.getElementById('questionJPType').classList.add("d-none");
      }
      // if typeOrSelect value is type, focus on jpInput
      if (jpInput) {
        jpInput.addEventListener('keyup', function () {
          if (jpInput.value.trim().replace("　", "") === q.options[0].jp) {
            jpInput.style.backgroundColor = "green"
            jpInput.style.color = "white"
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
          if (e.target.value === "type") {
            jpInput.focus();
            document.getElementById('questionJPSelect').classList.add("d-none");
            document.getElementById('questionJPType').classList.remove("d-none");
          }else {
            document.getElementById('questionJPSelect').classList.remove("d-none");
            document.getElementById('questionJPType').classList.add("d-none");
          }
        });
      });

      // Add click listeners
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
          if (!e.target.classList.contains('next-btn')) {
            document.querySelectorAll('.btn').forEach(b => {
              b.style.backgroundColor = '';
              b.style.color = '';
            });
            // Show result
            const isCorrect = (e.target.innerText === q.options[0].jp || e.target.innerText === q.options[0].vi);
            const msg = document.getElementById('practice-message');
            if (isCorrect) {
              e.target.style.backgroundColor = 'green';
              // msg.innerHTML = '<b class="text-success message">Đúng!</b>';
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
    })
    .catch(error => console.log("Error: " + error));
}

document.addEventListener('DOMContentLoaded', nextQuestionSelfPractice);
