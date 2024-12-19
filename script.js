const commandPrefix = "/"; // Prefijo para comandos
const apiKey = 'AIzaSyB67nQ8iixZePLp9JNj_1oEDn0TJSvkLso';
let lastPinterestCard = null;

//  Este es el cambio importante!
const originalSendMessage = sendMessage;

 sendMessage = async function() {
        const messageText = userInput.value.trim();
           if (!messageText) return;

           if (messageText.startsWith(commandPrefix)) {
             await processCommand(messageText);
           }else {
           originalSendMessage();
           }
}


async function processCommand(commandText) {
     const trimmedCommand = commandText.trim();
      const commandParts = trimmedCommand.slice(commandPrefix.length).split(/\s+/);
    const commandName = commandParts[0];
      const commandArgs = commandParts.slice(1).join(' ');
    try {
        switch (commandName) {
            case 'wanted':
                await handleWantedCommand(commandArgs);
                break;
            case 'pinterest':
               await  handlePinterestCommand(commandArgs);
                break;
           case 'summarize':
                await handleSummarizeCommand(commandArgs);
              break;
            default:
              const errorMensaje = new ChatMessage(`Comando desconocido: ${commandName}`, false);
               addMessageToChat(errorMensaje);
                 chatHistory.push(errorMensaje);
                saveChatHistory();
        }
    } catch (error) {
       const errorMensaje = new ChatMessage(`Error al procesar el comando: ${error.message}`, false);
       addMessageToChat(errorMensaje);
        chatHistory.push(errorMensaje);
        saveChatHistory();
   }
}

async function handleSummarizeCommand(textToSummarize) {
      showLoadingIndicator(true);
   try{
            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
             const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                  body: JSON.stringify({
                    contents: [{
                        parts: [{ text:`Summarize this text: ${textToSummarize}` }]
                    }]
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error en el API: ${error.error.message}`);
            }
            const data = await response.json();
              const geminiResponseText = data.candidates[0].content.parts[0].text;

            const geminiMessage = new ChatMessage(geminiResponseText, false, 'en');
             addMessageToChat(geminiMessage);
              chatHistory.push(geminiMessage);
             saveChatHistory();
               showLoadingIndicator(false);
        } catch (error) {
           showLoadingIndicator(false);
           throw error;
       }
}

async function handleWantedCommand(imageUrl) {
        showLoadingIndicator(true);
    if (!imageUrl) {
        const errorMensaje = new ChatMessage("Debes proporcionar una URL de imagen.", false);
        addMessageToChat(errorMensaje);
         chatHistory.push(errorMensaje);
          saveChatHistory();
           showLoadingIndicator(false);
        return;
    }
       try {
             const url = `https://api-rin-tohsaka.vercel.app/maker/wanted?image=${encodeURIComponent(imageUrl)}`;
          const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            const errorMensaje = new ChatMessage(`Error de la API de wanted: ${errorText}`, false);
             addMessageToChat(errorMensaje);
             chatHistory.push(errorMensaje);
              saveChatHistory();
               showLoadingIndicator(false);
            return;
        }

           const imageBlob = await response.blob();
           const imageUrl = URL.createObjectURL(imageBlob);
           const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
           imageElement.style.maxWidth = '100%';
           const geminiMessage = new ChatMessage("", false);
           geminiMessage.messageDiv = document.createElement('div');
           geminiMessage.messageDiv.classList.add('message');
            geminiMessage.messageDiv.classList.add('gemini-message');
            geminiMessage.messageDiv.classList.add('gemini-message-color');
            geminiMessage.messageDiv.appendChild(imageElement);
            geminiMessage.messageDiv.innerHTML +=  `<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
          chatMessagesDiv.appendChild(geminiMessage.messageDiv);
             chatHistory.push(geminiMessage);
             saveChatHistory();
        } catch(error){
            const errorMensaje = new ChatMessage(`Error al procesar imagen: ${error.message}`, false);
             addMessageToChat(errorMensaje);
              chatHistory.push(errorMensaje);
              saveChatHistory();
        } finally {
            showLoadingIndicator(false);
        }
}
async function handlePinterestCommand(searchTerm) {
     showLoadingIndicator(true);

     if(!searchTerm) {
         const errorMensaje = new ChatMessage("Debes proporcionar un término de búsqueda.", false);
          addMessageToChat(errorMensaje);
           chatHistory.push(errorMensaje);
            saveChatHistory();
            showLoadingIndicator(false);
             return;
     }
      try {
           const url = `https://api.pinterest.com/v1/pins/search?query=${encodeURIComponent(searchTerm)}&limit=1`;
            const response = await fetch(url, {
             headers: {
               'Authorization': 'Bearer 1234567890',  //Reemplaza por una API key de Pinterest si la tienes, si no la API pública va a responder igual
                'Content-Type': 'application/json'
           }
        });
            if (!response.ok) {
                 const errorText = await response.text();
                 const errorMensaje = new ChatMessage(`Error de la API de Pinterest: ${errorText}`, false);
                 addMessageToChat(errorMensaje);
                  chatHistory.push(errorMensaje);
                  saveChatHistory();
                  showLoadingIndicator(false);
                 return;
            }
           const data = await response.json();
          if(data.pins && data.pins.length > 0) {
              const pin = data.pins[0];

              const card = createPinterestCard(pin.images['236x'], pin.title, pin.link);
               addPinterestCardToChat(card);

               if (lastPinterestCard) {
                    lastPinterestCard.remove();
                   }
                    lastPinterestCard = card;
           }else {
                const errorMensaje = new ChatMessage("No se encontraron resultados para tu busqueda en Pinterest.", false);
                addMessageToChat(errorMensaje);
                 chatHistory.push(errorMensaje);
                  saveChatHistory();
            }

    }
       catch (error) {
           const errorMensaje = new ChatMessage(`Error al buscar en Pinterest: ${error.message}`, false);
            addMessageToChat(errorMensaje);
            chatHistory.push(errorMensaje);
             saveChatHistory();
       }
       finally {
           showLoadingIndicator(false);
        }
}

function createPinterestCard(imageUrl, title, link) {
    const card = document.createElement('div');
     card.classList.add('pinterest-message');
      if(document.body.classList.contains('light-theme')){
       card.classList.add('light-theme');
       }
       card.innerHTML = `
          <img class="pinterest-image" src="${imageUrl}" alt="${title}">
           <h3 class="pinterest-title">${title}</h3>
           <a class="pinterest-link" href="${link}" target="_blank" rel="noopener noreferrer">Ver en Pinterest</a>
      <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>
      `;
   return card;
}

function addPinterestCardToChat(card) {
    chatMessagesDiv.appendChild(card);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;

}