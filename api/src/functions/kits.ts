
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { kitsContainer } from "../db";

// GET ALL KITS
app.http('getKits', {
    methods: ['GET'],
    route: 'kits',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const { resources } = await kitsContainer.items.readAll().fetchAll();
            // Sort by Kit Number (approximate logic)
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
            if(!kit.id) kit.id = crypto.randomUUID();
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
            // Cosmos requires partition key for replacement, assuming 'category' is partition key or just ID based replacement
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
            // We need to fetch the item first to get the partition key (category) if we don't have it passed in params
            // For simplicity, we query it. In prod, passing category in query param is better.
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
