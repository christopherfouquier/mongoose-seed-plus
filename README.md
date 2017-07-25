# Mongoose Seed Plus

Mongoose-Seed-Plus lets you populate and clear MongoDB documents with all the benefits of Mongoose validation

## ■ Installation

Use NPM or Yarn
```
$ npm install mongoose-seed-plus
```

## ■ Basic usage

```javascript
var seeder = require('../index.js');
var chalk  = require('chalk');
var path   = require('path');

var options = {
  mongodb: {
    host: "localhost",
    port: 27017,
    dbname: "mongoose-seed-plus-dev"
  },
  dump: {
    enable: true
  },
  models: [
    { path: 'models/User.js', name: 'User', clear: true },
    { path: 'models/Product.js', name: 'Product', clear: true }
  ],
  path: path.join(__dirname, '/migrations')
};

new seeder(options, function(err, result) {
  if (err) {
    throw err.message;
  }

  console.log(`Successfully connected to MongoDB: ${chalk.grey(result.db)}\n`);

  if (result.cleared) {
    console.log(`Cleared models: ${chalk.grey(result.cleared)}\n`);
  }

  console.log(chalk.cyan('Seeding Results'));
  for (var prop in result.populate) {
    console.log(`${prop}: ${chalk.grey(result.populate[prop])}`);
  }
  process.exit(1);
});
```

## ■ Data files

Create file `.json` in folder `migrations`.

#### Structure

```
├── seed.js
└─┬ migrations
  ├── users.json
  ├── products.json
```

#### Example
Data object containing seed data - documents organized by Model
```javascript
{
    "model": "User",
    "documents": [
        {
            "firstname": "John",
            "lastname": "Doe",
            "email": "john.doe@awesome.com",
            "password": "123456"
        }
    ]
}
```

## ■ Methods

### seeder(options, [callback])

| Options | Description | Default | Type | Required |
| --- | --- | --- | --- | --- |
| path | Path to folder migrations JSON files | "" | (string) | true |
| models | List of models | [] | (array) | true |
| models[].path | Path to a model | "" | (string) | true |
| models[].name | Name a model | "" | (string) | true |
| models[].clear | Clear collection mongo | true | (boolean) | false |
| dump | Option dump | {} | (object) | false |
| dump.bin | Path to bin mongodump | "/usr/local/bin/mongodump" | (string) | false |
| dump.args | Arguments for mongodump | [ '--db', "mongoose-seed-plus-dev", '--out', "", '--quiet' ] | (array) | false |
| dump.enable | Enable dump | false | (boolean) | false |
| mongodb | Option mongodb | {} | (object) | false |
| mongodb.host | Host to MongoDB | "localhost" | (string) | false |
| mongodb.port | Port to MongoDB | 27017 | (integer) | false |
| mongodb.dbname | DB name to MongoDB | "mongoose-seed-plus-dev" | (string) | false |