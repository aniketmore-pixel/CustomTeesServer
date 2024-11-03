const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AULcCQ24t3KJVHm0WLRiYSt7hqUN8U7E0sePCwC_iZiBdbJw7kj_Fy_4Epx2iqvtRItq2F5RJ-8USv3F",
  client_secret: "ED_PcDI7QTBFtszF_xM3nK4taN920MYSAPcRPwmbANkv1gYZDDs6DM_ONX-nONKW7OB-wKYl2SfMqJbU"
});

module.exports = paypal;
