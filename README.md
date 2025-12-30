
# One Sport Kit Register

A professional sizing kit management system designed for tracking sample bookings, collections, and returns.

## 🚀 Cloud Readiness (Azure)

This application is optimized for **Azure Static Web Apps**. 

### Features
- **Async Storage**: Ready to be swapped with Cosmos DB or SQL.
- **Loading States**: Visual feedback for cloud synchronization.
- **Inventory Management**: Full CRUD (Create, Read, Update, Delete) for your sizing kits.
- **Email Notifications**: Integrated with Make.com webhooks.

### Deployment Instructions
1. Push this code to a **GitHub** repository.
2. Go to the [Azure Portal](https://portal.azure.com).
3. Create a new **Static Web App**.
4. Choose **GitHub** as the source and select this repository.
5. Build Preset: **React**.
6. App Location: `/`
7. Output Location: `dist`

## 🛠 Local Development
The app uses LocalStorage for data persistence when running locally or in demo mode. 

### Sizing Kit Catalog
The inventory is pre-populated with standard One Sport sizing kits (Hoodies, Polos, etc.) but can be fully customized in the **Inventory** tab.
