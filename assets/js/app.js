
import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Replace these two values with your Supabase project details.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("loginForm");
const authPanel = document.getElementById("authPanel");
const authMessage = document.getElementById("authMessage");
const userStatus = document.getElementById("userStatus");
const logoutButton = document.getElementById("logoutButton");
const assistant = document.getElementById("assistant");
const chatForm = document.getElementById("chatForm");
const userMessage = document.getElementById("userMessage");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");
const connectionStatus = document.getElementById("connectionStatus");
const aiStatus = document.getElementById("aiStatus");

const configured =
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");

function addMessage(content, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = content;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

async function updateSession(session) {
  if (session) {
    userStatus.textContent = session.user.email;
    authPanel.classList.add("hidden");
    assistant.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    connectionStatus.textContent = "Signed in. NEXORA AI is ready to test.";
  } else {
    userStatus.textContent = "Not signed in";
    authPanel.classList.remove("hidden");
    assistant.classList.add("hidden");
    logoutButton.classList.add("hidden");
    connectionStatus.textContent = "Please sign in to access NEXORA AI.";
  }
}

if (!configured) {
  authMessage.textContent =
    "Configuration required: add your Supabase project URL and publishable key in app.js.";
} else {
  const { data } = await supabase.auth.getSession();
  await updateSession(data.session);

  supabase.auth.onAuthStateChange((_event, session) => {
    updateSession(session);
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!configured) return;

  authMessage.textContent = "Signing in...";

  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  });

  authMessage.textContent = error
    ? error.message
    : "Login successful.";
});

logoutButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) connectionStatus.textContent = error.message;
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!configured) return;

  const message = userMessage.value.trim();
  if (!message) return;

  addMessage(message, "user-message");
  userMessage.value = "";
  sendButton.disabled = true;
  aiStatus.textContent = "Thinking...";
  connectionStatus.textContent = "NEXORA is processing your request...";

  try {
    const { data, error } = await supabase.functions.invoke(
      "nexora-brain",
      { body: { message } }
    );

    if (error) throw error;

    if (!data?.success || !data?.answer) {
      throw new Error(data?.error || "No AI response received.");
    }

    addMessage(data.answer, "ai-message");
    aiStatus.textContent = "Connected";
    connectionStatus.textContent = "NEXORA AI responded successfully.";

  } catch (error) {
    console.error("NEXORA AI error:", error);
    addMessage(
      "I could not process that request. Please check your connection and Supabase function configuration.",
      "ai-message"
    );
    aiStatus.textContent = "Connection issue";
    connectionStatus.textContent = error.message || "Request failed.";
  } finally {
    sendButton.disabled = false;
  }
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav a").forEach(item =>
      item.classList.remove("active")
    );
    link.classList.add("active");
  });
});

console.log("NEXORA dashboard initialized.");
