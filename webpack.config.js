const path = require('path');

module.exports = {
  mode: 'development', // Ändra till 'production' vid produktion
  entry: {
    signUp: './functions/signUp/index.js',
    login: './functions/login/index.js',
    getAllNotes: './functions/getAllNotes/index.js',
    getNoteById: './functions/getNoteById/index.js',
    postNote: './functions/postNote/index.js',
    updateNote: './functions/updateNote/index.js',
    deleteNote: './functions/deleteNote/index.js',
    getDeletedNotes: './functions/getDeletedNotes/index.js',
    restoreNote: './functions/restoreNote/index.js',
  },
  output: {
    filename: '[name].js', // Skapar en fil för varje funktion, ex. signUp.js
    path: path.resolve(__dirname, '.webpack'),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'), // Fixar problem med Buffer
    },
  },
};