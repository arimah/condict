import fs from 'fs';
import url from 'url';
import path from 'path';
import https from 'https';

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const TestDataDir = path.join(path.dirname(dir), 'test-data');

const Files = [
  {
    url: 'https://www.unicode.org/Public/15.0.0/ucd/NormalizationTest.txt',
    saveAs: 'nfd.txt',
  },
  {
    url: 'https://raw.githubusercontent.com/unicode-org/cldr/release-42/common/uca/CollationTest_CLDR_SHIFTED.txt',
    saveAs: 'collation.txt',
  },
];

const fetchFile = ({url, saveAs}) => {
  const dest = path.join(TestDataDir, saveAs);
  if (fs.existsSync(dest)) {
    console.log(`Skipping test data file '${saveAs}': already present`);
    return Promise.resolve();
  }

  console.log(`Test data file '${saveAs}': downloading from ${url}`);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }).on('error', reject);
  });
};

const main = async () => {
  for (const file of Files) {
    await fetchFile(file);
  }
};

main().catch(err => {
  console.error('File download failed:', err);
  process.exitCode = 1;
});
