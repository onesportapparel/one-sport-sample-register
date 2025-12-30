
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { bookingsContainer } from "../db";

// Simple ID generator to avoid import issues
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// GET ALL BOOKINGS
app.http('getBookings', {
    methods: ['GET'],
    route: 'bookings',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const { resources } = await bookingsContainer.items.readAll().fetchAll();
            return { jsonBody: resources };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error fetching bookings" };
        }
    }
});

// CREATE BOOKING
app.http('createBooking', {
    methods: ['POST'],
    route: 'bookings',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const booking = await request.json() as any;
            if(!booking.id) booking.id = generateId();
            const { resource } = await bookingsContainer.items.create(booking);
            return { status: 201, jsonBody: resource };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error creating booking" };
        }
    }
});

// UPDATE BOOKING STATUS
app.http('updateBookingStatus', {
    methods: ['PATCH'],
    route: 'bookings/{id}/status',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const id = request.params.id;
            const { status } = await request.json() as any;
            
            // Find booking to get partition key (type)
            const querySpec = { query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] };
            const { resources } = await bookingsContainer.items.query(querySpec).fetchAll();
            
            if (resources.length > 0) {
                const booking = resources[0];
                booking.status = status;
                const { resource } = await bookingsContainer.item(id, booking.type).replace(booking);
                return { jsonBody: resource };
            } else {
                return { status: 404 };
            }
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error updating booking status" };
        }
    }
});
