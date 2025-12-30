
import { CosmosClient } from "@azure/cosmos";

// Lazy initialization of the Cosmos Client
let client: CosmosClient | null = null;

const getClient = () => {
  if (client) return client;

  // Retrieve connection string from environment variables
  // In Azure Static Web Apps, set this in Environment Variables settings
  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
  
  if (!connectionString) {
    // We return null instead of throwing here to ensure the module loads successfully.
    // The error will be thrown when a specific function tries to use the DB.
    console.warn("COSMOS_DB_CONNECTION_STRING is missing");
    return null;
  }

  try {
    client = new CosmosClient(connectionString);
    return client;
  } catch (err) {
    console.error("Failed to initialize Cosmos Client", err);
    return null;
  }
};

// Helper to get container, creating if not exists
export const getContainer = async (containerName: string) => {
  const cosmosClient = getClient();
  
  if (!cosmosClient) {
    throw new Error("Database configuration missing. Please check 'COSMOS_DB_CONNECTION_STRING' in Application Settings.");
  }

  const DATABASE_ID = "onesport-cosmos-db";

  try {
    const { database } = await cosmosClient.databases.createIfNotExists({ id: DATABASE_ID });
    const { container } = await database.containers.createIfNotExists({ id: containerName });
    return container;
  } catch (error) {
    console.error(`Error connecting to container ${containerName}:`, error);
    throw new Error(`Database Error: ${error instanceof Error ? error.message : String(error)}`);
  }
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
