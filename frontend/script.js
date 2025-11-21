const messagesEl = document.getElementById('messages');
const form = document.getElementById('composer');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

function appendMessage(text, cls = 'bot'){
  const el = document.createElement('div');
  el.className = `msg ${cls}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendPrompt(prompt){
  appendMessage(prompt, 'user');
  appendMessage('Thinking...', 'bot');

  try{
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({prompt})
    });

    const data = await res.json();
    // Replace last bot placeholder
    const bots = messagesEl.querySelectorAll('.msg.bot');
    const placeholder = bots[bots.length-1];
    if(data && data.text){
      placeholder.textContent = data.text;
      placeholder.classList.remove('bot');
      placeholder.classList.add('bot');
    }else{
      placeholder.textContent = data.error || 'No response.';
    }
  }catch(err){
    const bots = messagesEl.querySelectorAll('.msg.bot');
    const placeholder = bots[bots.length-1];
    placeholder.textContent = 'Error: ' + err.message;
  }
}

form.addEventListener('submit', e =>{
  e.preventDefault();
  const v = input.value.trim();
  if(!v) return;
  sendPrompt(v);
  input.value='';
  input.style.height = 'auto';
});

// auto-resize textarea and support Enter to send (Shift+Enter for newline)
input.addEventListener('input', ()=>{
  input.style.height = 'auto';
  input.style.height = Math.min(300, input.scrollHeight) + 'px';
});

input.addEventListener('keydown', e =>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    sendBtn.click();
  }
});

// Small welcome message
appendMessage('Welcome to TechChat — ask me to generate code, explain ideas, or draft snippets!', 'bot');