const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUserByUsername = users.find(user => user.username === username);

  if(!findUserByUsername) {
    return response.status(400).json({ error: 'Unexistent user' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUserByUsername = users.find(user => user.username === username);

  if(findUserByUsername) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const createUserData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(createUserData);

  return response.status(201).json(createUserData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const findUserByUsername = users.find(user => user.username === username);

  const { todos } = findUserByUsername;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const findUserIndex = users.findIndex(user => user.username === username);

  const createTodoData = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  users[findUserIndex].todos.push(createTodoData);

  return response.status(201).json(createTodoData);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.headers;


  const findUserIndex = users.findIndex(user => user.username === username);

  const findTodoIndex = users[findUserIndex].todos.findIndex(todo => todo.id === id);

  if(findTodoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  users[findUserIndex].todos[findTodoIndex].title = title;
  users[findUserIndex].todos[findTodoIndex].deadline = deadline;

  return response.json(users[findUserIndex].todos[findTodoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const findUserIndex = users.findIndex(user => user.username === username);

  const findTodoIndex = users[findUserIndex].todos.findIndex(todo => todo.id === id);

  if(findTodoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  users[findUserIndex].todos[findTodoIndex].done = true;

  return response.json(users[findUserIndex].todos[findTodoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  
  const findUserIndex = users.findIndex(user => user.username === username);

  const findTodoIndex = users[findUserIndex].todos.findIndex(todo => todo.id === id);

  if(findTodoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  users[findUserIndex].todos.splice(id, 1);

  return response.status(204).json(users[findUserIndex].todos);
});

module.exports = app;