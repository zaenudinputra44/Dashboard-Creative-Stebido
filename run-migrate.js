import handler from './api/migrate.js';

const req = { method: 'GET' };
const res = {
  status: (code) => {
    return {
      json: (data) => {
        console.log(`Status Code: ${code}`);
        console.log(data);
      }
    };
  }
};

handler(req, res).then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
