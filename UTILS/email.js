const nodemailer = require("nodemailer");


// 1 create a options
const sendEmail = async options =>{
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user: 'sandyhl2206@gmail.com',
            pass: "gfjmqqlngvpypcep"
        }
    });
    
    //2. define the email options
    const mailoptions = {
        from: 'sandyhl2206@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailoptions);
}

module.exports = sendEmail;