Array.prototype.random = function (ignore) {
  let randomIndex = Math.floor(Math.random() * this.length);
  while (this[randomIndex] === ignore) {
    randomIndex = Math.floor(Math.random() * this.length);
  }
  return this[randomIndex];
}
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
