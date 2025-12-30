
# One Sport Kit Register

A professional sizing kit management system designed for tracking sample bookings, collections, and returns.

## 🚀 Quick Start (Local Development)

To run the full application locally (Frontend + Backend), you need **two separate terminal windows** running simultaneously.

### Terminal 1: Backend API
This mimics the Azure Cloud environment on your machine.
```bash
# First time only
npm run api:install

# Start the API (Runs on port 7071)
npm run api:start
```

### Terminal 2: Frontend App
This runs the React user interface.
```bash
# Start the UI (Runs on port 3000)
npm run dev
```

*Note: If the API is not running, the app will show a "Sync Issue Detected" error.*

## ☁️ Deployment (Azure)

This application is optimized for **Azure Static Web Apps**. 

1. Push this code to a **GitHub** repository.
2. Go to the [Azure Portal](https://portal.azure.com).
3. Create a new **Static Web App**.
4. Choose **GitHub** as the source and select this repository.
5. Build Preset: **React**.
6. App Location: `/`
7. Api Location: `api`
8. Output Location: `dist`

## 🛠 Features
- **Async Storage**: Ready to be swapped with Cosmos DB or SQL.
- **Loading States**: Visual feedback for cloud synchronization.
- **Inventory Management**: Full CRUD (Create, Read, Update, Delete) for your sizing kits.
- **Email Notifications**: Integrated with Make.com webhooks.

## ❓ Troubleshooting

### "The term 'npm' is not recognized"
- Ensure **Node.js** is installed from [nodejs.org](https://nodejs.org).
- Restart your computer or terminal after installing.
- Ensure you have navigated into the project folder using `cd` before running commands.

### "Backend API not reachable"
- Ensure you have a second terminal running `npm run api:start`.
- Check that the API terminal shows the "Azure Functions" lightning bolt logo.
