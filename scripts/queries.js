// MongoDB Blog Query Examples
// Run with: mongo mongodb://127.0.0.1:27017/blog scripts/queries.js

db = db.getSiblingDB("blog");

print("\n1. All users (password excluded)");
db.users.find(
  {},
  { password: 0 }
).sort({ username: 1 }).forEach(printjson);

print("\n2. All posts, newest first");
db.posts.find().sort({ createdAt: -1 }).forEach(printjson);

print("\n3. Posts with author information");
db.posts.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "authorDetails"
    }
  },
  { $unwind: "$authorDetails" },
  {
    $project: {
      _id: 0,
      title: 1,
      content: 1,
      createdAt: 1,
      "author.username": "$authorDetails.username",
      "author.email": "$authorDetails.email"
    }
  },
  { $sort: { createdAt: -1 } }
]).forEach(printjson);

print("\n4. Posts written by Anita");
var anita = db.users.findOne({ username: "anita" });
if (anita) {
  db.posts.find(
    { author: anita._id },
    { title: 1, content: 1, createdAt: 1 }
  ).sort({ createdAt: -1 }).forEach(printjson);
}

print("\n5. Number of posts written by each user");
db.posts.aggregate([
  { $group: { _id: "$author", postCount: { $sum: 1 } } },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  {
    $project: {
      _id: 0,
      username: "$user.username",
      postCount: 1
    }
  },
  { $sort: { postCount: -1, username: 1 } }
]).forEach(printjson);
