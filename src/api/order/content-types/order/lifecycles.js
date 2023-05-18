
module.exports = {
    async afterCreate(event) {
        const { result } = event


        const order = await strapi.entityService.findOne('api::order.order', result.id, {
            populate: { user: true },
        });

        result.products.map(async (product) => {
            const previous = await strapi.entityService.findOne('api::game.game', product.id, {
                fields: ['stock']
            });
            if(previous.stock - product.quantity<0) throw Error('Insuficient Stock')
            await strapi.entityService.update('api::game.game', product.id, {
                data: {
                    stock:previous.stock - product.quantity,
                }
            })})

        let games = result.products.map( (product) => {
            return `<p style="margin-top: 8px; font-weight: bold;">Titulo: <span style="color: #ff5400; font-weight: bold;">${product.attributes.title}</span></p>    
            <p style="margin-top: 8px; font-weight: bold;">Precio: <span style="color: #ff5400; font-weight: bold;">${product.attributes.price}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Cantidad: <span style="color: #ff5400; font-weight: bold;">${product.quantity}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Descuento: <span style="color: #ff5400; font-weight: bold;">${product.attributes.discount || 0}</span></p>
    `
        })


        let mail = {
            to: process.env.ADMIN_MAIL,
            //cc:order.user.email,
            from: "henrypfgaming@gmail.com",
            subject: "Nueva Compra ",
            html: `<div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="position: relative;">
              <img src="https://gaming-frontend.vercel.app/images/logo.png" alt="GAMING" style="position: absolute; top: -80px; left: 0; width: 500px; height: 90px;">
            </div>
            <hr style="border-top: 2px solid #333; margin: 16px 0;">
            <h1 style="font-size: 24px; margin-bottom: 16px; color: #000000; font-weight: bold;">Nueva compra de: <span style="color: #007bff;">${order.user.username}</span></h1>
            <hr style="border-top: 2px solid #333; margin: 16px 0;">
            <p style="font-size: 22px; margin-bottom: 8px; font-weight: bold;">Total: <span style="color: #ff5400; font-weight: bold;">€${result.totalPayment}</span></p>
            <p style="font-weight: bold; margin-bottom: 10px;">ID de pago: <span style="color: #ff5400; font-weight: bold;">${result.idPayment}</span></p>
            <hr style="border-top: 2px solid #333; margin: 16px 0;">
            <div style="margin-top: 16px;">${games}</div>
            <hr style="border-top: 2px solid #333; margin: 16px 0;">
            <p style="margin-top: 8px;font-weight: bold;">Dirección de envío: <span style="color: #ff5400; font-weight: bold;">${result.addressShipping.attributes.address}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Ciudad: <span style="color: #ff5400; font-weight: bold;">${result.addressShipping.attributes.city}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Provincia: <span style="color: #ff5400; font-weight: bold;">${result.addressShipping.attributes.state}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Código Postal: <span style="color: #ff5400; font-weight: bold;">${result.addressShipping.attributes.postal_code}</span></p>
            <p style="margin-top: 8px; font-weight: bold;">Teléfono de contacto: <span style="color: #ff5400; font-weight: bold;">${result.addressShipping.attributes.phone}</span></p>
             <hr style="border-top: 2px solid #333; margin: 16px 0;">
          </div>`
        }

        try {
            await strapi.plugins['email'].services.email.send(mail)
        } catch (error) {
            console.log(error)
        }
    }
}