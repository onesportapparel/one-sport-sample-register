
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { kitsContainer } from "../db";
import { randomUUID } from "crypto";

// GET ALL KITS
app.http('getKits', {
    methods: ['GET'],
    route: 'kits',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const { resources } = await kitsContainer.items.readAll().fetchAll();
            // Sort by Kit Number
            resources.sort((a, b) => (parseInt(a.kitNumber) || 0) - (parseInt(b.kitNumber) || 0));
            return { jsonBody: resources };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error fetching kits" };
        }
    }
});

// ADD KIT
app.http('addKit', {
    methods: ['POST'],
    route: 'kits',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const kit = await request.json() as any;
            if(!kit.id) kit.id = randomUUID();
            const { resource } = await kitsContainer.items.create(kit);
            return { status: 201, jsonBody: resource };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error creating kit" };
        }
    }
});

// UPDATE KIT
app.http('updateKit', {
    methods: ['PUT'],
    route: 'kits/{id}',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const id = request.params.id;
            const kit = await request.json() as any;
            const { resource } = await kitsContainer.item(id, kit.category).replace(kit);
            return { jsonBody: resource };
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error updating kit" };
        }
    }
});

// DELETE KIT
app.http('deleteKit', {
    methods: ['DELETE'],
    route: 'kits/{id}',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const id = request.params.id;
            const querySpec = { query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] };
            const { resources } = await kitsContainer.items.query(querySpec).fetchAll();
            
            if (resources.length > 0) {
                await kitsContainer.item(id, resources[0].category).delete();
                return { status: 204 };
            } else {
                return { status: 404 };
            }
        } catch (error) {
            context.error(error);
            return { status: 500, body: "Error deleting kit" };
        }
    }
});
