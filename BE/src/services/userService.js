import { reject } from "bcrypt/promises";
import db from "../models/index";
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExit = await checkUserEmail(email);


            if (isExit) {
                let user = await db.User.findOne({

                    attributes: ['email', 'roleId', "password"],
                    where: { email: email, },
                    raw: true,
                })
                if (user) {

                    let check = await bcrypt.compareSync(password, user.password);

                    if (check) {
                        delete user.password;
                        console.log(user);
                        userData = user;
                        userData.errCode = 0;
                        userData.errMessage = 'Ok';
                    }
                    else {
                        userData.errCode = 3;
                        userData.errMessage = "Wrong Password!";
                    }
                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = "User not found!";
                }
                resolve(userData);
            }
            else {
                //return err
                userData.errCode = 1;
                userData.errMessage = "Your's Email isnt exist in our system. Plesase try other email!";
                resolve(userData);

            }
        }
        catch (e) {
            reject(e);
        }
    })
}



let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {
                    email: userEmail
                }
            });

            if (user) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = 'abc';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ["password"]
                    },
                    raw: true,
                });
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"]
                    },
                    raw: true
                });

            }
            resolve(users);
        }
        catch (e) {
            reject(e);
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCoder: 1,
                    errMessage: "Your email has already in our system.Please try other email!"
                })
            }
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })
            resolve({
                errCode: 0,
                errMessage: "OK",
            });
        }
        catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

      
            let user = await db.User.findOne({
                where: { id: userId }
            });

            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: "User not found!"
                })
            }
            await user.destroy();
            resolve({
                errCode: 0,
                errMessage: "Deleted user!"
            });
        }

        catch (e) {
            reject(e);
        }
    })
}


let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        }
        catch (e) {
            reject(e);
        }
    })
}

let editUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                raw : false,
                where: { id: data.id },
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: "User not found!"
                })
            }
           
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.address = data.address;

            await user.save();
            resolve({
                errCode : 0,
                errMessage:"Done!"
            })
        }
        catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    editUser: editUser
}