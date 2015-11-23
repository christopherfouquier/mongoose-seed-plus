# mongoose-seed-plus

mongoose-seed-plus lets you populate and clear MongoDB documents with all the benefits of Mongoose validation

## Basic example

```javascript
// open => seed.js
var seeder = require('mongoose-seed-plus');

// Connect to MongoDB via Mongoose
seeder.connect('mongodb://localhost:27017/mongoose-seed-plus-dev', function() {

    // Start processing...
    seeder.start(__dirname + '/migrations', [
        { path: 'models/Product.js', name: 'Product', clear: true },
        { path: 'models/User.js', name: 'User', clear: true },
    ], true);
});


```

## Data files

Create file `.json` in folder `migrations`.

#### Structure

```
├── seed.js
└─┬ migrations
  ├── users.json
  ├── products.json
```

#### Example
```Javascript
// open => migrations/users.json
// Data object containing seed data - documents organized by Model
{
    "model": "User",
    "documents": [
        {
            "firstname": "Christopher",
            "lastname": "Fouquier",
            "email": "christopher.fouquier@gmail.com",
            "password": "root",
            "role": "admin"
        },
        {
            "firstname": "John",
            "lastname": "Doe",
            "email": "john.doe@awesome.com",
            "password": "123"
        }
    ]
}
```

## Methods

### seeder.connect(db, [callback])

Initializes connection to MongoDB via Mongoose singleton.

### seeder.start(path, models, [dump])

```Javascript
seeder.start(__dirname + '/migrations',
[
    /**
     * @path (string, required) : path to model
     * @name (string, required) : name of model
     * @clear (boolean, required) : clear DB collection
     */
    { path: 'models/User.js', name: 'User', clear: true },
    { path: 'models/Product.js', name: 'Product', clear: false },
], true);
```
