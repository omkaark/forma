// TODO: Need to learn OpenGL

var canvas = {};

var mouseClickPosWithinRect = {
    x: null, y: null, reset: () => {
        mouseClickPosWithinRect.x = null;
        mouseClickPosWithinRect.y = null;
    }
};

var ghostEventListeners = {
    handleDragOver: (e) => {
        e.preventDefault();
    },
    handleDrag: (e) => {
        if (!e.screenX && !e.screenY) return;
        outputInfo(e.target);
        move(e.offsetX, e.offsetY);
    },
    handleDragStart: (e) => {
        mouseClickPosWithinRect.x = e.pageX - e.target.parentElement.offsetLeft;
        mouseClickPosWithinRect.y = e.pageY - e.target.parentElement.offsetTop;
    },
    handleDragEnd: (e) => {
        mouseClickPosWithinRect.reset();
    },
};

class Rectangle {
    constructor({ id, height = 100, width = 100 }) {
        this.id = 'rect' + String(id);
        this.element = document.getElementById('rect' + id);
        this.height = height;
        this.width = width;
        this.changeShape({ height, width, zIndex: id * 10 });
    }

    shapeshift(x, y) {
        this.element.style.width = this.element.offsetWidth + x + "px";
        this.element.style.height = this.element.offsetHeight + y + "px";
    }

    changeShape(args) {
        this.element.style.width = args.width + "px";
        this.element.style.height = args.height + "px";
        // this.element.style.zIndex = String.toString(args.zIndex);
    }

    static addHelpers(element) {
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
}

function addRect() {
    let rect = document.createElement('div');
    let id = 'rect' + Object.keys(canvas).length;
    rect.setAttribute('id', id);
    rect.setAttribute('class', 'rect');
    Rectangle.addHelpers(rect);
    document.getElementById("canvas").appendChild(rect);
    rect = new Rectangle({ id: Object.keys(canvas).length });
    canvas[Object.keys(canvas).length] = rect.element;
    return id;
}

function move(x, y) {
    let elem = document.querySelector(".active");
    elem.style.left = elem.offsetLeft + x - mouseClickPosWithinRect.x + "px";
    elem.style.top = elem.offsetTop + y - mouseClickPosWithinRect.y + "px";
}

function resize(x, y, classes) {
    elem = document.querySelector(".active");
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

function resizeGhost() {
    elem = document.querySelector(".active .ghost");
    elem2 = document.querySelector(".active");
    elem.style.width = elem2.style.width;
    elem.style.height = elem2.style.height;
}
function outputInfo(element) {
    document.getElementById("width-info").innerHTML = element.offsetWidth ? element.offsetWidth + "px" : "";
    document.getElementById("height-info").innerHTML = element.offsetHeight ? element.offsetHeight + "px" : "";
}

function setElementActive(element) {
    if (element.parentElement.classList.contains("active") || element.classList.contains("active")) return;
    for (let i of document.getElementsByClassName("rect")) {
        i.setAttribute("class", "rect");
    }
    if (element.parentElement.id !== "canvas") {
        element.parentElement.setAttribute('class', 'rect active');
        outputInfo(element.parentElement)
    } else {
        element.setAttribute('class', 'rect active');
        outputInfo(element)
    }
    try {
        document.querySelector(".active .ghost").removeEventListener("dragover", ghostEventListeners.handleDragOver, false);
        document.querySelector(".active .ghost").removeEventListener("drag", ghostEventListeners.handleDrag, false);
        document.querySelector(".active .ghost").removeEventListener("dragstart", ghostEventListeners.handleDragStart, false);
        document.querySelector(".active .ghost").removeEventListener("dragend", ghostEventListeners.handleDragEnd, false);
    } catch (e) {
        console.log(e);
    } finally {
        document.querySelector(".active .ghost").addEventListener("dragover", ghostEventListeners.handleDragOver, false);
        document.querySelector(".active .ghost").addEventListener("drag", ghostEventListeners.handleDrag, false);
        document.querySelector(".active .ghost").addEventListener("dragstart", ghostEventListeners.handleDragStart, false);
        document.querySelector(".active .ghost").addEventListener("dragend", ghostEventListeners.handleDragEnd, false);
    }
}

function handleKeyDown(e) {
    let { keyCode } = e;
    let { which } = e;
    console.log(which);
    switch (keyCode) {
        case 8:
            try {
                const elem = document.querySelector('.active');
                delete canvas[parseInt(elem.id.slice(4))];
                elem.remove();
                outputInfo(elem);
            } catch (e) {
                console.log(e);
            }
            break;
        case 187:
            console.log('+ clicked');
    }
}

function handleColorChange(e) {
    document.querySelector(".active").style.backgroundColor = document.querySelector("#color-info").value;
}

document.getElementById("add-rect").addEventListener("click", (e) => {
    const id = addRect();

    const rectElement = document.querySelector("#" + id);
    rectElement.addEventListener("click", (e) => {
        setElementActive(e.target);
    }, false);

    document.querySelector("#" + id + " .ghost").addEventListener("click", (e) => {
        setElementActive(e.target.parentElement);
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
            resizeGhost();
        }, false);

        element.addEventListener("drag", (e) => {
            outputInfo(e.target.parentElement);
            if (!e.screenX && !e.screenY) return;
            resize(e.offsetX, e.offsetY, e.target.classList);
        }, false);
    });
    setElementActive(document.querySelector("#" + id));
}, false);

document.querySelector("#canvas").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        for (let i of document.getElementsByClassName("rect")) {
            i.setAttribute("class", "rect");
        }
        outputInfo(e);
    }
});

document.querySelector("#color-info").addEventListener("input", handleColorChange, false);

document.body.addEventListener("keydown", handleKeyDown, false);