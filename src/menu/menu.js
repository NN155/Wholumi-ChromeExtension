class CustomMenu {
    constructor() {
        this.windowDiv = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isVisible = false;
        this.currentTab = 0;
        this.position = null;
        this.boundDrag = this.drag.bind(this);
        this.boundStopDragging = this.stopDragging.bind(this);
        this.tabs = [];
    }

    async createWindow() {

        this.menu = new MenuElement()
        this.windowDiv = this.menu.windowDiv;
        this.shadowRoot = this.menu.shadowRoot;

        this.position = await this.getWindowPosition();
        if (this.position) {
            this.setWindowPosition(this.position);
        } else {
            this._centerWindow();
        }

        document.body.appendChild(this.windowDiv);

        this.addDragFunctionality();

        await this.initializeTabs();
        this._addWheelListener();
    }

    async initializeTabs() {
        const tabsData = [
            await miscTab(this),
            settingTab(this)
        ];

        this.tabs = tabsData;

        const tabContainer = this.shadowRoot.querySelector(".tab-container");
        const contentContainer = this.shadowRoot.querySelector(".content-container");

        tabsData.forEach((tab, index) => {
            const tabElement = tab.render();
            tabElement.dataset.index = index;
            tabContainer.appendChild(tabElement);

            const contentElement = tab.renderContent();
            contentElement.style.display = index === 0 ? "block" : "none";
            contentContainer.appendChild(contentElement);

            tabElement.addEventListener("click", () => {
                this.switchTab(index);
                if (typeof tab.onActivate === "function") {
                    tab.onActivate();
                }
            });
        });

        this.tabs[this.currentTab].onActivate();
        this.switchTab(this.currentTab);
    }

    switchTab(index) {
        this.currentTab = index;

        const tabContainer = this.shadowRoot.querySelector(".tab-container");
        const contentContainer = this.shadowRoot.querySelector(".content-container");

        const tabElements = tabContainer.querySelectorAll(".tab");
        const contentElements = contentContainer.querySelectorAll(".window-content");

        tabElements.forEach((tab, i) => {
            tab.classList.toggle("active", i === index);
        });

        contentElements.forEach((content, i) => {
            content.style.display = i === index ? "block" : "none";
        });
    }

    addDragFunctionality() {
        const dragBar = this.shadowRoot.querySelector(".drag-bar");

        dragBar.addEventListener("mousedown", (e) => {
            this.isDragging = true;
            this.offsetX = e.clientX - this.windowDiv.getBoundingClientRect().left;
            this.offsetY = e.clientY - this.windowDiv.getBoundingClientRect().top;

            document.addEventListener("mousemove", this.boundDrag);
            document.addEventListener("mouseup", this.boundStopDragging);
        });
    }

    drag(e) {
        if (this.isDragging) {
            const hasVerticalScrollbar = window.innerWidth > document.documentElement.clientWidth;
            const scrollbarWidth = hasVerticalScrollbar ? window.innerWidth - document.documentElement.clientWidth : 0;

            const maxLeft = window.innerWidth - this.windowDiv.offsetWidth - scrollbarWidth;
            const maxTop = window.innerHeight - this.windowDiv.offsetHeight;

            const newLeft = e.clientX - this.offsetX;
            const newTop = e.clientY - this.offsetY;
            this.setWindowPosition({
                left: `${Math.min(Math.max(newLeft, 0), maxLeft)}px`,
                top: `${Math.min(Math.max(newTop, 0), maxTop)}px`
            });
        }
    }

    correctWindowPosition() {
        const hasVerticalScrollbar = window.innerWidth > document.documentElement.clientWidth;
        const scrollbarWidth = hasVerticalScrollbar ? window.innerWidth - document.documentElement.clientWidth : 0;

        const { left, top } = this.position;
        const maxLeft = window.innerWidth - this.windowDiv.offsetWidth - scrollbarWidth;
        const maxTop = window.innerHeight - this.windowDiv.offsetHeight;
        this.setWindowPosition({
            left: `${Math.min(parseInt(left, 10), maxLeft)}px`,
            top: `${Math.min(parseInt(top, 10), maxTop)}px`
        });
    }

    setWindowPosition({ left, top }) {
        this.windowDiv.style.left = left;
        this.windowDiv.style.top = top;
    }

    stopDragging() {
        this.isDragging = false;
        document.removeEventListener("mousemove", this.boundDrag);
        document.removeEventListener("mouseup", this.boundStopDragging);

        this.saveWindowPosition();
    }

    toggleWindowVisibility(isVisible = !this.isVisible) {
        if (this.windowDiv) {
            this.isVisible = isVisible;
            this.windowDiv.style.display = isVisible ? "block" : "none";
        }
    }

    saveWindowPosition() {
        this.position = {
            left: this.windowDiv.style.left,
            top: this.windowDiv.style.top
        };
        chrome.storage.local.set({ windowPosition: this.position });
    }

    async getWindowPosition() {
        const response = await this._sendMessageAsync({ action: "get-window-position" });
        if (response && response.position) {
            const { left, top } = response.position;
            return { left, top };
        }
    }

    _addWheelListener() {
        const menuContent = this.shadowRoot.querySelector('.window-content');
        
        menuContent.addEventListener('wheel', (event) => {
            const { scrollTop, scrollHeight, clientHeight } = menuContent;
    
            if (scrollTop + clientHeight >= scrollHeight && event.deltaY > 0) {
                event.preventDefault();
            }
            
            if (scrollTop === 0 && event.deltaY < 0) {
                event.preventDefault();
            }
        });
    }
    
    _centerWindow() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const left = Math.floor((screenWidth - this.windowDiv.offsetWidth) / 2);
        const top = Math.floor((screenHeight - this.windowDiv.offsetHeight) / 2);
        this.setWindowPosition({ left: `${left}px`, top: `${top}px` });
    }

    _sendMessageAsync(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError));
                } else {
                    resolve(response);
                }
            });
        });
    }
}


class MenuElement {
    constructor() {
        this.windowDiv = document.createElement("div");
        this.windowDiv.appendChild(menuWindowStyle.cloneNode(true));
        this.windowDiv.id = "custom-window";
        this.windowDiv.className = "custom-window";
        this.shadowRoot = this.windowDiv.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(menuStyle.cloneNode(true));
        const menuElement = document.createElement('div');
        menuElement.innerHTML = `
        <div id="helper-objects-wholumulu" class="drag-bar">
            <span>AnimeStars Helper</span>
        </div>
        <div id="helper-objects-wholumulu" class="tab-container"></div>
        <div id="helper-objects-wholumulu" class="content-container"></div>
        `;
        this.shadowRoot.appendChild(menuElement);
    }
}