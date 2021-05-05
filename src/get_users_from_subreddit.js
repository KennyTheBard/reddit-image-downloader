const r = require('nraw');

const Reddit = new r('downloadbot');

const getUsers = async (res, resolve) => {
   const uniqueUsers = res.data.children
      .map(c => c.data.author)
      .sort()
      .filter((x, i, array) => i === array.indexOf(x));

   const oldestPost = res.data.children[res.data.children.length - 1];
   if (oldestPost !== undefined) {
      resolve({
         oldestPost: oldestPost.data.name,
         uniqueUsers
      });
   } else {
      resolve({
         uniqueUsers
      })
   }
}

const getSubredditUsersAfter = async (subreddit, after) => {
   let subQuery = Reddit.subreddit(subreddit).sort('top');
   if (after !== undefined) {
      console.log(after)
      subQuery = subQuery.after(after);
   }

   return new Promise((resolve, reject) => {
      subQuery.limit(100).exec((res) => {
         getUsers(res, resolve);
      });
   });
}

const getSubredditUsers = async (subreddit) => {
   const users = [];
   let oldestPost = undefined;
   while (true) {
      after = await getSubredditUsersAfter(subreddit, oldestPost);
      oldestPost = after.oldestPost;
      after.uniqueUsers.forEach(u => users.push(u));

      if (oldestPost === undefined) {
         break;
      }
   }

   return users;
}

(async () => {
   const subreddits = process.argv.slice(2);
   const userLists = await Promise.all(subreddits.map(sub => getSubredditUsers(sub)));
   for (const index in subreddits) {
      console.log(subreddits[index] + ' -> ' + userLists[index]
         .sort()
         .filter((x, i, array) => i === array.indexOf(x))
         .join(' '));
   }
})();


