const bcrypt = require('bcryptjs');

const password ='1234';

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log(`Хеш пароля: ${hash}`);

const result2 = bcrypt.compareSync('12345', hash);

const result1 = bcrypt.compareSync(password, hash);

console.log(`Проверка пароля 1:${password} ${result1}`);
console.log(`Проверка пароля 2: ${12345} ${result2}`);