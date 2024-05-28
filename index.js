import { collection, db, addDoc } from './db.js'

const modal = document.querySelector('.modal');
M.Modal.init(modal);

const form = document.querySelector('form');
const name = document.querySelector('#name');
const parent = document.querySelector('#parent');
const department = document.querySelector('#department');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  await addDoc(collection(db, 'employees'), {
    name: name.value, 
    parent: parent.value, 
    department: department.value
  });

  const instance = M.Modal.getInstance(modal);

  instance.close();
  form.reset();
});