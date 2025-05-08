import User from "../models/user.js"
import UserService from "../services/user.js"
import Alert from "../models/alert.js"
import AlertService from "../services/alert.js"

const alertController = {
    async getAlerts(req,res){
        try{
            console.log('alertController:');
            
            const {userId} = req.params

            //根据主键查询用户
            if(!await User.findByPk(userId)){
                res.status(404).json({error: "User not found"});
            }

            const alerts = await AlertService.getAlerts(userId);
            
            

            return res.status(200).json(alerts);
        } catch(error){
            console.log('triggerAlertError:',error);
            
            return res.status(500).json({error: error.message})
        }

    },

    async triggerAlert(req,res){
        try{
            const alertData={
                userId: req.body.userId,
                type: req.body.type,
                location: req.body.location,
                description: req.body.description,
                }


            // 一定要await 它,要不然返回的就是个 Promise
            if(! await User.findByPk(alertData.userId)){
                res.status(404).json({error: "User not found"})
            }
            
            const alert = await AlertService.triggerAlert(alertData)

            return res.status(200).json(alert)
        } catch(error){
            return res.status(500).json({error: error.message})
        }
    },
    
    async updateAlert(req,res){
        try{
            const {alertID,status} = req.body
            // 根据主键查询警报
            if(!await Alert.findByPk(alertID)){
                res.status(404).json({error: "Alert not found"})
            }
            
            const updata=await AlertService.updateAlert(alertID,status);    

            return res.status(200).json(updata)
        } catch(error){
            return res.status(500).json({error: error.message})
        }
    }

    
}


export default alertController