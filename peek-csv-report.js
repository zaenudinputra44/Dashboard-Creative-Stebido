import https from 'https';

function fetchUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchUrl(res.headers.location);
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => console.log(data));
    }
  });
}

fetchUrl('https://docs.google.com/spreadsheets/d/1QPhkLqrII2r2alSu0NSVvLbMzZgdFB3zptZEtzmMf84/export?format=csv&gid=738362653');
