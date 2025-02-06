async function visualsTab() {
    const elementsConfig = [
        {html: "Color", id: 'main-color', label: "Main Color", value: '#8a1ec9', targetVariable: '--main-color', group: 'Colors'},
        {html: "Color", id: 'bg-color', label: "Background Color", value: '#34495e', targetVariable: '--bg-color', group: 'Colors'},
        {html: "Color", id: 'second-bg-color', label: "Second Background Color", value: '#2c3e50', targetVariable: '--second-bg-color', group: 'Colors'},
        {html: "Color", id: 'third-bg-color', label: "Third Background Color", value: '#cccccc', targetVariable: '--third-bg-color', group: 'Colors'},
        {html: "Color", id: 'text-color', label: "Text Color", value: '#ecf0f1', targetVariable: '--text-color', group: 'Colors'},
        {html: "Color", id: 'second-text-color', label: "Second Text Color", value: '#ecf0f1', targetVariable: '--second-text-color', group: 'Colors'},
        {html: "Color", id: 'third-text-color', label: "Third Text Color", value: '#888888', targetVariable: '--third-text-color', group: 'Colors'},
    ];

    const content = Tab.createContent(elementsConfig);

    const tab = new Tab('Visuals', content);

    tab.elementsConfig = elementsConfig;
    tab.tabData = [];

    return tab;
}