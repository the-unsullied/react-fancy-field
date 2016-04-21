var sass = require('node-sass');
var fs = require('fs');

sass.render({
  file: './src/main.scss'
}, function(error, result) { // node-style callback from v3.0.0 onwards
  if(!error){
    fs.writeFile('./dist/FancyField.css', result.css, function(err){
      if(!err){
        console.log('css file written to disk')
      }
    });
  } else {
    console.log(error);
  }
});
