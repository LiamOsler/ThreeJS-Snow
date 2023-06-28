export const inputs = {
    mouseX: 0,
    mouseY: 0,
    keyDownArray: [],
    gamepadArray: []
}

let gamepadArray = [];
for(let i = 0; i < 10; i++){
    gamepadArray[i] = 0;
}

window.addEventListener('gamepadconnected', (event) => {
    const update = () => {

      for (const gamepad of navigator.getGamepads()) {
        if (!gamepad) continue;
        for (const [index, axis] of gamepad.axes.entries()) {
            inputs.gamepadArray[index] = axis;
        }
      }
      requestAnimationFrame(update);
    };
    update();
});


window.addEventListener('keydown', function(e) {
    inputs.keyDownArray[e.keyCode] = true;

});

window.addEventListener('keyup', function(e) {
    inputs.keyDownArray[e.keyCode] = false;

});

window.addEventListener('mousemove', function(e) {
    inputs.mouseX = e.clientX;
    inputs.mouseY = e.clientY;
});

