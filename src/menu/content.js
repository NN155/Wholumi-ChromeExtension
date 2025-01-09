let Menu = null;
document.addEventListener("keydown", async (event) => {
    if (event.key === "Insert") {
        await insert();
    }
});

async function insert() {
    if (Menu) {
        Menu.toggleWindowVisibility();
        Menu.correctWindowPosition();
    } else {
        Menu = new CustomMenu();
        await Menu.createWindow();
        Menu.toggleWindowVisibility();
        Menu.correctWindowPosition();
        window.addEventListener("resize", () => {
            if (Menu) {
                Menu.correctWindowPosition();
            }
        });
    }
}
