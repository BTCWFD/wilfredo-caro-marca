const { spawnSync } = require('child_process');

const data = JSON.stringify({
  site_id: "f6a66661-1e22-4827-a91d-6af729ab91a1",
  hook: {
    site_id: "f6a66661-1e22-4827-a91d-6af729ab91a1",
    event: "submission_created",
    form_id: null,
    type: "email",
    data: {
      email: "wilfredwfd86@gmail.com"
    }
  }
});

const result = spawnSync('npx.cmd', ['netlify-cli', 'api', 'createHookBySiteId', '--data', data], {
  cwd: 'c:\\Users\\USER\\Wilfredo-Caro-Marca',
  encoding: 'utf8'
});

console.log('STDOUT:', result.stdout ? result.stdout.toString() : 'null');
console.log('STDERR:', result.stderr ? result.stderr.toString() : 'null');
