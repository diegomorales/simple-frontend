module.exports = {
  'src/**/*.js': ['standard --fix', 'git add'],
  'src/**/*.scss': ['stylelint --fix', 'git add']
}
