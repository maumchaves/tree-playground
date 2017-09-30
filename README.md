# Tree Playground

[DESCRIPTION]

[Live application here](https://tree-playground.herokuapp.com).

Based on the [getting-Started application provided by Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs).
Find the original repository [here](https://github.com/heroku/node-js-getting-started).

## Features

## Documentation

### API

**`/api/users`**

 - `GET`: finds all users.
 - `POST`: creates a new user (requires *username* and *password*).

Example:

    curl -X POST -H "Content-Type: application/json" -d '{"username":"maumchaves", "name":"Mauricio", "lastName": "Muñoz", "password":"helloworld"}' https://tree-playground.herokuapp.com/api/users

**Note:** First create a user using the API before trying to login.

**`/api/users/:id`**

 - `GET`: finds user by id.
 - `PUT`: updates user by id (only *name* and *lastName*).
 - `DELETE`: deletes user by id.

Example:

    curl https://tree-playground.herokuapp.com/api/users/1

**`/api/trees`**

 - `GET`: finds all trees in given dataset.
 - `POST`: copies the given dataset to the PostgreSQL database (*id* is not *unique*).
 - `DELETE`: deletes all trees.

Example:

    curl -X POST https://tree-playground.herokuapp.com/api/trees

### Database

Find the database definition and an extra database query in the [*db.sql*](https://github.com/maumchaves/tree-playground/blob/master/db.sql) file.

## Implementation Notes

 - All code was written in one only file ([*index.js*](https://github.com/maumchaves/tree-playground/blob/master/index.js)). Eventually this should be separated in different files and modules to allow scalability and keep the code clean.
 - A more robust version of this implementation should consider more cases to avoid the app to crash or generate inconsistent data. Also, it has to be more reliable in terms of security.
 - Permissions are completely out of the scope of this implementation, but they could be considered in the future.
