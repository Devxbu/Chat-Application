const auth_router = require('./auth_router');
const user_router = require('./user_router');
const messages_router = require('./messages_router');

module.exports = function(app){
    app.use('/api/auth/', auth_router);
    app.use('/api/user/', user_router);
    app.use('/api/messages/', messages_router);
}