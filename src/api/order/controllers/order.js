'use strict';

require('dotenv').config();


const stripe = require("stripe")(process.env.STRIPE_KEY);

function calcDiscountPrice(price,discount ){
    if(!discount){
        return price;
    }

    const discountAmount=(price*discount)/100;
    const result = price - discountAmount;

    return result.toFixed(2);
}

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async paymentOrder(ctx){
        const { token, products, idUser, AddressShipping } = ctx.request.body;

        let totalPayment = 0;
        products.forEach((product) => {
            const priceTemp = calcDiscountPrice(product.attributes.price,product.attributes.discount);
            totalPayment+= Number(priceTemp) * product.quantity;
        });

        const charge = await stripe.charges.create({
            amount: Math.round(totalPayment *100),
            currency:"eur",
            source: token.id,
            description:`Use ID ${idUser}`,
        })

        const data = {
            products,
            user: idUser,
            totalPayment,
            idPayment:charge.id,
            AddressShipping,
        }

        const model = strapi.contentTypes["api::order.order"];
        const validData = await strapi.entityValidator.validateEntityCreation(
            model,
            data
        );

        const entry = await strapi.db.query("api::order.order").create({data: validData});

        return entry;

    },
}));
