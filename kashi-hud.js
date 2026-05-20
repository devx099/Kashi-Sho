// 1. Inject the "M PLUS Rounded 1c" Font into the website's <head>
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

let hudElement = document.getElementById('kashi-sho-hud');

// 2. Build the UI
if (!hudElement) {
  hudElement = document.createElement('div');
  hudElement.id = 'kashi-sho-hud';
  
  Object.assign(hudElement.style, {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    
    // WIDER HUD FIX: More padding and a minimum width
    padding: '16px 64px',
    minWidth: '450px', 
    maxWidth: '80%',   
    
    // Glassmorphism background
    background: 'rgba(15, 15, 15, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    
    // ANIME SUBTITLE TYPOGRAPHY
    color: '#ffffff',
    fontFamily: '"M PLUS Rounded 1c", sans-serif', // Injected font
    fontSize: '24px',
    fontWeight: '700', // Bold for readability
    letterSpacing: '1px',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.9), 0px 0px 8px rgba(0, 0, 0, 0.7)', // Double outline shadow
    
    lineHeight: '1.4',
    textAlign: 'center',
    zIndex: '2147483647', 
    pointerEvents: 'none', 
    transition: 'opacity 0.4s ease-in-out',
    opacity: '0', 
    boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.5)'
  });

  document.body.appendChild(hudElement);
}

// 3. Listen for the Router
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "RENDER_HUD") {
    if (message.text) {
      // Use innerHTML so our cascading <span> tags render correctly!
      hudElement.innerHTML = message.text;
      hudElement.style.opacity = '1';
    } else {
      hudElement.style.opacity = '0';
    }
  }
});