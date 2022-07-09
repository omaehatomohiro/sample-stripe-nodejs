//require('dotenv').config();
require('dotenv').config({path:'./.env'});
var express = require('express');
var router = express.Router();
const {logger, defaultLogger} = require('../logger');

const stripe = require('stripe')(process.env.SECRET);



/* GET home page. */
router.get('/', async function(req, res, next) {
  defaultLogger.info('TOP呼び出し', 'fasfa');
  logger.info('処理開始します', req.body);
  console.log('fdsa');
  res.render('index', { title: 'Express' });
});


router.post('/v1/order/payment', async function(req,res,next){

  logger.info('処理開始します', req.body);
  const {paymentMethodId, paymentIntentId, items, currency, useStripeSdk } = req.body;

  const total = caculateAmount(items);

  try{
    let intent;
    if (paymentMethodId) {
      const request = {
        amount: total,
        currency: currency,
        payment_method: paymentMethodId,
        confirmation_method: "manual",
        confirm: true,
        use_stripe_sdk: useStripeSdk
      }

      logger.info('Start call Stripe API', request);
      intent = await stripe.paymentIntents.create(request);
      logger.info("Finished call Stripe API", intent);
    } else if (paymentIntentId) {
      console.log('222')
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
    }

    const response = genarateResponse(intent);

    logger.info('ルータメソッドの処理完了');
    res.send(response);
  }catch(e){
    logger.error('ルータメソッドの処理中にエラー',e);
    const response = generateErrorResponse(e.message);
    res.status(500);
    res.send(response);
  }
});

function caculateAmount(items){
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const current = items[i].amount * items[i].quantity;
    total += current;
  }
  return total;
}


function genarateResponse(intent){
  let response = {
    requireAction: true,
    clientSecret: "",
    paymentIntentStatus: ""
  }

  switch(intent.status){
    case "requires_action":
      response.paymentIntentStatus = "require_action";
      break;
    case "requires_payment_method":
      response.paymentIntentStatus = "require_payment_mehtod";
      break;
      case "requires_source":
        response.paymentIntentStatus = "requires_source";
        response.error = {
            messages : ["カードが拒否されました。別の決済手段をお試しください"]
        }
        break;
    case "succeeded":
        response.paymentIntentStatus = "succeeded";
        response.clientSecret = intent.client_secret;
        break;
    default:
        response.error = {
            messages : ["システムエラーが発生しました"]
        }
        break;
  }
  return response;
}

function generateErrorResponse(error) {
  return {
    error:{
      message: [error]
    }
  }
}


module.exports = router;



// {
//   "items": [
//       {
//           "name": "item",
//           "amount": 2000,
//           "quantity": 2
//       }
//   ],
//   "currency": "jpy",
//   "paymentMethodId":"visa_card_visa"
// }


// {
//   "items" : [
//       {
//           "name" : "scrab",
//           "amount" : 2000,
//           "quantity" : 2
//       },
//       {
//           "name" : "soap",
//           "amount" : 1500,
//           "quantity" : 1
//       }
//   ],
//   "currency": "jpy",
//   "paymentMethodId" : "pm_card_visa"
// }
