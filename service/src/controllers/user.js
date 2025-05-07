import UserModule from '../models/user.js';

const UserController = {
  async createUser(req, res) {
    try {
      const user = await UserModule.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


}


export default UserController;
