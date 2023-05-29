import ignore from 'ignore'
const ig = ignore().add('.gitignore')

//const paths = [
  //'.abc/a.js',    // filtered out
  //'.abc/d/e.js',   // included
//]

//ig.filter(paths)        // ['.abc/d/e.js']
//ig.ignores('.abc/a.js') // true
