/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const getSlotValue = Alexa.getSlotValue
const gql = require('graphql-tag')
const graphqlRequest = require('graphql-request')
const helpers = require('./helpers')
const  {getRouteIntelligence, getCurrentFreightRates} = require('./connection')
const Stack = helpers.Stack



const getCheapestPrice = (productId, destinationId) => {
  return getRouteIntelligence()
  .then(routeIntelligence => {
    const origin = routeIntelligence.regions.filter(r => r.id == 1)[0]
    const destination = routeIntelligence.regions.filter(r => r.id == destinationId)[0] 
    const calculatedPaths = helpers.calculateAllPaths(origin, destination, routeIntelligence.routes)
    const variables = {productId, routeIds: calculatedPaths.participatingRoutes.map(r => r.id) }

    return getCurrentFreightRates(variables)
    .then(currentFreightRates => {
        const routeMap = currentFreightRates.routes.reduce((acc, route) => {acc[route.id] = route; return acc}, {})
        const paths = calculatedPaths.paths.map(p => new helpers.Path(p, routeMap))
        const cheapestCost = Number(paths.map((p, idx) => p.totalCost + idx).sort((a, b) => a - b )[0])
        return cheapestCost
      })
    .catch(err => {console.log(err)})

  })
  .catch((err, a) => {
    debugger
    console.log('error', err)
  })

}

getCheapestPrice('1', '2').then(console.log)


// const doIt = () => {
//     const price = getCheapestPrice().then(console.log)
//     console.log(price)
// }

// doIt()


const getSlotId = (slot) => slot.resolutions.resolutionsPerAuthority[0].values[0].value.id

const GetFuelDeliveryPrice_Handler =  {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetFuelDeliveryPrice';
    },
    async handle(handlerInput) {
        const product = Alexa.getSlot(handlerInput.requestEnvelope, 'product')
        const city = Alexa.getSlot(handlerInput.requestEnvelope, 'city')
        const cheapestPrice = await getCheapestPrice(getSlotId(product), getSlotId(city))
        console.log('PRODUCT SLOT\n', product)
        console.log('CITY SLOT\n', city)

        const speakOutput = `the cheapest price of bringing ${product.value} to ${city.value} is $${cheapestPrice}`;


        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();

    },
    oldhandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from GetFuelDeliveryPrice. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: product 
        if (slotValues.product.heardAs && slotValues.product.heardAs !== '') {
            slotStatus += ' slot product was heard as ' + slotValues.product.heardAs + '. ';
        } else {
            slotStatus += 'slot product is empty. ';
        }
        if (slotValues.product.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.product.resolved !== slotValues.product.heardAs) {
                slotStatus += 'synonym for ' + slotValues.product.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.product.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.product.heardAs + '" to the custom slot type used by slot product! '); 
        }

        if( (slotValues.product.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.product.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetFuelDeliveryPrice','product'), 'or');
        }
        //   SLOT: city 
        if (slotValues.city.heardAs && slotValues.city.heardAs !== '') {
            slotStatus += ' slot city was heard as ' + slotValues.city.heardAs + '. ';
        } else {
            slotStatus += 'slot city is empty. ';
        }
        if (slotValues.city.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.city.resolved !== slotValues.city.heardAs) {
                slotStatus += 'synonym for ' + slotValues.city.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.city.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.city.heardAs + '" to the custom slot type used by slot city! '); 
        }

        if( (slotValues.city.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.city.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetFuelDeliveryPrice','city'), 'or');
        }

        say += slotStatus;


        return handlerInput.responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();


    },
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'hmm, welcome...I guess,';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = "another hello, for test";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetFuelDeliveryPrice_Handler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();