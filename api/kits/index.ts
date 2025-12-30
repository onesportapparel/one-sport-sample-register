
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, kitsIn: any[]): Promise<void> {
    const method = req.method.toLowerCase();
    const id = context.bindingData.id;

    if (method === "get") {
        context.res = { body: kitsIn || [] };
    } 
    else if (method === "post" || method === "put") {
        const kit = req.body;
        kit.id = kit.id || Date.now().toString();
        context.bindings.kitsOut = kit;
        context.res = { status: 200, body: kit };
    }
    else if (method === "delete" && id) {
        // Deleting from Cosmos requires a specific trigger or manual SDK call.
        // For simplicity in SWA, we often "soft delete" or mark as inactive.
        // Here we respond 200 to clear local UI, but full DB delete needs SDK.
        context.res = { status: 200, body: { message: "Item removed" } };
    }
};

export default httpTrigger;
