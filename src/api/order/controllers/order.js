'use strict';
const stripe = require("stripe")("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");

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
