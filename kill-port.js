// kill-port.js
const { exec } = require('child_process');
const os = require('os');

const PORT = 3002;
const platform = os.platform();

console.log(`🔍 Buscando proceso en puerto ${PORT}...`);

if (platform === 'win32') {
  // Windows
  exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
    if (error || !stdout) {
      console.log(`✅ Puerto ${PORT} está libre`);
      return;
    }

    const lines = stdout.split('\n');
    const pids = new Set();

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log(`✅ Puerto ${PORT} está libre`);
      return;
    }

    pids.forEach(pid => {
      console.log(`🔪 Matando proceso ${pid}...`);
      exec(`taskkill /F /PID ${pid}`, (killError) => {
        if (killError) {
          console.error(`❌ Error al matar proceso ${pid}`);
        } else {
          console.log(`✅ Proceso ${pid} terminado`);
        }
      });
    });
  });
} else {
  // Mac/Linux
  exec(`lsof -ti:${PORT}`, (error, stdout) => {
    if (error || !stdout.trim()) {
      console.log(`✅ Puerto ${PORT} está libre`);
      return;
    }

    const pid = stdout.trim();
    console.log(`🔪 Matando proceso ${pid}...`);
    
    exec(`kill -9 ${pid}`, (killError) => {
      if (killError) {
        console.error(`❌ Error al matar proceso ${pid}`);
      } else {
        console.log(`✅ Proceso ${pid} terminado`);
        console.log(`✅ Puerto ${PORT} liberado`);
      }
    });
  });
}