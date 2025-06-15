
Array.prototype.random = function (ignore) {
  let randomIndex = Math.floor(Math.random() * this.length);
  while (ignore && ignore.length > 0 && ignore.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * this.length);
  }
  return { ...this[randomIndex], index: randomIndex };
}
const HOST_URL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":8080";
function test() {
  fetch(HOST_URL, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      const resJson = JSON.parse(response);
      console.log(resJson);

      const dataQ1 = {
        name: localStorage.getItem("Q1Name"),
        ro: resJson.q1.ro,
        jp: localStorage.getItem(resJson.q1.ro + "Q1Jp"),
        // if quesion and VI are the same, ignore VI by set same value with question
        vi: resJson.q1.ro === resJson.q1.options[0].vi ? resJson.q1.ro : localStorage.getItem(resJson.q1.ro + "Q1Vi"),
      }

      if (dataQ1.jp && dataQ1.vi) {
        PostAnswer(dataQ1);
      }


      const dataQ2 = {
        name: localStorage.getItem("Q2Name"),
        ro: resJson.q2.ro,
        jp: localStorage.getItem(resJson.q2.ro + "Q2Jp"),
        // if quesion and VI are the same, ignore VI by set same value with question
        vi: resJson.q2.ro === resJson.q2.options[0].vi ? resJson.q2.ro : localStorage.getItem(resJson.q2.ro + "Q2Vi"),
      }
      if (dataQ2.jp && dataQ2.vi) {
        PostAnswer(dataQ2);
      }


      const app1 = document.getElementById(`app1`);
      const app2 = document.getElementById(`app2`);

      const q1a = resJson.q1.options.random([]);
      const q1b = resJson.q1.options.random([q1a.index]);
      const q1c = resJson.q1.options.random([q1a.index, q1b.index]);
      const q1d = resJson.q1.options.random([q1a.index, q1b.index, q1c.index]);
      console.log(q1a.index, q1b.index, q1c.index, q1d.index);

      const q2a = resJson.q2.options.random([]);
      const q2b = resJson.q2.options.random([q2a.index]);
      const q2c = resJson.q2.options.random([q2a.index, q2b.index]);
      const q2d = resJson.q2.options.random([q2a.index, q2b.index, q2c.index]);
      

      app1.innerHTML = `
        <div id="messsage1"></div>
        <div class="Q1">
          <div id="questionRoQ1">${resJson.q1.ro || 'Hết'}</div>
          <div class="jp">
            <div id="Q1JpA">${q1a.jp}</div>
            <div id="Q1JpB">${q1b.jp}</div>
            <div id="Q1JpC">${q1c.jp}</div>
            <div id="Q1JpD">${q1d.jp}</div>
          </div>
          ${resJson.q1.ro !== resJson.q1.options[0].vi ? 
            `<br/>
          <div class="vi">
            <div id="Q1ViA">${q1a.vi}</div>
            <div id="Q1ViB">${q1b.vi}</div>
            <div id="Q1ViC">${q1c.vi}</div>
            <div id="Q1ViD">${q1d.vi}</div>
          </div>`
            : ``
          }
        </div>
        <input id=Q1Name />
        `;

      app2.innerHTML = `
        <div id="messsage2"></div>
        <div class="Q2">
          <div id="questionRoQ2">${resJson.q2.ro}</div>
          <div class="jp">
            <div id="Q2JpA">${q2a.jp}</div>
            <div id="Q2JpB">${q2b.jp}</div>
            <div id="Q2JpC">${q2c.jp}</div>
            <div id="Q2JpD">${q2d.jp}</div>
          </div>
          ${resJson.q1.ro !== resJson.q1.options[0].vi ?  
            `<br />
            <div class="vi">
              <div id="Q2ViA">${q2a.vi}</div>
              <div id="Q2ViB">${q2b.vi}</div>
              <div id="Q2ViC">${q2c.vi}</div>
              <div id="Q2ViD">${q2d.vi}</div>
            </div>`
            : ``
          }
        </div>
        <input id=Q2Name />
        `;
      if (localStorage.getItem("Q1Name")) {
        document.getElementById("Q1Name").value = localStorage.getItem("Q1Name");
      }
      if (localStorage.getItem("Q2Name")) {
        document.getElementById("Q2Name").value = localStorage.getItem("Q2Name");
      }

      document.getElementById("Q1Name").onkeyup = function (event) {
        localStorage.setItem("Q1Name", document.getElementById("Q1Name").value);
      }
      document.getElementById("Q2Name").onkeyup = function (event) {
        localStorage.setItem("Q2Name", document.getElementById("Q2Name").value);
      }

      const buttons = document.querySelectorAll("div>.jp>div,div>.vi>div");

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function (e) {
          console.log(e.target);

          if (document.getElementById("Q1Name").value === "" || document.getElementById("Q2Name").value === "") {
            alert("Hãy điền tên của cả 2 người");
            return;
          }
          const buttonId = e.target.id;

          document.querySelectorAll(`div.jp>div,div.vi>div`).forEach(button => {
            if (button.id.includes(buttonId.substr(0, 2))) {
              button.style.backgroundColor = "";
              button.style.color = "";
            }
          })
          const message = document.getElementById(`messsage${buttonId.substr(1, 1)}`);
          if(message) {
            message.innerHTML = ``;
          }
          e.target.style.backgroundColor = "blue";
          e.target.style.color = "white";
          const questionRo = document.getElementById("questionRo" + buttonId.substr(0, 2)).innerText;
          const Q1Name = localStorage.getItem("Q1Name");
          const Q2Name = localStorage.getItem("Q2Name");
          const savedAnswerId = buttonId.substr(2, 2) === 'Vi' ? 'Jp' : 'Vi';
          const savedAnswer = localStorage.getItem(questionRo + buttonId.substr(0, 2) + savedAnswerId);
          localStorage.clear();
          localStorage.setItem("Q1Name", Q1Name? Q1Name : "");
          localStorage.setItem("Q2Name", Q2Name? Q2Name : "");
          localStorage.setItem(questionRo + buttonId.substr(0, 4), e.target.innerText);
          if(savedAnswer !== null) {
            localStorage.setItem(questionRo + buttonId.substr(0, 2) + savedAnswerId, savedAnswer);
          }
          const data = {
            name: document.getElementById(buttonId.substr(0, 2) + "Name").value,
            ro: questionRo,
            jp: localStorage.getItem(questionRo + buttonId.substr(0, 2) + "Jp"),
            // if quesion and VI are the same, ignore VI by set same value with question
            vi: resJson.q1.ro === resJson.q1.options[0].vi ? questionRo : localStorage.getItem(questionRo + buttonId.substr(0, 2) + "Vi")
          }
          console.log(data);

          if (data.jp && data.vi) {
            document.querySelectorAll("div.jp>div,div.vi>div").forEach(button => {
              if (button.id.includes(buttonId.substr(0, 2))) {
                button.style.backgroundColor = "";
                button.style.color = "";
              }
            })
            PostAnswer(data);
          }
        });
      }
    })
    .catch(error => console.log("Error: " + error))


}


function PostAnswer(data) {

  fetch(HOST_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(response => {
      const resJson = JSON.parse(response);
      console.log(resJson);
      if (resJson.name === document.getElementById("Q1Name").value) {

        const message1 = document.getElementById("messsage1");

        if (resJson.jp && resJson.vi) {
          message1.innerHTML = `<span class="text-success message top-5">OK</span>`;
          const question1 = document.querySelector(".Q1");
          question1.style.display = "none";
        } else {
          message1.innerHTML = `<span class="text-danger">NG</span>`;
          localStorage.removeItem(data.ro + "Q1Jp");
          localStorage.removeItem(data.ro + "Q1Vi");
          const loader = document.createElement("div");
          loader.id = "loader";
          loader.innerHTML = "Chờ 1 giây để thử lại";
          message1.appendChild(loader);
          setTimeout(() => {
            loader.remove();
          }, 1000);

        }
      } else {
        const message2 = document.getElementById("messsage2");
        if (resJson.jp && resJson.vi) {
          message2.innerHTML = `<span class="text-success message top-5">OK</span>`;
          const question2 = document.querySelector(".Q2");
          question2.style.display = "none";
        } else {
          message2.innerHTML = `<span class="text-danger">NG</span>`;
          localStorage.removeItem(data.ro + "Q2Jp");
          localStorage.removeItem(data.ro + "Q2Vi");
          const loader = document.createElement("div");
          loader.id = "loader";
          loader.innerHTML = "Chờ 1 giây để thử lại";
          message2.appendChild(loader);
          setTimeout(() => {
            loader.remove();
          }, 1000);
        }
      }
    })
    .catch(error => console.log("Error: " + error));
}


test();

