const bcrypt = require('bcrypt');

const plainPassword = 'admin123'; // Replace with your desired password

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log(`Hashed password for "${plainPassword}":`, hash);
  }
});
