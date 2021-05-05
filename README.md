# reddit-image-downloader

A tool that allows you to get all imaged posted by a user in a subdirectory named after said user, in the 'downloads' directory. For each image a hash is calculated so no duplicates should be downloaded. This is a per-user feature, so if a user reposts another user's content, it will be duplicated.

```bash
   npm run start-user <list_of_usernames_separated_by_space>
```

Also, the tool provides for simplicity a script that gets all users that posted in a subreddit, but only those that appears in "top" section.

```bash
   npm run start-sub <list_of_subreddits_separagit ted_by_space>
```