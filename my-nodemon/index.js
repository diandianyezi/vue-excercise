const chokidar = require('chokidar');
const { exec, spawn } = require('child_process');


let childProcess;
let debounceStart = debounce(restart, 500);


chokidar.watch(['main.js']).on('all', (event, path) => {
  console.info(event, path);
  debounceStart()
})

function restart() {
  console.info('restart');
  childProcess && childProcess.kill();
  childProcess = spawn('node', ['main.js'], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });
}

function debounce(fn, delay) {
  let id;
  return () => {
    clearTimeout(id);
    id = setTimeout(() => {
      fn();
    }, delay);
  }
}