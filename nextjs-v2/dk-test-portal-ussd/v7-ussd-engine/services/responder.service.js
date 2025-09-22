"use strict"

let norm = require('normalize-strings');

module.exports = {
    name: "responder",

    actions: {
        sendUssdResponse: {
            async handler (ctx) {
				let { menuResponse } = ctx.params;

                let normalize = true;
                if (normalize) {
                    menuResponse = norm(menuResponse);
                }
                /**---------------------------------------
                 *
                 * USING Safaricom (Kenya) response format
                 * String starting with CON keeps session alive
                 * String starting with END terminates session
                 * 
                 * ---------------------------------------
                 */
                
                let responseMessage = `${menuResponse}`.trim();
                if (!menuResponse?.startsWith('END ')) {
                    responseMessage = `CON ${menuResponse}`.trim();
                }

                return responseMessage;
            }
        }
    }
}