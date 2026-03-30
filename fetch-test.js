fetch('http://localhost:3000/api/quizzes')
    .then(res => res.text())
    .then(text => console.log('RESPONSE:', text))
    .catch(err => console.error('ERROR:', err))
    .finally(() => process.exit(0));
