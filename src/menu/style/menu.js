const menuStyle = document.createElement('style');
const menuWindowStyle = document.createElement('style');

menuWindowStyle.textContent = `

:root { 
    --main-helper-color: #2c3e50;
    --second-helper-color: #34495e;
    --main-helper-tabs-color: #8a1ec9;
    --second-helper-tabs-color: #34495e;
    --helper-text-color: #ecf0f1;
    /* Switcher root */
    --switch-height: 28px;
    --switch-width: 50px;
    --switch-knob-size: 20px;
    --switch-gap: 8px;
    --switch-background-color: #ccc;

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
    background: var(--main-helper-color); /* Темно-синій колір фону */
    border: 1px solid var(--second-helper-color); /* Темно-сірий бордер */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Тінь */
    z-index: 10000;
    cursor: default;
    display: none;
    border-radius: 8px; /* Заокруглені краї */
    font-family: 'Arial', sans-serif;
    color: var(--helper-text-color);
}
`;

menuStyle.textContent = `

.drag-bar {
    padding: 10px;
    background: var(--second-helper-tabs-color); /* Темно-сірий колір фону */
    color: var(--helper-text-color);
    cursor: move;
    user-select: none; /* Забороняє виділення тексту */
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
    border: 2px solid var(--second-helper-tabs-color);
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
    background: var(--main-helper-tabs-color); /* Світло-бірюзовий при наведенні */
}

.tab-container {
    display: flex;
    background: var(--second-helper-tabs-color); /* Темно-сірий фон для вкладок */
    border-top: 2px solid var(--main-helper-tabs-color); /* Бірюзова лінія для вкладок */
}

.tab {
    padding: 10px;
    cursor: pointer;
    user-select: none;
    color: var(--helper-text-color);
    text-align: center;
    font-size: 14px;
    flex-grow: 1;
    transition: background-color 0.3s ease;
}

.tab:hover {
    background: var(--main-helper-tabs-color); /* Світло-бірюзовий при наведенні */
}

.tab.active {
    background: var(--main-helper-tabs-color); /* Активна вкладка */
    font-weight: bold;
}

.window-content {
    padding: 10px;
    user-select: none;
    color: var(--helper-text-color);
    background: var(--second-helper-tabs-color);
    font-size: 16px;
    line-height: 1.5;
    text-align: left;
    border-top: 1px solid var(--main-helper-tabs-color); /* Лінія між вкладками і вмістом */
    height: 13rem; /* Висота контенту: загальна висота мінус заголовок і вкладки */
    overflow-y: auto; /* Додає вертикальну прокрутку при надлишковому контенті */
    border-radius: 0px 0px 8px 8px;
}

.window-content::-webkit-scrollbar {
    width: 6px; /* Товщина скролбару */
}

.window-content::-webkit-scrollbar-thumb {
    background-color: var(--main-helper-tabs-color); /* Колір кнопки скролбару */
    border-radius: 10px; /* Заокруглені краї скролбару */
    border: 2px solid var(--second-helper-tabs-color); /* Контур для скролбару */
}

.window-content::-webkit-scrollbar-track {
    background: #2c3e50; /* Колір фону для сліду скролбару */
    border-radius: 10px;
}

.window-content::-webkit-scrollbar-thumb:hover {
    background-color: var(--main-helper-tabs-color);
}

.window-content p {
    margin: 10px 0;
    color: var(--helper-text-color);
    font-size: 14px;
    line-height: 1.4;
}

`;

const switcher = `
:root {

}

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
  background-color: var(--switch-background-color);
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
  background-color: var(--helper-text-color);
  border-radius: 50%;
  transition: transform 0.4s;
}

.switch-extension input:checked + .slider-extension {
  background-color: var(--main-helper-tabs-color);
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
  background-color: var(--second-helper-tabs-color);
}

`
const button = `
button.extension {
    min-width: 100px;
    position: relative;
    margin: 0 auto;
    padding: 5px 10px;
    text-align: center;
    color: aliceblue;
    background-color: var(--main-helper-tabs-color);
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

menuStyle.textContent += switcher;
menuStyle.textContent += button;