   class ChatMessage {
        constructor(text, isUser, language = 'es') {
            this.text = text;
            this.isUser = isUser;
             this.language = language;
        }
    }

 const chatMessagesDiv = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.querySelector('.clear-chat-button');
     const settingsButton = document.querySelector('.settings-button');
      const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
      const themeSelector = document.getElementById('theme-selector');
    const fontSelector = document.getElementById('font-selector');
     const languageSelector = document.getElementById('language-selector');
      const translationSelector = document.getElementById('translation-selector');
     const voiceButton = document.getElementById('voice-button');

    const loadingIndicator = document.getElementById('loading-indicator');
      const apiKey = 'AIzaSyB67nQ8iixZePLp9JNj_1oEDn0TJSvkLso';
    let chatHistory = [];
     let isVoiceRecognitionActive = false;
    let recognition;

    function showLoadingIndicator(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    function loadChatHistory() {
        const storedHistory = localStorage.getItem('chatHistory');
          if (storedHistory) {
             chatHistory = JSON.parse(storedHistory);
             chatHistory.forEach(message => addMessageToChat(message));
         }
     }

    function saveChatHistory() {
       localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
   }
    function addMessageToChat(message) {
         const messageDiv = document.createElement('div');
         messageDiv.classList.add('message');
        if (message.isUser) {
            messageDiv.classList.add('user-message');
             messageDiv.innerHTML = message.text;
        } else {
            messageDiv.classList.add('gemini-message');
              let translatedText = message.text;
                 if (translationSelector.value === 'enabled' && message.language !== languageSelector.value ) {
                     translateText(message.text, message.language, languageSelector.value).then(translation => {
                          translatedText = translation;
                         messageDiv.innerHTML = `${translatedText}  <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
                    });
                }else {
                    messageDiv.innerHTML = `${translatedText}  <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
                }
        }
       chatMessagesDiv.appendChild(messageDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }
    async function translateText(text, sourceLang, targetLang) {
        try {
            const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang
                }),
            });
            if (!response.ok) {
                throw new Error('Error al traducir el texto: ' + response.status);
            }
           const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error("Error al traducir:", error);
            return text;
        }
    }
    function copyToClipboard(button) {
        const messageText = button.parentElement.innerText;
        navigator.clipboard.writeText(messageText)
            .then(() => {
               console.log('Texto copiado al portapapeles');
           })
            .catch(err => {
                console.error('Error al copiar texto: ', err);
            });
    }

    async function sendMessage() {
         const messageText = userInput.value.trim();
            if (!messageText) return;

            const userMessage = new ChatMessage(messageText, true, languageSelector.value);
            addMessageToChat(userMessage);
            chatHistory.push(userMessage);
             saveChatHistory();
            userInput.value = '';
            showLoadingIndicator(true);
        try {
             const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                  body: JSON.stringify({
                    contents: [{
                        parts: [{ text: messageText }]
                    }]
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                 const errorMensaje = new ChatMessage(`Error al obtener respuesta: ${error.error.message}`, false);
               addMessageToChat(errorMensaje);
                  chatHistory.push(errorMensaje);
                 saveChatHistory();
                   showLoadingIndicator(false);
                console.error("Error al consumir el API", response.status, error.error.message);
                return;
            }
            const data = await response.json();
            const geminiResponseText = data.candidates[0].content.parts[0].text;
            const geminiMessage = new ChatMessage(geminiResponseText, false);
             addMessageToChat(geminiMessage);
            chatHistory.push(geminiMessage);
              saveChatHistory();
             showLoadingIndicator(false);
        } catch (error) {
            const errorMensaje = new ChatMessage("Error inesperado. Inténtalo de nuevo más tarde.", false);
            addMessageToChat(errorMensaje);
            chatHistory.push(errorMensaje);
            saveChatHistory();
                showLoadingIndicator(false);
           console.error("Error inesperado:", error);

        }
    }
      function clearChat() {
            chatMessagesDiv.innerHTML = '';
             chatHistory = [];
           localStorage.removeItem('chatHistory');
        }
    function toggleSettingsModal() {
        settingsModal.style.display = settingsModal.style.display === 'none' ? 'block' : 'none';
    }
    function applyTheme(theme) {
        document.body.classList.remove('light-theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }
       localStorage.setItem('chatTheme', theme);
    }
   function applyFont(font) {
        document.body.style.fontFamily = font;
        localStorage.setItem('chatFont', font);
    }
    function loadSettings() {
        const storedTheme = localStorage.getItem('chatTheme');
         if (storedTheme) {
            applyTheme(storedTheme);
             themeSelector.value = storedTheme;
         }
         const storedFont = localStorage.getItem('chatFont');
         if (storedFont) {
            applyFont(storedFont);
             fontSelector.value = storedFont;
        }
        const storedTranslation = localStorage.getItem('chatTranslation');
         if (storedTranslation) {
            translationSelector.value = storedTranslation;
         }
         const storedLanguage = localStorage.getItem('chatLanguage');
         if (storedLanguage) {
            languageSelector.value = storedLanguage;
         }
    }
      function handleSettingsChange(event) {
         const selectedTheme = themeSelector.value;
       const selectedFont = fontSelector.value;
          const selectedTranslation = translationSelector.value;
      if (event.target.id === 'theme-selector'){
           applyTheme(selectedTheme);
       }
       if (event.target.id === 'font-selector'){
           applyFont(selectedFont);
      }
        if (event.target.id === 'translation-selector'){
              localStorage.setItem('chatTranslation', selectedTranslation);
             chatHistory.forEach(message => addMessageToChat(message));
         }
     }
   function startVoiceRecognition() {
      if ('webkitSpeechRecognition' in window) {
          recognition = new webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
          recognition = new SpeechRecognition();
      }
        if(recognition)
        {
             recognition.lang = languageSelector.value;
           recognition.continuous = false;
            recognition.interimResults = false;

           recognition.onstart = () => {
               isVoiceRecognitionActive = true;
             voiceButton.classList.add('active');
               voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
               console.log('Reconocimiento de voz iniciado.');

           };
            recognition.onresult = (event) => {
                 const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                 sendMessage();
              stopVoiceRecognition();
            };
           recognition.onerror = (event) => {
              stopVoiceRecognition();
             console.error('Error en el reconocimiento de voz:', event.error);
           };
             recognition.onend = () => {
                 if(isVoiceRecognitionActive) {
                     stopVoiceRecognition();
                 }
          };
         recognition.start();
        } else{
            alert('La API de Reconocimiento de Voz no es compatible en este navegador.');
        }
   }
  function stopVoiceRecognition() {
        if(recognition) {
            recognition.stop();
              voiceButton.classList.remove('active');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        }
          isVoiceRecognitionActive = false;
      }
    function handleLanguageChange() {
         chatHistory.forEach(message => addMessageToChat(message));
         localStorage.setItem('chatLanguage', languageSelector.value);
          if(recognition){
              recognition.lang = languageSelector.value;
         }
    }
    clearChatButton.addEventListener('click', clearChat);
    sendButton.addEventListener('click', sendMessage);
    settingsButton.addEventListener('click', toggleSettingsModal);
     closeSettingsModal.addEventListener('click', toggleSettingsModal);
    themeSelector.addEventListener('change', handleSettingsChange);
     fontSelector.addEventListener('change', handleSettingsChange);
     translationSelector.addEventListener('change', handleSettingsChange);
     voiceButton.addEventListener('click',  () => {
        if (!isVoiceRecognitionActive) {
            startVoiceRecognition();
        } else {
            stopVoiceRecognition();
       }

   });
    userInput.addEventListener('keypress', function(event) {
       if (event.key === 'Enter') {
          sendMessage();
        }
    });
  languageSelector.addEventListener('change', handleLanguageChange);
   loadChatHistory();
    loadSettings();