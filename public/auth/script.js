const createSessionButton = document.getElementById("create-session");

let currentSession = null;
let interval = null;

/* ---------------------------
   START POLLING
----------------------------*/
function startPollingQR() {
  if (interval) clearInterval(interval);

  interval = setInterval(fetchQR, 2000);
}

/* ---------------------------
   FETCH QR
----------------------------*/
async function fetchQR() {
  if (!currentSession) return;

  const res = await fetch(`/sessions/${currentSession}/qr`);
  const data = await res.json();

  const qrBox = document.getElementById("qr");

  if (!data.qr) {
    qrBox.innerText = "Waiting for QR...";
    return;
  }

  qrBox.innerHTML = "";

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, data.qr);

  qrBox.appendChild(canvas);

  // 💾 save session whenever we successfully get QR
  localStorage.setItem("session", currentSession);
}

/* ---------------------------
   CREATE SESSION
----------------------------*/
async function createSession() {
  const res = await fetch("/sessions", {
    method: "POST",
  });

  const data = await res.json();

  setSession(data.id);

  startPollingQR();
}

/* ---------------------------
   SET SESSION (central logic)
----------------------------*/
function setSession(id) {
  currentSession = id;

  document.getElementById("sessionId").innerText = "Session: " + currentSession;

  localStorage.setItem("session", currentSession);
}

/* ---------------------------
   LOAD SESSION ON START
----------------------------*/
function loadSavedSession() {
  const saved = localStorage.getItem("session");

  if (!saved) return;

  setSession(saved);

  startPollingQR();
}

/* ---------------------------
   INIT
----------------------------*/
createSessionButton.addEventListener("click", createSession);

loadSavedSession();
