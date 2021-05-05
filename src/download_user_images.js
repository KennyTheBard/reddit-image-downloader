const r = require('nraw');
const fs = require('fs');
const fetch = require('node-fetch');
const imageHash = require('node-image-hash');
const { v4: uuid } = require('uuid');


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

const downloadRedditPosts = async (res, dirName, resolve, hashes) => {
   try {

      const uniqueUrls = res.data.children
         .map(c => c.data.url ? c.data.url : c.data.link_url)
         .filter(c => c !== undefined)
         .filter(c => c.indexOf('.jpg') > -1)
         .sort()
         .filter((x, i, array) => i === array.indexOf(x));

      for (const url of uniqueUrls) {
         const buffer = await download(url);

         const hash = (await imageHash.syncHash(buffer)).hash;
         if (hashes.indexOf(hash) > -1) {
            continue;
         }

         hashes.push(hash);
         const fileName = `${uuid()}.${getFileType(url)}`;
         fs.writeFileSync(`${dirName}/${fileName}`, buffer);
         console.log(`Saved ${fileName}`)
      }

      const oldestPost = res.data.children[res.data.children.length - 1];
      if (oldestPost !== undefined) {
         resolve(oldestPost.data.name);
      } else {
         resolve(undefined)
      }
   } catch (err) {
      console.log("Empty data")
   }
}

const downloadRedditUserPostsAfter = async (username, dirName, after, hashes) => {
   let userQuery = Reddit.user(username).sort('new');
   if (after !== undefined) {
      userQuery = userQuery.after(after);
   }

   return new Promise((resolve, reject) => {
      userQuery.limit(100).exec((res) => {
         downloadRedditPosts(res, dirName, resolve, hashes);
      });
   });
}

const downloadRedditUserPosts = async (username) => {
   const dirName = `./downloads/${username}`;

   fs.rmdirSync(dirName, { recursive: true });
   fs.mkdirSync(dirName);

   let after = undefined;
   const hashes = [];
   while (true) {
      after = await downloadRedditUserPostsAfter(username, dirName, after, hashes);

      if (after === undefined) {
         break;
      }
   }
}

(async () => {
   const users = process.argv.slice(2);
   await Promise.all(users.map(username => downloadRedditUserPosts(username)));

})();

