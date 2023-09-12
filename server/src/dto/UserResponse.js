export class UserResponse {
    constructor(users = []) {
        this._users = users;
        this._count = users.length;
    }

    set users(users) {
        this._users = users;
        this._count = users.length;
    }
}
