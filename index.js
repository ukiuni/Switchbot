const spawn = require('child_process').spawn;
const trigger = (triggerCommand, address) => {
    const command = {
        turnOn: "570101",
        turnOff: "570102",
        press: "570100"
    }
    return new Promise((resolve, reject) => {
        if (!command[command]) {
            reject("no such command [" + command + "]");
        }
        if (!triggerCommand) {
            triggerCommand = " press"
        }
        const gatttool = spawn('gatttool', ['-b', address, '-t', 'random', '-I'])
        var connectSended = false;

        gatttool.stdout.on('data', (data) => {
            if (!connectSended && !data.toString().startsWith("connect")) {
                gatttool.stdin.write("connect\n")
                connectSended = true;
            } else if (data.indexOf("Connection successful") >= 0) {
                gatttool.stdin.write("char-write-cmd 0x0016 " + command[triggerCommand] + "\n")
                setTimeout(() => {
                    gatttool.kill();
                    resolve();
                }, 1000);
            } else if (data.indexOf("Error") >= 0) {
                gatttool.kill();
                reject();
            }
        });
        gatttool.stderr.on('data', (data) => {
            gatttool.kill();
            reject();
        });
    });
}
module.exports = (address) => {
  return {
    "turnOn" : () => {
       trigger("turnOn", address);
    },
    "turnOff" : () => {
       trigger("turnOff", address);
    },
    "press" : () => {
       trigger("press", address);
    }
  }

}
