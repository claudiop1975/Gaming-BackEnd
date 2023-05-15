
module.exports = {
    async afterCreate(event) {
        const { result } = event


        const order = await strapi.entityService.findOne('api::order.order', result.id, {
            populate: { user: true },
        });

        let games = result.products.map((product) => {
            return `
   
    Titulo : ${product.attributes.title}    
    Precio : ${product.attributes.price}
    Cantidad : ${product.quantity}
    Descuento : ${product.attributes.discount || 0}
    --------------------------------------------------
    `
        })


        let mail = {
            to: process.env.ADMIN_MAIL,
            //cc:order.user.email,
            from: "leoheffel.87@gmail.com",
            subject: "Nueva Compra ",
            text: `
    Nueva compra de ${order.user.username}  por un total de : €${result.totalPayment}
    el id de pago es : ${result.idPayment}
    ${games}
    Direccion de envio : ${result.addressShipping.attributes.address}
    Ciudad :${result.addressShipping.attributes.city}
    Provincia: ${result.addressShipping.attributes.state}
    Codigo Postal: ${result.addressShipping.attributes.postal_code}

    Tel Contacto : ${result.addressShipping.attributes.phone}
    `
        }

        try {
            await strapi.plugins['email'].services.email.send(mail)
        } catch (error) {
            console.log(error)
        }
    }
}