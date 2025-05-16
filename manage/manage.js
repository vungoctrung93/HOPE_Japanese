Array.prototype.random = function (ignore) {
  let randomIndex = Math.floor(Math.random() * this.length);
  while (this[randomIndex] === ignore) {
    randomIndex = Math.floor(Math.random() * this.length);
  }
  return this[randomIndex];
}
const HOST_URL = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1] + ":8080";
function nextQuestion() {
  fetch(HOST_URL + "/nextquestion", {
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
      
      const app1 = document.getElementById(`app1`);
      const app2 = document.getElementById(`app2`);
      app1.innerHTML = `
        <h1>${resJson.q1.jp}</h1>
        <div class="ro">
          <button id="ARo">${resJson.q1.options[0].ro}</button>
          <button id="BRo">${resJson.q1.options[1].ro}</button>
          <button id="CRo">${resJson.q1.options[2].ro}</button>
          <button id="DRo">${resJson.q1.options[3].ro}</button>
        </div>
        <div id="messsage1"></div>
        <div class="vi">
          <button id="AVi">${resJson.q1.options[0].vi}</button>
          <button id="BVi">${resJson.q1.options[1].vi}</button>
          <button id="CVi">${resJson.q1.options[2].vi}</button>
          <button id="DVi">${resJson.q1.options[3].vi}</button>
        </div>
        `;

      app2.innerHTML = `
        <h1>${resJson.q2.jp}</h1>
        <div class="ro">
          <button id="ARo">${resJson.q1.options[0].ro}</button>
          <button id="BRo">${resJson.q1.options[1].ro}</button>
          <button id="CRo">${resJson.q1.options[2].ro}</button>
          <button id="DRo">${resJson.q1.options[3].ro}</button>
        </div>
        <div id="messsage2"></div>
        <div class="vi">
          <button id="AVi">${resJson.q1.options[0].vi}</button>
          <button id="BVi">${resJson.q1.options[1].vi}</button>
          <button id="CVi">${resJson.q1.options[2].vi}</button>
          <button id="DVi">${resJson.q1.options[3].vi}</button>
        </div>
        `;

    })
    .catch(error => console.log("Error: " + error))


}

test();