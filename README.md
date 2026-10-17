# MongoDB Blog Database Assessment

This project creates a MongoDB database named `blog` with validated `users` and `posts` collections, sample documents, indexes, references, and example queries.

## Schema

### users

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Required and unique |
| `email` | String | Required, validated, and unique |
| `password` | String | Required hash string; never store plaintext |
| `createdAt` | Date | Required |

### posts

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | Required |
| `content` | String | Required |
| `author` | ObjectId | References `users._id` |
| `createdAt` | Date | Required |

MongoDB references are resolved in queries with an aggregation `$lookup`.

## Open in VSCodium

From this folder:

```bash
codium .
```

Install the recommended **MongoDB for VS Code** extension when prompted. VSCodium uses the same `.vscode` workspace configuration. If the extension is unavailable in Open VSX, download its VSIX from an approved source and select **Extensions: Install from VSIX**.

Connect the extension to:

```text
mongodb://127.0.0.1:27017
```

For MongoDB Atlas, replace this with the connection string supplied by Atlas and keep credentials outside the repository.

## Run with MongoDB Shell

The installed legacy shell uses `mongo`. New installations may use `mongosh`; the script commands are otherwise the same.

Create the schema, indexes, and sample data:

```bash
mongo mongodb://127.0.0.1:27017/blog scripts/setup.js
```

Run the example queries:

```bash
mongo mongodb://127.0.0.1:27017/blog scripts/queries.js
```

Verify the database:

```bash
mongo mongodb://127.0.0.1:27017/blog scripts/verify.js
```

The setup is idempotent: running it again updates the same fixed sample documents rather than creating duplicates.

## Useful interactive commands

```javascript
use blog
show collections
db.users.find({}, { password: 0 }).pretty()
db.posts.find().sort({ createdAt: -1 }).pretty()
```

## Security note

The sample password values only resemble hashes and are not usable credentials. A real application must hash passwords with bcrypt or Argon2 before saving them. Never commit database passwords or Atlas connection strings.
