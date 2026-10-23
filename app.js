

const chat = document.getElementById("chat");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const history = [];

function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = "message " + role;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.appendChild(bubble);
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  history.push({ role: "user", content: message });
  input.value = "";

  const button = form.querySelector("button");
  button.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-12) })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Bağlantı hatası");
    }

    addMessage(data.reply, "bot");
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    addMessage("Hata: " + error.message, "bot");
  } finally {
    button.disabled = false;
    input.focus();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});
