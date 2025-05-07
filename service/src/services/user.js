import User from "../models/user.js";
import UserBinding from "../models/bindUser.js";


const UserService = {
  async createUser(UserData) {
    try {
      const user = await User.create(UserData);
      return user;
    } catch (error) {
      throw error;
    }
  }

    




}


export default UserService;