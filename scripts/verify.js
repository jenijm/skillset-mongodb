// Verifies the assessment database and exits with a failure code on errors.

db = db.getSiblingDB("blog");

var failures = [];

if (db.users.countDocuments({}) < 3) {
  failures.push("Expected at least 3 users");
}

if (db.posts.countDocuments({}) < 4) {
  failures.push("Expected at least 4 posts");
}

var brokenReferences = db.posts.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "matchedUser"
    }
  },
  { $match: { matchedUser: { $size: 0 } } },
  { $count: "count" }
]).toArray();

if (brokenReferences.length > 0 && brokenReferences[0].count > 0) {
  failures.push("One or more posts have an invalid author reference");
}

if (failures.length > 0) {
  print("VERIFICATION FAILED");
  failures.forEach(function (failure) {
    print("- " + failure);
  });
  quit(1);
}

print("VERIFICATION PASSED");
print("Users: " + db.users.countDocuments({}));
print("Posts: " + db.posts.countDocuments({}));
print("All post author references are valid.");
