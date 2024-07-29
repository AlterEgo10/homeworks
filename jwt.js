const jwt = require('jsonwebtoken');

require('dotenv').config();

console.log(process.env.JWT_SIFN_KEY);

const data= {
  id: 1,
  name: 'Oleg',
};

const token = jwt.sign(data, process.env.JWT_SIFN_KEY);
 
console.log(token);

jwt.verify(token, process.env.JWT_SIFN_KEY, (err, decoded) => {
  if(err){
    console.log('Невалидный Token');
    return;
  }
  console.log('Обьект после декодирования:', decoded);
})