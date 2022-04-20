const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
let s3 = require('../s3/aws')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

let validateEmail = function (Email) {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email);
}


let validatephone = function (phone) {
    return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)
}

let char=function(value){
    return /^[A-Za-z\s]+$/.test(value)
}

let validateString = function (value) {
    return /^\S*$/.test(value)
}

let isValidPincode = function (value) {
    if (!isNaN(value) && value.toString().length == 6) return true
}

//--------------------------------------------------------------------------------------------------------------

const createUser = async (req, res) => {
    try {
        let data = req.body
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter your details to register" })
        }

        const { fname, lname, email, profileImage, phone, password, address } = data

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }

        if (!char(fname)) {
            return res.status(400).send({ status: false, message: "Please mention valid firstName" })
        }

        if (!validateString(fname)) {
            return res.status(400).send({ status: false, message: "Spaces are not allowed in fname" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" })
        }

        if (!char(lname)) {
            return res.status(400).send({ status: false, message: "Please mention valid lastname" })
        }

        if (!validateString(lname)) {
            return res.status(400).send({ status: false, message: "Spaces are not allowed in lname" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        if (!validateEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" })
        }

        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) {
            return res.status(400).send({ status: false, message: "Email already exists" })
        }

        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await s3.uploadFile(files[0])
            data['profileImage'] = uploadedFileURL
        }
        else {
            return res.status(400).send({ status: false, message: "profileImage is required" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }

        if (!validatephone(phone)) {
            return res.status(400).send({ status: false, message: "Please enter a valid phone" })
        }

        let uniquephone = await userModel.findOne({ phone: phone })
        if (uniquephone) {
            return res.status(400).send({ status: false, message: "phone already exists" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "The length of password should be in between 8-15 characters" })
        }

        if (!validateString(password)) {
            return res.status(400).send({ status: false, message: "Spaces are not allowed in password" })
        }

        // Hashing the passwords
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        data.password = hashedPassword
        
        if(!address){
            return res.status(400).send({ status: false, message: "Address is required" })  
        }
        if (!isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Shipping Street is required" })
        }
        if (!isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Shipping city is required" })
        }
        if (!char(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please mention valid shipping city" })
        }

        if (!isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping pincode is required" })
        }

        if (!isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Pincode should be numeric and length is 6" })
        }
    
        if (!isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Billing Street is required" })
        }
        if (!isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Billing city is required" })
        }

        if (!char(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please mention valid billing city" })
        }

        if (!isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing pincode is required" })
        }
        if (!isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Pincode should be numeric and length is 6" })
        }

        let UserData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "You're registered successfully", data: UserData })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//------------------------------------------------------------------------------------------------------------------------

const loginUser = async (req, res) => {
    try {
        let data = req.body
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter your details to login" })
        }

        const { email, password } = data

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        if (!validateEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        const userMatch = await userModel.findOne({ email: email })
        if (!userMatch) {
            return res.status(401).send({ status: false, message: "Invalid Email address" })
        }
        
        const validUserPassword = await bcrypt.compare(
            password,
            userMatch.password
        );
        if (!validUserPassword) {
            return res.status(401).send({ status: false, message: "Invalid password" });
        }

        const token = jwt.sign({
            userId: userMatch._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (10 * 60 * 60)
        }, "Secret-Key-given-by-us-to-secure-our-token")

        return res.status(200).send({
            status: true, message: "You are successfully logged in",
            data: {
                userId: userMatch._id,
                token: token
            }
        })

    }
    
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//-----------------------------------------------------------------------------------------------------------------------


const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        let userIdFromToken = req.userId
        if (!userId) { return res.status(400).send({ status: false, message: "userid required" }) }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "UserId not a valid ObjectId" })
        }

        let userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "User not present in the collection" })
        }

        if (userId != userIdFromToken) {
            return res.status(403).send({ status: false, message: "User is not Authorized" })
        }

        let getUserDetails = await userModel.find({ _id: userId })
        return res.status(200).send({ status: true, message: "User profile details", data: getUserDetails })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//-----------------------------------------------------------------------------------------------------------------------------

const updateProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        let userIdFromToken = req.userId
        if (!userId) { return res.status(400).send({ status: false, message: "userid required" }) }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "UserId not a valid ObjectId" })
        }

        let userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "User not present in the collection" })
        }

        if (userId != userIdFromToken) {
            return res.status(403).send({ status: false, message: "User is not Authorized" })
        }
        let data = req.body
        const { fname, lname, email, phone, password, address } = data

        let updatedData = {}
        
        if (isValid(fname)) {
            if (!char(fname)) {
                return res.status(400).send({ status: false, message: "Please mention valid firstName" })
            }
    
            if (!validateString(fname)) {
                return res.status(400).send({ status: false, message: "Spaces are not allowed in fname" })
            }
            updatedData['fname'] = fname
        }

        if (isValid(lname)){
            if (!char(lname)) {
                return res.status(400).send({ status: false, message: "Please mention valid lastname" })
            }
    
            if (!validateString(lname)) {
                return res.status(400).send({ status: false, message: "Spaces are not allowed in lname" })
            }
            updatedData['lname'] = lname
        }

        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).send({ status: false, msg: "Invalid Email address" })
            }
            let dupEmail = await userModel.findOne({ email })
            if (dupEmail) {
                return res.status(404).send({ status: false, message: "email already present" })
            }
            updatedData['email'] = email
        }
        
        let files = req.files
        if (files && files.length > 0) {
            let uploadedFileURL = await s3.uploadFile(files[0])
            data['profileImage'] = uploadedFileURL
            updatedData['profileImage'] = data.profileImage
        } else {
            
            updatedData['profileImage'] = userData.profileImage
            
        }
    
        if (phone) {
            if (!validatephone(phone)) {
                return res.status(400).send({ status: false, msg: "Invalid PhoneNumber" })
            }
            let dupPhone = await userModel.findOne({ phone })
            if (dupPhone) {
                return res.status(404).send({ status: false, message: "phone already present" })
            }
            updatedData['phone'] = phone
        }

        if (password) {
            if (password.length < 8 || password.length > 15) {
                return res.status(400).send({ status: false, message: "The length of password should be in between 8-15 characters" })
            }
            if (!validateString(password)) {
                return res.status(400).send({ status: false, message: "Spaces are not allowed in password" })
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            data.password = hashedPassword

            updatedData['password'] = data.password
        }

        if (address) {
            if (isValid(address.shipping)) {

                if (isValid(address.shipping.street)) {
                    updatedData['address.shipping.street'] = address.shipping.street
                }
                if (isValid(address.shipping.city)) {
                    if (!char(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "Please mention valid shipping city" })
                    }
                    updatedData['address.shipping.city'] = address.shipping.city
                }
                if (isValid(address.shipping.pincode)) {

                    if (!isValidPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: "Pincode should be numeric and length is 6" })
                    }
                    updatedData['address.shipping.pincode'] = address.shipping.pincode

                }
            }
            if (isValid(address.billing)) {

                if (isValid(address.billing.street)) {
                    updatedData['address.billing.street'] = address.billing.street
                }
                if (isValid(address.billing.city)) {
                    if (!char(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "Please mention valid billing city" })
                    }
                    updatedData['address.billing.city'] = address.billing.city
                }
                if (isValid(address.billing.pincode)) {

                    if (!isValidPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: "Pincode should be numeric and length is 6" })
                    }
                    updatedData['address.billing.pincode'] = address.billing.pincode
                }
            }

        }

        if(!isValidRequestBody(data) && !files){
            return res.status(400).send({ status: true, message: "Enter data to be updating..."})
        }

        let updatedDetails = await userModel.findByIdAndUpdate(userId, { $set: updatedData }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedDetails })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createUser, loginUser, getProfile, updateProfile }