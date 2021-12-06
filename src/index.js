const express = require('express');
const cors = require('cors');

const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find( users => users.username === username );

  if ( !user ) {
    return response.status(400).json({ error: "User not found!"} ) 
  }

  request.user = user;

  return next();

}

function checksExistsUserTodo(request, response, next) {

  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find(todos => todos.id === id );

  if ( !todo ) {
      return response.status(404).json({ error: "Todo not found!"} );
  }

  request.todo = todo;
  
  return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const user = users.find(users => users.username === username);

  if (user) {
    return response.status(400).json({ error: "User existent!" })
  }

  const addUser = {
    id: uuidV4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(addUser);

  return response.status(201).json(addUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;

  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;

  const { user } = request;


  const todo = user.todos.find(todos => todos.title === title);

  /**if (todo) {
    return response.status(404).json({ error: "Todo existent"})
  }**/


  const addTodo = {
    id: uuidV4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(addTodo);

  response.status(201).json(addTodo)

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {

  const { title, deadline } = request.body;  

  const { todo } =  request;

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  
  const { todo } = request;
  
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  
  const { todo, user } = request;
  
  const todoIndex = user.todos.findIndex(filterTodo => filterTodo.id === todo.id );
  
  user.todos.splice(todoIndex, 1);

  return response.status(204).send();

});

module.exports = app;