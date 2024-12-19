body {
    font-family: 'Arial', sans-serif;
    background-color: #2c3e50;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    color: #fff;
    transition: background-color 0.3s ease;
}
.search-container {
  padding: 10px;
  background-color: #2c3e50;
  border-bottom: 1px solid #455a64;
    display: flex;
    justify-content: center;
    align-items: center;
}
.search-container input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #455a64;
  background-color: #34495e;
  color:#fff;
  width: 90%;
  max-width: 700px;
}
.chat-container {
    background-color: #34495e;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    width: 90%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
}
.chat-header {
    background-color: #2c3e50;
    color: #fff;
    padding: 20px;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
     border-bottom: 1px solid #455a64;
}
.chat-title {
    font-size: 1.5em;
    margin:0;
}
.clear-chat-button {
    background-color: transparent;
    border:none;
    color:#fff;
    cursor: pointer;
    transition: color 0.3s;
    padding: 0;
}

.clear-chat-button:hover {
    color:#ccc;
}
.save-chat-button,
.load-chat-button {
    background-color: transparent;
    border:none;
    color:#fff;
    cursor: pointer;
    transition: color 0.3s;
    padding: 0;
        margin-right: 10px;
}

.save-chat-button:hover,
.load-chat-button:hover {
    color:#ccc;
}
.chat-actions{
    display: flex;
    align-items: center;
}
.chat-messages {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scroll-behavior: smooth;
}
.message {
    margin-bottom: 15px;
    padding: 15px;
    border-radius: 10px;
    max-width: 80%;
    position: relative;
}
.user-message {
    background-color: #2980b9;
    align-self: flex-end;
    animation: fadeInRight 0.3s ease;
}
.gemini-message {
    background-color: #34495e;
    align-self: flex-start;
    animation: fadeInLeft 0.3s ease;
}
.copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.3s;
    padding: 0;
}
.copy-button:hover {
    opacity:1;
}
.chat-input-area {
    padding: 10px;
    background-color: #2c3e50;
    border-top: 1px solid #455a64;
}
.input-container {
   display: flex;
    align-items: center;
}
.chat-input-area input {
    flex-grow: 1;
    padding: 15px;
    border: 1px solid #455a64;
    border-radius: 5px;
    margin-right: 10px;
    background-color: #34495e;
    color:#fff;
    margin-left: 10px;
}
.chat-input-area button {
    padding: 15px 25px;
    border: none;
    border-radius: 5px;
    background-color: #2980b9;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-left: 5px;
     margin-right: 10px;
}
.chat-input-area button:hover {
     background-color: #2473ab;
}
.loading-indicator {
    text-align: center;
    padding: 10px;
    color: #ccc;
    margin-top: 10px;
}
.highlight {
   background-color: yellow;
    color: black;
}
/* Configuración */

.chat-settings .settings-button {
    background-color: transparent;
    border:none;
    color:#fff;
    cursor: pointer;
    font-size: 1.5em;
    transition: color 0.3s;
    padding: 0;
}
.chat-settings .settings-button:hover {
    color: #ccc;
}

/* Estilos del Modal */
.settings-modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.7);
}
.modal-content {
    background-color: #34495e;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 500px;
    position: relative;
    border-radius: 8px;
}
.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #fff;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}
.close-button:hover {
    color: #ccc;
}
.settings-options > div{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.settings-options label{
    margin-right: 10px;
}
.settings-options select{
    padding: 10px;
    border-radius: 5px;
    border: none;
    background-color: #2c3e50;
    color: #fff;
}

 /* Animaciones */
@keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
}
/* temas  */
body.light-theme {
    background-color: #f0f0f0;
    color: #333;
}
body.light-theme .chat-container {
    background-color: #fff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

}
body.light-theme .chat-header {
     background-color: #f0f0f0;
    color:#333;
      border-bottom: 1px solid #ccc;
}
body.light-theme .chat-messages {
      background-color: #fff;
}
body.light-theme .user-message {
    background-color: #e1f5fe;
     color: #333;

}
body.light-theme .gemini-message {
      background-color: #f0f0f0;
    color: #333;

}

body.light-theme .chat-input-area {
    background-color: #f0f0f0;
    border-top: 1px solid #ccc;
}

body.light-theme .chat-input-area input {
    background-color: #fff;
     border: 1px solid #ccc;
     color: #333;
}

body.light-theme .chat-input-area button {
   background-color: #2980b9;
    color: white;
}
body.light-theme .chat-input-area button:hover {
      background-color: #2473ab;

}
body.light-theme .settings-modal .modal-content{
     background-color: #fff;
     color: #333;
}
body.light-theme .settings-modal  select{
  background-color: #ccc;
  color: #333;
}
body.light-theme .settings-modal .close-button{
    color: #333;
}
body.light-theme .search-container {
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}
body.light-theme .search-container input {
  background-color: #fff;
    border: 1px solid #ccc;
    color:#333;
}
/* Idiomas */
.language-selector {
  margin-right: 10px;
}

.language-selector select {
     padding: 10px;
    border-radius: 5px;
    border: none;
     background-color: #2c3e50;
    color: #fff;
}

.voice-button {
    background-color: transparent;
    border:none;
    color:#fff;
    cursor: pointer;
    font-size: 1.2em;
    transition: color 0.3s;
    padding: 0;
    margin-right: 5px;
}
.voice-button:hover {
    color:#ccc;
}
.voice-button.active {
    color:#ccc;
}
.user-message-color {
     background-color: #2980b9;
}

.gemini-message-color{
    background-color: #34495e;
}
body.light-theme .user-message-color {
    background-color: #e1f5fe;
    color: #333;
}
body.light-theme .gemini-message-color{
    background-color: #f0f0f0;
    color: #333;
}