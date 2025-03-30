const menuStyle = document.createElement('style');
const menuWindowStyle = document.createElement('style');

menuWindowStyle.textContent = `

:root { 
    --main-menu-color: #2c3e50;
    --border-menu-color: #34495e;
    --main-color: #8a1ec9;
    --bg-color: #34495e;
    --second-bg-color: #2c3e50;
    --third-bg-color: #cccccc;
    --text-color: #ecf0f1;
    --second-text-color: #ecf0f1;
    --third-text-color: #888888;
    /* Switcher root */
    --switch-height: 28px;
    --switch-width: 50px;
    --switch-knob-size: 20px;
    --switch-gap: 8px;
    --label-font-size: 12px;
    --label-margin: 12px;
}

.custom-window {
    position: fixed;
    top: 50px;
    left: 50px;
    width: 25rem;
    height: auto;
    min-width: 350px;
    min-height: auto;
    background: var(--main-menu-color); 
    border: 1px solid var(--border-menu-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    cursor: default;
    display: none;
    border-radius: 8px;
    font-family: 'Arial', sans-serif;
    color: var(--text-color);
}
`;

menuStyle.textContent = `

.drag-bar {
    padding: 10px;
    background: var(--bg-color);
    color: var(--text-color);
    cursor: move;
    user-select: none;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
    display: flex;
    justify-content: center;
}

.drag-bar input {
    margin-right: 5px;
    -webkit-appearance: none;
    padding: 0;
    border: 2px solid var(--bg-color);
    border-radius: 10px;
    width: 20px;
    height: 20px;
}

.drag-bar input::-webkit-color-swatch {
  border: none;
  border-radius: 10px;
  padding: 0;
}
.drag-bar input::-webkit-color-swatch-wrapper {
  border: none;
  border-radius: 10px;
  padding: 0;
}

.drag-bar span {
    margin: auto;
}

.drag-bar:hover {
    background: var(--main-color);
}

.tab-container {
    display: flex;
    background: var(--bg-color);
    border-top: 2px solid var(--main-color);
}

.tab {
    padding: 10px;
    cursor: pointer;
    user-select: none;
    color: var(--text-color);
    text-align: center;
    font-size: 14px;
    flex-grow: 1;
    transition: background-color 0.3s ease;
}

.tab:hover {
    background: var(--main-color);
}

.tab.active {
    background: var(--main-color);
    font-weight: bold;
}

.window-content {
    padding: 10px;
    user-select: none;
    color: var(--text-color);
    background: var(--bg-color);
    font-size: 16px;
    line-height: 1.5;
    text-align: left;
    border-top: 1px solid var(--main-color);
    height: 13rem;
    overflow-y: auto;
    border-radius: 0px 0px 8px 8px;
}

.window-content::-webkit-scrollbar {
    width: 6px; /* Товщина скролбару */
}

.window-content::-webkit-scrollbar-thumb {
    background-color: var(--main-color);
    border-radius: 10px;
    border: 2px solid var(--bg-color);
}

.window-content::-webkit-scrollbar-track {
    background: var(--second-bg-color);
    border-radius: 10px;
}

.window-content::-webkit-scrollbar-thumb:hover {
    background-color: var(--main-color);
}

.window-content p, .window-content span, .window-content label {
    margin: 10px 0;
    color: var(--text-color);
    font-size: 14px;
    line-height: 1.4;
}

`;

const switcher = `
.custom-switch-extension {
  display: inline-flex;
  align-items: center;
  gap: var(--switch-gap);
}

.switch-component-extension {
  margin: 8px;
  position: relative;
  display: flex;
  height: var(--switch-height);
}

.switch-extension {
  display: inline-flex;
  align-items: center;
  height: var(--switch-height);
}

.switch-extension input {
  display: none;
}

.slider-extension {
  cursor: pointer;
  width: var(--switch-width);
  height: var(--switch-height);
  background-color: var(--third-bg-color);
  border-radius: calc(var(--switch-height) / 2);
  position: relative;
  transition: background-color 0.4s;
}

.slider-extension:before {
  position: absolute;
  content: "";
  height: var(--switch-knob-size);
  width: var(--switch-knob-size);
  left: calc((var(--switch-height) - var(--switch-knob-size)) / 2);
  bottom: calc((var(--switch-height) - var(--switch-knob-size)) / 2);
  background-color: var(--text-color);
  border-radius: 50%;
  transition: transform 0.4s;
}

.switch-extension input:checked + .slider-extension {
  background-color: var(--main-color);
}

.switch-extension input:checked + .slider-extension:before {
  transform: translateX(calc(var(--switch-width) - var(--switch-height)));
}

.switch-label-text {
  margin-left: var(--label-margin);
  margin-right: var(--label-margin);
  font-size: var(--label-font-size);
  white-space: nowrap;
  text-align: left;
}

.switch-extension input:disabled + .slider-extension {
  background-color: var(--bg-color);
}

`
const button = `
button.extension {
    min-width: 100px;
    position: relative;
    margin: 0 auto;
    padding: 5px 10px;
    text-align: center;
    color: var(--second-text-color);
    background-color: var(--main-color);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: background-image 0.3s ease;
}

button.extension:disabled {
    cursor: default;
    opacity: 0.6;
}
`

const input = `
.custom-input-extension {
  width: 100px;
  height: 30px;
  padding: 10px;
  margin: 5px 0;
  box-sizing: border-box;
  border: 3px solid var(--main-color);
  border-radius: 10px;
  background-color: var(--bg-color);
  font-size: 16px;
  color: var(--text-color);
}

.custom-input-extension:focus, .custom-input-extension:focus {
    outline: none;
}

.custom-input-extension::placeholder {
    color: var(--third-text-color);
}
`

menuStyle.textContent += switcher;
menuStyle.textContent += button;
menuStyle.textContent += input;