// TODO: Need to learn OpenGL

var canvas = [];

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
        this.element.style.zIndex = args.zIndex;
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
    let id = 'rect' + canvas.length;
    rect.setAttribute('id', id);
    rect.setAttribute('class', 'rect');
    Rectangle.addHelpers(rect);
    document.getElementById("canvas").appendChild(rect);
    rect = new Rectangle({ id: canvas.length });
    canvas.push(rect.element);
    return id;
}

function output(name, e) {
    document.getElementById("info-" + name).innerHTML = "(" + e.offsetX + ", " + e.offsetY + ")";
}

function move(x, y) {
    let elem = document.querySelector(".active");
    elem.style.left = elem.offsetLeft - elem.offsetWidth / 2 + x + "px";
    elem.style.top = elem.offsetTop - elem.offsetHeight / 2 + y + "px";
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

function handleObjectMove(e) {
    if (!e.screenX && !e.screenY) return;
    // console.log("id: " + e.target.parentElement.id, "x: " + e.offsetX, "y: " + (e.offsetY - e.target.offsetHeight * parseInt(e.target.parentElement.id.slice(4))));
    move(e.offsetX, e.offsetY - e.target.offsetHeight * parseInt(e.target.parentElement.id.slice(4)));
}

function setElementActive(element) {
    if (element.parentElement.classList.contains("active") || element.classList.contains("active")) return;
    for (let i of document.getElementsByClassName("rect")) {
        i.setAttribute("class", "rect");
    }
    if (element.parentElement.id !== "canvas") {
        element.parentElement.setAttribute('class', 'rect active');
    } else {
        console.log(element.id);
        element.setAttribute('class', 'rect active');
    }
    try {
        document.querySelector(".active .ghost").removeEventListener("drag", handleObjectMove, true);
    } catch (e) {
        console.log(e);
    } finally {
        document.querySelector(".active .ghost").addEventListener("drag", handleObjectMove, false);
    }
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

    // document.querySelector(".active .ghost").addEventListener("drag", (e) => {
    //     if (!e.screenX && !e.screenY) return;
    //     move(e.offsetX, e.offsetY);
    // }, false);

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
            if (!e.screenX && !e.screenY) return;
            resize(e.offsetX, e.offsetY, e.target.classList);
        }, false);
    });
    setElementActive(document.querySelector("#" + id));
}, false);

let sizeControllers = document.querySelectorAll('.active .controller');
sizeControllers.forEach(function (element) {
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
        if (!e.screenX && !e.screenY) return;
        resize(e.offsetX, e.offsetY, e.target.classList);
    }, false);
});

let rectControllers = document.querySelectorAll('.rect');
rectControllers.forEach(function (element) {
    element.addEventListener("click", (e) => {
        setElementActive(e.target);
    }, false);
});

document.querySelector("#canvas").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        for (let i of document.getElementsByClassName("rect")) {
            i.setAttribute("class", "rect");
        }
    }
})