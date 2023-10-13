import bcrypt from 'bcrypt';

const comparePasswords = (plaintextPassword, hashedPasswordFromDatabase) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintextPassword, hashedPasswordFromDatabase, (err, result) => {
      if (err) {
        reject(false);
      } else if (result) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

export default comparePasswords;
