# Moy-Bag

Microservice which holds all the logic related to the 'bags' the user has. These are virtual bags that serve the purpose of dividing the bulk of money for different ends.

## Endpoints /auth
<dl>
    <dt>GET /</dt>
    <dd>Help command, it should return all endpoints</dd>
    <!-- <dt>GET /status</dt>
    <dd>check the current status of the token. Returns user uid when token is still alive</dd>
    <dt>POST /signup</dt>
    <dd>expects a body <code>{ token: 'mytoken123', newUsername: 'my-new-uid' }</code> for the first time someone logins. This is so a user can select their username</dd>
    <dt>POST /isUsernameFree</dt>
    <dd>expects a body <code>{ username: 'my-favorite-username' }</code> to check whether if it exists already on the db or not</dd>
    <dt>POST /login</dt>
    <dd>expects a body <code>{ token: 'mytoken123' }</code> and returns the new token that will be used by moy services to handle authentication. Failing to do this step and using the default firebase token will result in logout</dd>
    <dt>GET /logout</dt>
    <dd>Checks token in header, and if the token is alive, it revokes the session and logs out the user</dd> -->
</dl>
