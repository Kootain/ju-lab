var es = require('event-stream');
module.exports = function(app) {
  var Scale = app.models.Scale;
  Scale.createChangeStream(function(err, changes) {
    changes.pipe(es.stringify()).pipe(process.stdout);
  });
}
