
import { CosmosClient } from "@azure/cosmos";

// Lazy initialization of the Cosmos Client
let client: CosmosClient | null = null;

const getClient = () => {
  if (client) return client;

  // Retrieve connection string from Azure Environment Variables
  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING?.trim();
  
  if (!connectionString) {
    console.error("❌ CRITICAL: COSMOS_DB_CONNECTION_STRING is missing.");
    console.error("👉 ACTION REQUIRED: Go to Azure Portal > Static Web App > Configuration. Add 'COSMOS_DB_CONNECTION_STRING' with your key.");
    return null;
  }

  try {
    // Basic validation of the string format
    if (!connectionString.includes("AccountEndpoint=")) {
        console.error("❌ CRITICAL: Invalid Connection String format. It should start with 'AccountEndpoint='.");
        return null;
    }

    client = new CosmosClient(connectionString);
    return client;
  } catch (err) {
    console.error("❌ Failed to initialize Cosmos Client:", err);
    return null;
  }
};

// Helper to get container, creating if not exists
export const getContainer = async (containerName: string) => {
  const cosmosClient = getClient();
  
  if (!cosmosClient) {
    throw new Error("Database configuration missing. Check Azure Portal Logs.");
  }

  // UPDATED: Matches your specific new database name
  const DATABASE_ID = "onesport-db2026";
  
  // Define correct partition keys for each container
  const partitionKeyPath = containerName === 'kits' ? '/category' : '/type';

  try {
    // Create/Get Database
    const { database } = await cosmosClient.databases.createIfNotExists({ id: DATABASE_ID });
    
    // Create/Get Container
    const { container } = await database.containers.createIfNotExists({ 
        id: containerName,
        partitionKey: { paths: [partitionKeyPath] }
    });
    
    return container;
  } catch (error) {
    console.error(`❌ DB CONNECTION ERROR [${DATABASE_ID} -> ${containerName}]:`, error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Export lazy getters with error handling wrappers
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
