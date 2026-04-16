async function loadSessions() {
  const container = document.getElementById("sessions");

  container.innerHTML = "Loading...";

  try {
    const res = await fetch("/sessions");
    const sessions = await res.json();

    container.innerHTML = "";

    if (!sessions.length) {
      container.innerHTML = "<p>No sessions found</p>";
      return;
    }

    sessions.forEach((s) => {
      const div = document.createElement("div");
      div.className = "session";

      div.innerHTML = `
        <div>
          <strong>ID:</strong> ${s.id}
        </div>

        <div class="status ${s.status}">
          ${s.status}
        </div>
      `;

      div.addEventListener("click", () => {
        window.location.href = `/user?id=${s.id}`;
      });

      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "Error loading sessions";
  }
}

/* auto refresh every 3 seconds */
loadSessions();
setInterval(loadSessions, 3000);
