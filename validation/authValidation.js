// validation
const Joi = require('@hapi/joi')


// registerValidation 
const registerValidation = (body) => {
    console.log(body)
    // const schema = {
        
    //     name: Joi.string().required(),
    //     email: Joi.string().required(),
    //     password: Joi.string().required(),
    // }
    const schema = Joi.object({
        name:Joi.string().required(),
        email:Joi.string().min(4).required().email({ tlds: { allow: false } }),
        password:Joi.string().min(6).required()
    });
    console.log(body);
    // const {error} = schema.validate(body, schema);
    const { error } = schema.validate(body);
    return error
} 

const loginValidation = (body) => {
    console.log(body);
    const schema = Joi.object({
        email:Joi.string().min(4).required().email(),
        password:Joi.string().min(6).required()
    });
    const { error } = schema.validate(body);
    return error
} 

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation