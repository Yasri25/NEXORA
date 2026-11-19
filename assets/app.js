
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://gbevfxrxusobxeanldnr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3YmXxFiycWETYi-4xnb3Jg_-nHK2-ff";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// PAGE ELEMENTS
const $ = (id) => document.getElementById(id);

const loginForm = $("loginForm");
const authPanel = $("authPanel");
const authMessage = $("authMessage");
const userStatus = $("userStatus");
const logoutButton = $("logoutButton");

const assistant = $("assistant");
const chatForm = $("chatForm");
const userMessage = $("userMessage");
const messages = $("messages");
const sendButton = $("sendButton");

const connectionStatus = $("connectionStatus");
const aiStatus = $("aiStatus");

// DISPLAY CHAT MESSAGES
function addMessage(content, type) {
  const element = document.createElement("div");

  element.className = `message ${type}`;
  element.textContent = content;

  messages.appendChild(element);
  messages.scrollTop = messages.scrollHeight;
}

// UPDATE LOGIN SESSION
function showSession(session) {
  if (session) {
    userStatus.textContent = session.user.email || "Signed in";

    authPanel.classList.add("hidden");
    assistant.classList.remove("hidden");
    logoutButton.classList.remove("hidden");

    connectionStatus.textContent =
      "Signed in. You can now communicate with NEXORA.";
  } else {
    userStatus.textContent = "Not signed in";

    authPanel.classList.remove("hidden");
    assistant.classList.add("hidden");
    logoutButton.classList.add("hidden");

    connectionStatus.textContent =
      "Please sign in to use NEXORA AI.";
  }
}

// INITIALIZE SUPABASE
async function initialize() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  showSession(data.session);

  supabase.auth.onAuthStateChange(
    (_event, session) => {
      showSession(session);
    }
  );
}

// LOGIN
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  authMessage.textContent = "Signing in...";

  const email = $("email").value.trim();
  const password = $("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  authMessage.textContent = error
    ? error.message
    : "Login successful.";
});

// LOGOUT
logoutButton?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    connectionStatus.textContent = error.message;
  }
});

// SEND MESSAGE TO NEXORA AI
chatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userMessage.value.trim();

  if (!message) return;

  addMessage(message, "user-message");

  userMessage.value = "";
  sendButton.disabled = true;

  aiStatus.textContent = "Thinking...";

  connectionStatus.textContent =
    "NEXORA is processing your message...";

  try {
    const { data, error } = await supabase.functions.invoke(
      "nexora-brain",
      {
        body: {
          message: message
        }
      }
    );

    if (error) throw error;

    if (!data?.success || !data?.answer) {
      throw new Error(
        data?.error || "No AI response received."
      );
    }

    addMessage(data.answer, "ai-message");

    aiStatus.textContent = "Connected";

    connectionStatus.textContent =
      "NEXORA replied successfully.";

  } catch (error) {
    console.error("NEXORA AI Error:", error);

    addMessage(
      `NEXORA encountered an error: ${error.message}`,
      "ai-message"
    );

    aiStatus.textContent = "Connection issue";

    connectionStatus.textContent =
      error.message || "Request failed.";

  } finally {
    sendButton.disabled = false;
  }
});

// NAVIGATION
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {

    document.querySelectorAll(".nav a").forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// START NEXORA
initialize();

console.log("NEXORA Dashboard initialized successfully.");
