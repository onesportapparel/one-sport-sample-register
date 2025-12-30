
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, bookingsIn: any[]):
 Promise<void> {
        } catch (error) {
                    context.log.error('Error in bookings function:', error);
                            context.res = {
                                            status: 500,
                                                        body: { error: 'Database error', details: error.message || String(error) }
                                                                };
                                                                    }
    const method = req.method.toLowerCase();
    const id = context.bindingData.id;
    const subaction = context.bindingData.subaction;

    if (method === "get") {
        context.res = { body: bookingsIn || [] };
    } 
    else if (method === "post") {
        const newBooking = req.body;
        // Azure Cosmos DB requires an 'id' field as a string
        newBooking.id = newBooking.id || Date.now().toString();
        context.bindings.bookingsOut = newBooking;
        context.res = { status: 201, body: newBooking };
    }
    else if (method === "patch" && id && subaction === "status") {
        // Logic for updating status (e.g., marking as returned)
        const booking = bookingsIn.find(b => b.id === id);
        if (booking) {
            booking.status = req.body.status;
            context.bindings.bookingsOut = booking;
            context.res = { body: booking };
        } else {
            context.res = { status: 404, body: "Booking not found" };
        }
    }
};

export default httpTrigger;
