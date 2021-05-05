const r = require('nraw');
const fs = require('fs');
const fetch = require('node-fetch');
const imageHash = require('node-image-hash');

const download = async (url) => {
   const response = await fetch(url);
   const buffer = await response.buffer();
   console.log(`Downloaded ${url}`);
   return buffer;
};

const getFileType = (url) => {
   const parts = url.split('.');
   return parts[parts.length - 1];
}

const Reddit = new r('downloadbot');

const downloadRedditPosts = async (res, dirName) => {
   const uniqueUrls = res.data.children
      .map(c => c.data.url ? c.data.url : c.data.link_url)
      .filter(c => c !== undefined)
      .sort()
      .filter((x, i, array) => i === array.indexOf(x));

   const hashes = [];
   for (const index in uniqueUrls) {
      const url = uniqueUrls[index];
      const buffer = await download(url);

      const hash = (await imageHash.syncHash(buffer)).hash;
      if (hashes.indexOf(hash) > -1) {
         continue;
      }

      hashes.push(hash);
      fs.writeFileSync(`${dirName}/${index}.${getFileType(url)}`, buffer);
   }
}

const downloadRedditUserPosts = async (username) => {
   const dirName = `./downloads/${username}`;

   fs.rmdirSync(dirName, { recursive: true });
   fs.mkdirSync(dirName);

   Reddit.user(username).exec((res) => {
      downloadRedditPosts(res, dirName)
   });
}

process.argv.slice(2).forEach(username => downloadRedditUserPosts(username));


