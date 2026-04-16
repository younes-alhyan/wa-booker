const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");

let selectedContact = null;

document.getElementById("sessionId").innerText =
  "Session: " + sessionId;

/* ---------------------------
   LOAD CONTACTS
----------------------------*/
async function loadContacts() {
  const res = await fetch(`/sessions/${sessionId}/contacts`);
  const contacts = await res.json();

  const container = document.getElementById("contacts");
  container.innerHTML = "";

  if (!contacts.length) {
    container.innerHTML = "<p>No contacts found</p>";
    return;
  }

  contacts.forEach((c) => {
    const div = document.createElement("div");
    div.className = "contact";

    const name = c.name || c.pushName || c.id || "Unknown";

    div.innerText = name;

    div.addEventListener("click", () => {
      selectedContact = c.id;

      document.getElementById("selectedContact").innerText =
        "To: " + selectedContact;
    });

    container.appendChild(div);
  });
}

/* ---------------------------
   SEND MESSAGE
----------------------------*/
async function sendMessage() {
  const message = document.getElementById("messageInput").value;

  if (!selectedContact) {
    alert("Select a contact first");
    return;
  }

  await fetch(`/sessions/${sessionId}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: selectedContact,
      message
    })
  });

  document.getElementById("messageInput").value = "";
  alert("Message sent");
}

/* ---------------------------
   INIT
----------------------------*/
loadContacts();