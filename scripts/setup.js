// MongoDB Blog Database Setup
// Run with: mongo mongodb://127.0.0.1:27017/blog scripts/setup.js

db = db.getSiblingDB("blog");

print("Using database: " + db.getName());

var usersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["username", "email", "password", "createdAt"],
    properties: {
      username: {
        bsonType: "string",
        minLength: 3,
        description: "Username must be a string with at least 3 characters"
      },
      email: {
        bsonType: "string",
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        description: "Email must be a valid email string"
      },
      password: {
        bsonType: "string",
        minLength: 20,
        description: "Password must contain a secure hash, never plaintext"
      },
      createdAt: {
        bsonType: "date",
        description: "Created At must be a date"
      }
    }
  }
};

var postsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "content", "author", "createdAt"],
    properties: {
      title: {
        bsonType: "string",
        minLength: 1,
        description: "Title must be a non-empty string"
      },
      content: {
        bsonType: "string",
        minLength: 1,
        description: "Content must be a non-empty string"
      },
      author: {
        bsonType: "objectId",
        description: "Author must reference a users document ObjectId"
      },
      createdAt: {
        bsonType: "date",
        description: "Created At must be a date"
      }
    }
  }
};

function createOrUpdateCollection(name, validator) {
  if (db.getCollectionNames().indexOf(name) === -1) {
    db.createCollection(name, {
      validator: validator,
      validationLevel: "strict",
      validationAction: "error"
    });
    print("Created collection: " + name);
  } else {
    db.runCommand({
      collMod: name,
      validator: validator,
      validationLevel: "strict",
      validationAction: "error"
    });
    print("Updated validation for collection: " + name);
  }
}

createOrUpdateCollection("users", usersValidator);
createOrUpdateCollection("posts", postsValidator);

db.users.createIndex({ username: 1 }, { unique: true, name: "unique_username" });
db.users.createIndex({ email: 1 }, { unique: true, name: "unique_email" });
db.posts.createIndex({ author: 1 }, { name: "posts_by_author" });
db.posts.createIndex({ createdAt: -1 }, { name: "newest_posts" });

// Fixed IDs make the setup idempotent and allow posts to reference users.
var userIds = {
  anita: ObjectId("66a100000000000000000001"),
  rahul: ObjectId("66a100000000000000000002"),
  maya: ObjectId("66a100000000000000000003")
};

// These are demonstration hash strings. Real applications should generate
// password hashes with bcrypt or Argon2 in the application layer.
var users = [
  {
    _id: userIds.anita,
    username: "anita",
    email: "anita@example.com",
    password: "$2b$12$demoHashForAnitaNotARealPassword",
    createdAt: ISODate("2026-01-10T09:00:00Z")
  },
  {
    _id: userIds.rahul,
    username: "rahul",
    email: "rahul@example.com",
    password: "$2b$12$demoHashForRahulNotARealPassword",
    createdAt: ISODate("2026-01-12T10:30:00Z")
  },
  {
    _id: userIds.maya,
    username: "maya",
    email: "maya@example.com",
    password: "$2b$12$demoHashForMayaNotARealPassword",
    createdAt: ISODate("2026-01-15T14:15:00Z")
  }
];

users.forEach(function (user) {
  db.users.replaceOne({ _id: user._id }, user, { upsert: true });
});

var posts = [
  {
    _id: ObjectId("66b200000000000000000001"),
    title: "Getting Started with MongoDB",
    content: "MongoDB stores flexible JSON-like documents in collections.",
    author: userIds.anita,
    createdAt: ISODate("2026-02-01T08:00:00Z")
  },
  {
    _id: ObjectId("66b200000000000000000002"),
    title: "Designing a Simple Blog Schema",
    content: "This post demonstrates references between posts and users.",
    author: userIds.rahul,
    createdAt: ISODate("2026-02-03T11:30:00Z")
  },
  {
    _id: ObjectId("66b200000000000000000003"),
    title: "Useful MongoDB Queries",
    content: "Indexes and aggregation pipelines make blog queries efficient.",
    author: userIds.anita,
    createdAt: ISODate("2026-02-05T16:45:00Z")
  },
  {
    _id: ObjectId("66b200000000000000000004"),
    title: "Why Schema Validation Matters",
    content: "Validation protects data quality while retaining MongoDB flexibility.",
    author: userIds.maya,
    createdAt: ISODate("2026-02-08T13:20:00Z")
  }
];

posts.forEach(function (post) {
  db.posts.replaceOne({ _id: post._id }, post, { upsert: true });
});

print("Inserted or updated " + users.length + " users.");
print("Inserted or updated " + posts.length + " posts.");
print("Blog database setup completed successfully.");
