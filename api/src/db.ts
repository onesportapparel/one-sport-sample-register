
import { CosmosClient } from "@azure/cosmos";

// Lazy initialization of the Cosmos Client
// This prevents the Function App from crashing on startup if the connection string is missing
let client: CosmosClient | null = null;

const getClient = () => {
  if (client) return client;

  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
  if (!connectionString) {
    console.warn("COSMOS_DB_CONNECTION_STRING is missing");
    return null;
  }

  client = new CosmosClient(connectionString);
  return client;
};

// Helper to get container, creating if not exists
export const getContainer = async (containerName: string) => {
  const cosmosClient = getClient();
  
  if (!cosmosClient) {
    throw new Error("Database configuration missing (COSMOS_DB_CONNECTION_STRING)");
  }

  // UPDATED: Using the specific database name provided
  const DATABASE_ID = "onesport-cosmos-db";

  const { database } = await cosmosClient.databases.createIfNotExists({ id: DATABASE_ID });
  const { container } = await database.containers.createIfNotExists({ id: containerName });
  return container;
};

// Export lazy getters
export const kitsContainer = {
  get items() {
    return {
      readAll: () => ({
        fetchAll: async () => {
          const c = await getContainer("kits");
          return c.items.readAll().fetchAll();
        }
      }),
      create: async (body: any) => {
        const c = await getContainer("kits");
        return c.items.create(body);
      },
      query: (spec: any) => ({
        fetchAll: async () => {
          const c = await getContainer("kits");
          return c.items.query(spec).fetchAll();
        }
      })
    };
  },
  item: (id: string, category: string) => ({
    replace: async (body: any) => {
      const c = await getContainer("kits");
      return c.item(id, category).replace(body);
    },
    delete: async () => {
      const c = await getContainer("kits");
      return c.item(id, category).delete();
    }
  })
};

export const bookingsContainer = {
  get items() {
    return {
      readAll: () => ({
        fetchAll: async () => {
          const c = await getContainer("bookings");
          return c.items.readAll().fetchAll();
        }
      }),
      create: async (body: any) => {
        const c = await getContainer("bookings");
        return c.items.create(body);
      },
      query: (spec: any) => ({
        fetchAll: async () => {
          const c = await getContainer("bookings");
          return c.items.query(spec).fetchAll();
        }
      })
    };
  },
  item: (id: string, type: string) => ({
    replace: async (body: any) => {
      const c = await getContainer("bookings");
      return c.item(id, type).replace(body);
    }
  })
};
