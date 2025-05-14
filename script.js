const SERPER_API_KEY = 'ad64850e8a1b337b74805908adfb4b129fce75a1';
const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("user-input");

window.onload = () => {
  const saved = localStorage.getItem("chatHistory");
  if (saved) chatBox.innerHTML = saved;
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
};

function sendMessage() {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  inputField.value = "";
  showTyping();
  getSearchResponse(userMessage);
}

function appendMessage(sender, message) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = message;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.id = "typing";
  typing.innerHTML = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getSearchResponse(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query })
    });

    const data = await response.json();
    document.getElementById("typing")?.remove();

    let answer = "";
    if (data.answerBox?.answer) {
      answer = data.answerBox.answer;
    } else if (data.answerBox?.snippet) {
      answer = data.answerBox.snippet;
    } else if (data.organic && data.organic.length > 0) {
      const first = data.organic[0];
      answer = `${first.snippet}<br><a href="${first.link}" target="_blank">Source</a>`;
    } else {
      answer = "I couldn't find anything useful. Try rephrasing!";
    }

    appendMessage("bot", answer);
  } catch (err) {
    console.error(err);
    document.getElementById("typing")?.remove();
    appendMessage("bot", "Error getting search result.");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function clearChat() {
  chatBox.innerHTML = "";
  localStorage.removeItem("chatHistory");
}

function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice input not supported in this browser.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    inputField.value = transcript;
    sendMessage();
  };
  recognition.onerror = function(e) {
    console.error("Speech error", e);
  };
  recognition.start();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.error("SW registration failed", err));
}
