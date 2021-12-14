// TODO: Need to learn OpenGL

var canvas = {
    length: 0, elements: [], active: null, copied: null, reset: () => {
        canvas.length = 0;
        canvas.elements = [];
        canvas.active = null;
        canvas.copied = null;
    },
    getNewId: () => {
        canvas.length += 1;
        return canvas.length - 1;
    },
    populateCanvas: () => {
        let cNodes = document.querySelector('#canvas').childNodes;
        for (node of cNodes) {
            canvas.length = parseInt(node.id.slice(4)) + 1;
            canvas.elements.push(node);
        }
        canvas.active = canvas.elements[cNodes.length - 1];
        console.log(canvas.active);
    }
};



class FileHandlers {
    static saveFile() {
        if (confirm("This will download an html file on your computer, do you consent?")) {
            function download(filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }
            // Start file download.
            download("savefile.txt", document.querySelector('#canvas').innerHTML);
        }
    }

    static loadFile(e) {
        const readSingleFile = (e) => {
            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                canvas.reset();
                var contents = e.target.result;
                document.querySelector('#canvas').innerHTML = contents;
                let components = document.querySelector('#canvas').childNodes;
                for (let i = 0; i < components.length; i++) {
                    components[i].classList.remove('active');
                    Component.addEventListeners(components[i].id);
                }
                canvas.populateCanvas();
            };
            reader.readAsText(file);
        }
        try {
            document.querySelector('#file-loader').removeEventListener('change', readSingleFile, false);
        } finally {
            document.querySelector('#file-loader').addEventListener('change', readSingleFile, false);
        }
        document.querySelector('#file-loader').click();
    }
}

class KeyboardListenerHandlers { // Utility class
    static processKey(e) {
        let { which } = e;
        if (e.target.nodeName !== "BODY") return;
        switch (which) {
            case 8: // backspace
                KeyboardListenerHandlers.handleBackspace();
                break;
            case 37: // left
                e.shiftKey ? Component.handleObjectMoveByKey.shiftLeft(e) : Component.handleObjectMoveByKey.left(e);
                break;
            case 38: // up
                e.shiftKey ? Component.handleObjectMoveByKey.shiftUp(e) : Component.handleObjectMoveByKey.up(e);
                break;
            case 39: // right
                e.shiftKey ? Component.handleObjectMoveByKey.shiftRight(e) : Component.handleObjectMoveByKey.right(e);
                break;
            case 40: // down
                e.shiftKey ? Component.handleObjectMoveByKey.shiftDown(e) : Component.handleObjectMoveByKey.down(e);
                break;
            case 66: // B
                e.shiftKey ? KeyboardListenerHandlers.handleShiftB() : null;
                break;
            case 67: // C
                e.metaKey || e.ctrlKey ? KeyboardListenerHandlers.handleCtrlC(e) : null;
                console.log("hmm")
                break;
            case 82: // R
                e.shiftKey ? KeyboardListenerHandlers.handleShiftR() : null;
                break;
            case 86: // V
                e.metaKey || e.ctrlKey ? KeyboardListenerHandlers.handleCtrlV(e) : null;
                break;
            default:
                return;
        }
    }

    static handleBackspace() {
        try {
            const elem = document.querySelector('.active');
            canvas.elements.splice(parseInt(elem.id.slice(4)), 1);
            elem.remove();
            document.querySelector('#text-info').style.display = "none";
            Component.outputInfo(elem);
        } catch (err) {
            console.log(err);
        }
    }

    static handleShiftR() {
        document.querySelector('#add-rect').click();
    }

    static handleShiftB() {
        document.querySelector('#add-text').click();
    }

    static handleCtrlC(e) {
        try {
            navigator.clipboard.writeText(document.querySelector('.active').innerHTML);
        } catch (e) {

        }
    }

    static async handleCtrlV(e) {
        let cb = await navigator.clipboard.readText();
        let elem = document.createElement('div');
        elem.id = canvas.getNewId();

    }
}

var keyboardListeners = {
    handleKeyDown: (e) => {
        KeyboardListenerHandlers.processKey(e);
    },
}

var ghostEventListeners = {
    handleDragOver: (e) => {
        e.preventDefault();
    },
    handleDrag: (e) => {
        if (!e.screenX && !e.screenY) return;
        Component.outputInfo(e.target);
        Component.move(e.offsetX, e.offsetY);
    },
    handleDragStart: (e) => {
        mouseClickPosWithinComponent.x = e.pageX - e.target.parentElement.offsetLeft;
        mouseClickPosWithinComponent.y = e.pageY - e.target.parentElement.offsetTop;
    },
    handleDragEnd: (e) => {
        mouseClickPosWithinComponent.reset();
    },
};

var mouseClickPosWithinComponent = {
    x: null, y: null, reset: () => {
        mouseClickPosWithinComponent.x = null;
        mouseClickPosWithinComponent.y = null;
    }
};

class Component {
    static handleObjectMoveByKey = {
        "left": (e) => { // up
            mouseClickPosWithinComponent.reset();
            Component.move(-10, 0)
        },
        "shiftLeft": (e) => { // shift + up
            mouseClickPosWithinComponent.reset();
            Component.move(-1, 0)
        },
        "up": (e) => { // up
            mouseClickPosWithinComponent.reset();
            Component.move(0, -10)
        },
        "shiftUp": (e) => { // shift + up
            mouseClickPosWithinComponent.reset();
            Component.move(0, -1)
        },
        "right": (e) => { // up
            mouseClickPosWithinComponent.reset();
            Component.move(10, 0)
        },
        "shiftRight": (e) => { // shift + up
            mouseClickPosWithinComponent.reset();
            Component.move(1, 0)
        },
        "down": (e) => { // up
            mouseClickPosWithinComponent.reset();
            Component.move(0, 10)
        },
        "shiftDown": (e) => { // shift + up
            mouseClickPosWithinComponent.reset();
            Component.move(0, 1)
        },
    }

    static move(x, y) {
        let elem = document.querySelector(".active");
        elem.style.left = elem.offsetLeft + x - mouseClickPosWithinComponent.x + "px";
        elem.style.top = elem.offsetTop + y - mouseClickPosWithinComponent.y + "px";
    }

    static resize(x, y, classes) {
        const elem = document.querySelector(".active");
        if (classes[1] === "b-r") {
            elem.style.width = elem.offsetWidth + x + "px";
            elem.style.height = elem.offsetHeight + y + "px";
        } else if (classes[1] === "t-r") {
            elem.style.top = elem.offsetTop + y + "px";
            elem.style.width = elem.offsetWidth + x + "px";
            elem.style.height = elem.offsetHeight - y + "px";
        } else if (classes[1] === "b-l") {
            elem.style.left = elem.offsetLeft + x + "px";
            elem.style.width = elem.offsetWidth - x + "px";
            elem.style.height = elem.offsetHeight + y + "px";
        } else if (classes[1] === "t-l") {
            elem.style.top = elem.offsetTop + y + "px";
            elem.style.left = elem.offsetLeft + x + "px";
            elem.style.width = elem.offsetWidth - x + "px";
            elem.style.height = elem.offsetHeight - y + "px";
        }
    }

    static outputInfo(element) {
        document.getElementById("width-info").innerHTML = element.offsetWidth ? element.offsetWidth + "px" : "";
        document.getElementById("height-info").innerHTML = element.offsetHeight ? element.offsetHeight + "px" : "";
    }

    static resizeGhost() {
        const elem = document.querySelector(".active .ghost");
        const elem2 = document.querySelector(".active");
        elem.style.width = elem2.style.width;
        elem.style.height = elem2.style.height;
    }

    static setElementActive(element) {
        if (element.parentElement.classList.contains("active") || element.classList.contains("active")) return;

        try { canvas.active.classList.remove("active") } catch (e) { };

        if (element.parentElement.id !== "canvas") {
            element.parentElement.classList.add('active');
            Component.outputInfo(element.parentElement);
        } else {
            element.classList.add('active');
            Component.outputInfo(element);
        }

        canvas.active = document.querySelector(".active");
        Component.resizeGhost()

        try {
            document.querySelector(".active .ghost").removeEventListener("dragover", ghostEventListeners.handleDragOver, false);
            document.querySelector(".active .ghost").removeEventListener("drag", ghostEventListeners.handleDrag, false);
            document.querySelector(".active .ghost").removeEventListener("dragstart", ghostEventListeners.handleDragStart, false);
            document.querySelector(".active .ghost").removeEventListener("dragend", ghostEventListeners.handleDragEnd, false);
        } catch (err) {
            console.log(err);
        } finally {
            canvas.active = document.querySelector(".active");
            document.querySelector(".active .ghost").addEventListener("dragover", ghostEventListeners.handleDragOver, false);
            document.querySelector(".active .ghost").addEventListener("drag", ghostEventListeners.handleDrag, false);
            document.querySelector(".active .ghost").addEventListener("dragstart", ghostEventListeners.handleDragStart, false);
            document.querySelector(".active .ghost").addEventListener("dragend", ghostEventListeners.handleDragEnd, false);
            let color = document.querySelector(".active").style.backgroundColor.slice(4, -1).split(', ');
            document.querySelector('#color-info').value = color[0] ? "#" + componentToHex(parseInt(color[0])) + componentToHex(parseInt(color[1])) + componentToHex(parseInt(color[2])) : '#000001';
            function componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }
        }

        if (element.parentElement.getAttribute('type') === 'text' || element.getAttribute('type') === 'text') {
            document.querySelector('#text-info').style.display = "unset";
            document.querySelector('#text-content').value = document.querySelector('.active p').innerHTML !== "" ? document.querySelector('.active p').innerHTML : (() => {
                document.querySelector('.active p').innerHTML = document.querySelector('#text-content').placeholder;
                return "";
            })();
            document.querySelector('#text-font-size').value = document.querySelector('.active').style.fontSize.slice(0, -2);
        } else {
            document.querySelector('#text-info').style.display = "none";
        }
    }

    static handleColorChange() {
        switch (canvas.active.getAttribute('type')) {
            case 'rect':
                canvas.active.style.backgroundColor = document.querySelector("#color-info").value;
                break;
            case 'text':
                canvas.active.style.color = document.querySelector("#color-info").value;
        }
    }

    static changeShape(element, args) {
        element.style.width = args.width + "px";
        element.style.height = args.height + "px";
        element.style.zIndex = String.toString(args.zIndex);
    }

    static addFrame(element) {
        let ghost = document.createElement('div');
        ghost.setAttribute('class', 'ghost');
        ghost.setAttribute('draggable', 'true');
        element.appendChild(ghost);
        for (let i of ['t-l', 't-r', 'b-l', 'b-r']) {
            let corner = document.createElement('div');
            corner.setAttribute('class', 'controller ' + i);
            corner.setAttribute('draggable', 'true')
            element.appendChild(corner);
        }
    }

    static addEventListeners(id) {
        const mainElement = document.querySelector("#" + id);
        mainElement.addEventListener("click", (e) => {
            Component.setElementActive(e.target);
        }, false);

        document.querySelector("#" + id + " .ghost").addEventListener("click", (e) => {
            Component.setElementActive(e.target.parentElement);
        }, false);

        const corners = document.querySelectorAll('#' + id + ' .controller');
        corners.forEach(function (element) {
            element.addEventListener("dragover", (e) => {
                e.preventDefault();
            }, false);

            element.addEventListener("dragstart", (e) => {
                element.style.opacity = 0;
            }, false);

            element.addEventListener("dragend", (e) => {
                element.style.opacity = 1;
                Component.resizeGhost();
            }, false);

            element.addEventListener("drag", (e) => {
                Component.outputInfo(e.target.parentElement);
                if (!e.screenX && !e.screenY) return;
                Component.resize(e.offsetX, e.offsetY, e.target.classList);
            }, false);
        });
        Component.setElementActive(document.querySelector("#" + id));
    }
}

class Rectangle extends Component {
    constructor({ id, height = 100, width = 100 }) {
        super();
        this.id = 'rect' + String(id);
        this.element = document.getElementById('rect' + id);
        this.height = height;
        this.width = width;
        Component.changeShape(this.element, { height, width, zIndex: id });
    }

    static addRect() {
        let rect = document.createElement('div');
        let numId = canvas.getNewId();
        let id = 'rect' + numId;
        rect.setAttribute('id', id);
        rect.setAttribute('class', 'rect');
        rect.setAttribute('type', 'rect');
        Component.addFrame(rect);
        document.getElementById("canvas").appendChild(rect);
        rect = new Rectangle({ id: numId });
        canvas.elements.push(rect);
        return id;
    }
}

class TextBox extends Component {
    constructor({ id, text = "", fontSize = 15, color = "#00000d", textAlign = "center", height = 30, width = 200 }) {
        super();
        this.id = 'text' + id;
        this.element = document.getElementById('text' + id);
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.textAlign = textAlign;
        this.height = height;
        this.width = width;
        Component.changeShape(this.element, { height, width, zIndex: id });
        TextBox.initText(this.element, { text, fontSize, color, textAlign });
    }

    static initText(element, args) {
        element.style.fontSize = args.fontSize;
        element.children[0].innerHTML = args.text;
        element.style.color = args.color;
        element.style.textAlign = args.textAlign;
    }

    static addFrame(element) {
        let ghost = document.createElement('div');
        ghost.setAttribute('class', 'ghost');
        ghost.setAttribute('draggable', 'true');
        element.appendChild(ghost);
        let corner = document.createElement('div');
        corner.setAttribute('class', 'controller b-r');
        corner.setAttribute('draggable', 'true')
        element.appendChild(corner);
    }

    static handleContentChange(e) {
        canvas.active.childNodes[0].innerHTML = e.target.value ? e.target.value : e.target.placeholder;
    }

    static handleFontSizeChange(e) {
        if (e.target.value < 0) {
            document.querySelector('#text-font-size').value = "1px";
        }
        canvas.active.childNodes[0].style.fontSize = e.target.value;
    }

    static addText() {
        let text = document.createElement('div');
        let p = document.createElement('p');
        text.appendChild(p);
        let numId = canvas.getNewId();
        let id = 'text' + numId;
        text.setAttribute('id', id);
        text.setAttribute('class', 'text');
        text.setAttribute('type', 'text');
        TextBox.addFrame(text);
        document.getElementById("canvas").appendChild(text);
        text = new TextBox({ id: numId });
        canvas.elements.push(text);
        return id;
    }
}

document.getElementById("add-rect").addEventListener("click", (e) => {
    const id = Rectangle.addRect();

    const rectElement = document.querySelector("#" + id);
    rectElement.addEventListener("click", (e) => {
        Rectangle.setElementActive(e.target);
    }, false);

    document.querySelector("#" + id + " .ghost").addEventListener("click", (e) => {
        Rectangle.setElementActive(e.target.parentElement);
    }, false);

    const corners = document.querySelectorAll('#' + id + ' .controller');
    corners.forEach(function (element) {
        element.addEventListener("dragover", (e) => {
            e.preventDefault();
        }, false);

        element.addEventListener("dragstart", (e) => {
            element.style.opacity = 0;
        }, false);

        element.addEventListener("dragend", (e) => {
            element.style.opacity = 1;
            Rectangle.resizeGhost();
        }, false);

        element.addEventListener("drag", (e) => {
            Rectangle.outputInfo(e.target.parentElement);
            if (!e.screenX && !e.screenY) return;
            Rectangle.resize(e.offsetX, e.offsetY, e.target.classList);
        }, false);
    });
    Rectangle.setElementActive(document.querySelector("#" + id));
}, false);

document.getElementById("add-text").addEventListener("click", (e) => {
    const id = TextBox.addText();

    const textElement = document.querySelector("#" + id);
    textElement.addEventListener("click", (e) => {
        TextBox.setElementActive(e.target);
    }, false);

    document.querySelector("#" + id + " .ghost").addEventListener("click", (e) => {
        TextBox.setElementActive(e.target.parentElement);
    }, false);

    const corners = document.querySelectorAll('#' + id + ' .controller');
    corners.forEach(function (element) {
        element.addEventListener("dragover", (e) => {
            e.preventDefault();
        }, false);

        element.addEventListener("dragstart", (e) => {
            element.style.opacity = 0;
        }, false);

        element.addEventListener("dragend", (e) => {
            element.style.opacity = 1;
            TextBox.resizeGhost();
        }, false);

        element.addEventListener("drag", (e) => {
            TextBox.outputInfo(e.target.parentElement);
            if (!e.screenX && !e.screenY) return;
            TextBox.resize(e.offsetX, e.offsetY, e.target.classList);
        }, false);
    });
    TextBox.setElementActive(document.querySelector("#" + id));
}, false);

document.querySelector("#canvas").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        try {
            canvas.active.classList.remove("active");
            document.querySelector('#text-info').style.display = "none";
            Component.outputInfo(e);
            canvas.active = null;
        } finally { return; }
    }
});


document.querySelector("#color-info").addEventListener("input", Component.handleColorChange, false);

document.querySelector("#text-content").addEventListener("input", TextBox.handleContentChange, false);

document.querySelector("#text-font-size").addEventListener("input", TextBox.handleFontSizeChange, false);

document.querySelector("#save-file").addEventListener("click", FileHandlers.saveFile, false);

document.querySelector("#load-file").addEventListener("click", FileHandlers.loadFile, false);

document.body.addEventListener("keydown", KeyboardListenerHandlers.processKey, false);
