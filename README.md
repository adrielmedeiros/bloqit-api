# Bloqit API

A REST API for managing delivery lockers. Built with NestJS and MongoDB.

## 🎯 What it does

This API manages three main things:
- **Bloqs**: Locations with multiple lockers
- **Lockers**: Individual storage compartments  
- **Rents**: Package delivery requests

The basic workflow: create a rent → drop off package (assigns locker) → pick up package (frees locker).

## 🏗️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick start

```bash
# Install and start
npm install
npm run start:dev
```

The API runs on `http://localhost:8080`. Visit `/api` for interactive Swagger documentation.

The database seeds automatically with sample data when you start the app.

## 📚 API endpoints

```
# Bloqs
GET/POST /bloqs
GET/PATCH/DELETE /bloqs/:id

# Lockers  
GET/POST /lockers
GET/PATCH/DELETE /lockers/:id
GET /lockers/bloq/:bloqId/available

# Rents
GET/POST /rents
GET/PATCH/DELETE /rents/:id
POST /rents/:id/dropoff
POST /rents/:id/pickup
```

## 📋 Business rules

- OPEN lockers can't be occupied
- Only CREATED rents can be dropped off
- Only WAITING_PICKUP rents can be picked up
- IDs are auto-generated UUIDs if not provided

**Drop-off**: Finds available locker, marks it as closed and as occupied, sets rent to WAITING_PICKUP

**Pick-up**: Frees the locker (open and not occupied), sets rent to DELIVERED

## 🧪 Testing

```bash
npm run test
npm run test:cov
```

Tests cover all services and controllers. Check the `test/` directory for the full test suite.

## 📁 Project structure

```
src/
├── modules/
│   ├── bloqs/           # Bloq management
│   ├── lockers/         # Locker management
│   └── rents/           # Rent management
├── shared/
│   ├── enums/           # Status types
│   └── decorators/      # Custom decorators
└── database/            # Seeding and config
```

That's it. Check `/api` for detailed endpoint documentation.
