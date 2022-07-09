
var key = '';

var stripe = Stripe(key);
var elements = stripe.elements();

var order = {
    items: [
        {
            name: 'item',
            amount: 2000,
            quantity: 2
        }
    ],
    currency: 'jpy',
    paymentMethodId:null
}

var style = {
    base: {
        color: '#32325d',
    }
};

var card = elements.create('card', {style:style});
card.mount('#card-element');


// ボタンの要素を取得
let returnButtonNormal = document.getElementById("return-button-normal");
let returnButtonError = document.getElementById("return-button-error");
let returnButtonNotYet = document.getElementById("return-button-not-yet");
let returnButtonDefault = document.getElementById("return-button-default");

returnButtonNormal.addEventListener("click", reset);
returnButtonError.addEventListener("click", reset);
returnButtonNotYet.addEventListener("click", reset);
returnButtonDefault.addEventListener("click", reset);

/**
 * イベントハンドラ。リセットする。
 * @param event 
 */
function reset(event) {
    hideError();
    hideMessage();
    hideNotYetMessage();
    displayButton();

    card.mount("#card-element");
}

card.on('change',({error}) => {
    const displayError = document.getElementById('card-errors');
    if(error){
        displayError.textContent = error.message;
    }else{
        displayError.textContent = '';
    }
});

const submitBtn = document.getElementById('payment-form-submit');

submitBtn.addEventListener('click',function(event){
    displaySpinner();
    stripe.createPaymentMethod('card', card)
    .then( (result) => {
        if(result.error){

        }else{
            order.paymentMethodId = result.paymentMethod.id;

            fetch("http://localhost:3000/v1/order/payment", {method: 'POST', 
                headers: {'Content-Type': "application/json"},body: JSON.stringify(order)
            }).then( (r) => {
                return r.json();
            }).then( (res) => {
                onComplete(res);
            }).catch(function(){
                onError();
            });
        }
    })
});


function onComplete(res){
    shutdown();

    hideSpinner();

    if(res.paymentInstanceStatus === 'succeeded'){
        displayMessage();
    }else{
        displayNotYetMessage();
    }
}

function onError(){
    shutdown();

    if(!document.querySelector('.spinner-border').classList.contains('collapse')){
        hideSpinner();
    }

    displayError();
}



function hideSpinner() {
    document.querySelector(".spinner-border").classList.add("collapse")
}

function displaySpinner() {
    document.querySelector(".spinner-border").classList.remove("collapse");
}


//======ここから追加する======

// エラーメッセージ
function hideError() {
    document.querySelector(".contents-payment-error").classList.add("collapse");
}

function displayError() {
    document.querySelector(".contents-payment-error").classList.remove("collapse");
}

// 成功メッセージ
function displayMessage() {
    document.querySelector(".contents-payment-result").classList.remove("collapse");
}

function hideMessage() {
    document.querySelector(".contents-payment-result").classList.add("collapse");
}

function displayNotYetMessage() {
    document.querySelector(".contents-payment-not-yet").classList.remove("collapse");
}

function hideNotYetMessage() {
    document.querySelector(".contents-payment-not-yet").classList.add("collapse");
}

// 注文確定ボタン
function hideButton() {
    document.querySelector("#payment-form-submit").classList.add("collapse");
}

function displayButton() {
    document.querySelector("#payment-form-submit").classList.remove("collapse");
}

function shutdown(){
    card.unmount();
    hideButton();
}