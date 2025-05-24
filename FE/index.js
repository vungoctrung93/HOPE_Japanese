
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
        ro: resJson.q1.ro,
        jp: localStorage.getItem(resJson.q1.ro + "Q1Jp"),
        vi: localStorage.getItem(resJson.q1.ro + "Q1Vi")
      }

      if (dataQ1.jp && dataQ1.vi) {
        PostAnswer(dataQ1);
      }


      const dataQ2 = {
        ro: resJson.q2.ro,
        jp: localStorage.getItem(resJson.q2.ro + "Q2Jp"),
        vi: localStorage.getItem(resJson.q2.ro + "Q2Vi")
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
      console.log(q2a.index, q2b.index, q2c.index, q2d.index);

      app1.innerHTML = `
        <input id=Q1Name />
        <div id="messsage1"></div>
        <div class="Q1">
          <h1 id="questionRoQ1">${resJson.q1.ro}</h1>
          <div class="jp">
            <button id="Q1JpA">${q1a.jp}</button>
            <button id="Q1JpB">${q1b.jp}</button>
            <button id="Q1JpC">${q1c.jp}</button>
            <button id="Q1JpD">${q1d.jp}</button>
          </div>
          <br/>
          <div class="vi">
            <button id="Q1ViA">${q1a.vi}</button>
            <button id="Q1ViB">${q1b.vi}</button>
            <button id="Q1ViC">${q1c.vi}</button>
            <button id="Q1ViD">${q1d.vi}</button>
          </div>
        </div>
        `;

      app2.innerHTML = `
        <input id=Q2Name />
        <div id="messsage2"></div>
        <div class="Q2">
          <h1 id="questionRoQ2">${resJson.q2.ro}</h1>
          <div class="jp">
            <button id="Q2JpA">${q2a.jp}</button>
            <button id="Q2JpB">${q2b.jp}</button>
            <button id="Q2JpC">${q2c.jp}</button>
            <button id="Q2JpD">${q2d.jp}</button>
          </div>
          <br />
          <div class="vi">
            <button id="Q2ViA">${q2a.vi}</button>
            <button id="Q2ViB">${q2b.vi}</button>
            <button id="Q2ViC">${q2c.vi}</button>
            <button id="Q2ViD">${q2d.vi}</button>
          </div>
        </div>
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
    })
    .catch(error => console.log("Error: " + error))


}

document.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    if (document.getElementById("Q1Name").value === "" || document.getElementById("Q2Name").value === "") {
      alert("Hãy điền tên của cả 2 người");
      return;
    }
    const buttonId = e.target.id;

    document.querySelectorAll("button").forEach(button => {
      if (button.id.includes(buttonId.substr(0, 2))) {
        button.style.backgroundColor = "";
        button.style.color = "";
      }
    })
    e.target.style.backgroundColor = "blue";
    e.target.style.color = "white";
    const questionRo = document.getElementById("questionRo" + buttonId.substr(0, 2)).innerText;
    localStorage.setItem(questionRo + buttonId.substr(0, 4), e.target.innerText);
    const data = {
      name: document.getElementById(buttonId.substr(0, 2) + "Name").value,
      ro: questionRo,
      jp: localStorage.getItem(questionRo + buttonId.substr(0, 2) + "Jp"),
      vi: localStorage.getItem(questionRo + buttonId.substr(0, 2) + "Vi")
    }
    console.log(data);

    if (data.jp && data.vi) {
      document.querySelectorAll("button").forEach(button => {
        if (button.id.includes(buttonId.substr(0, 2))) {
          button.style.backgroundColor = "";
          button.style.color = "";
        }
      })
      PostAnswer(data);
    }
  }
});

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
          message1.innerHTML = `<span class="text-success">OK</span>`;
          const question1 = document.querySelector(".Q1");
          question1.style.display = "none";
        } else {
          message1.innerHTML = `<span class="text-danger">NG</span>`;
      localStorage.removeItem(data.ro + "Q1Jp");
      localStorage.removeItem(data.ro + "Q1Vi");
        }
      } else {
        const message2 = document.getElementById("messsage2");
        if (resJson.jp && resJson.vi) {
          message2.innerHTML = `<span class="text-success">OK</span>`;
          const question2 = document.querySelector(".Q2");
          question2.style.display = "none";
        } else {
          message2.innerHTML = `<span class="text-danger">NG</span>`;
      localStorage.removeItem(data.ro + "Q2Jp");
      localStorage.removeItem(data.ro + "Q2Vi");
        }
      }
    })
    .catch(error => console.log("Error: " + error));
}


test();

