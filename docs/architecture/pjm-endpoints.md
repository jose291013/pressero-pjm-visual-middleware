# PJM Endpoints

Sprint 3 documents the PJM contracts used by the middleware. These contracts come from the provided endpoint details and from the `saas-quote-orchestrator` reference archive in `docs/reference`.

The archive is intentionally treated as a local reference only because it contains environment files and repository metadata. Secrets must not be copied into this project.

## Authentication

```http
POST https://ams.printjobmanager.com/api/public/Authenticate
```

Request:

```json
{
  "UserName": "configured username",
  "Password": "configured password"
}
```

The token may be returned under one of several names, including `Token`, `token`, `AccessToken`, `accessToken` or `access_token`.

Authenticated calls use:

```http
Authorization: Bearer <token>
```

## Product Engines And Price Groups

```http
POST https://ams.printjobmanager.com/api/public/productEngines/list
```

Response shape:

```json
[
  {
    "Id": "ad4c3730-c501-4f74-87b2-bc01d96d0b7e",
    "Name": "Bache format ouvert de 20 a 500 cm",
    "Mappings": [
      {
        "EnginePriceGroupIntegrationId": "1f64f273-b8e3-42bf-bbcf-c784c7e42169",
        "PriceGroupName": "Groupe 4 + 45%"
      }
    ]
  }
]
```

Some PJM installations can wrap the same array in a response object. The sync normalizer accepts common wrappers such as:

```json
{
  "Data": [
    {
      "Id": "ad4c3730-c501-4f74-87b2-bc01d96d0b7e",
      "Name": "Bache format ouvert de 20 a 500 cm",
      "Mappings": []
    }
  ]
}
```

The live response inspected for Sprint 9 used top-level keys `Total` and `Data`. Each engine item exposed `Id`, `Name` and `Mappings`; no product category field was present in this endpoint response.

Important model consequence: one product engine can have multiple price-group mappings. The middleware stores those mappings in `PjmEnginePriceGroupMapping`.

## Engine Options

```http
POST https://ams.printjobmanager.com/api/public/engine
```

Payload:

```json
{
  "Operation": "options",
  "Product": "engineIntegrationId",
  "Options": []
}
```

This retrieves the option structure for one engine. Later sprints will normalize this response into `PjmOption` and `PjmOptionChoice`.

## Options And Price

```http
POST https://ams.printjobmanager.com/api/public/engine
```

Payload:

```json
{
  "Operation": "optionsandprice",
  "Product": "engineIntegrationId",
  "Options": [
    {
      "Name": "OptionName",
      "Value": "selectedValue"
    }
  ]
}
```

This call can return price, weight, quantity, attributes and sometimes updated engine options. It is a backend integration concern only. The Pressero visual script must not calculate prices itself.

## Create Jobs

```http
POST https://ams.printjobmanager.com/api/public/jobs
```

This endpoint creates the PJM order/job payload after the middleware has resolved the selected engine, organization, engine values and final negotiated price.

Important payload fields:

```json
{
  "orderId": "590060",
  "orderNumber": 1200,
  "organizationIntegrationId": "74515bbe-1662-4760-900a-59fb68ccd1c5",
  "jobs": [
    {
      "jobId": "22222230",
      "jobName": "Estimate - booklet saddle stitching",
      "quantity": 25,
      "price": 0.0,
      "engineIntegrationId": "59a62272-9f23-4815-beff-8d29ca95e8b8",
      "engineValues": [
        {
          "Key": "d2d4c097-fe41-4f01-93c6-126477d8da7c",
          "Value": "25"
        }
      ]
    }
  ]
}
```

For negotiated-price products, the middleware will use `optionsandprice` to calculate the reference PJM price while generating the Excel, then later use the saved negotiated price when creating the PJM job. The actual job creation is not automatic and will be implemented after Excel export/import persistence.

## Sprint 4 Client Boundary

`src/modules/pjm-sync/pjmClient.ts` contains the isolated PJM HTTP client.

Responsibilities:

- authenticate and cache the PJM token;
- call `productEngines/list`;
- call `/public/engine` with `Operation: "options"`;
- call `/public/engine` with `Operation: "optionsandprice"`;
- call `/public/jobs` for future job creation;
- expose payload builders for tests and future sync code.

Non-responsibilities:

- no database writes;
- no Pressero JSON generation;
- no admin UI;
- no automatic PJM call at server startup.

The client accepts an injectable `fetchImpl` so tests and future sync scripts can verify payloads without calling the real PJM API.

## Sprint 5 Sync Runner

`npm run sync:pjm` runs the explicit catalog synchronization.

The sync uses:

1. `productEngines/list` to persist engines and mappings.
2. The first `EnginePriceGroupIntegrationId` for an engine as the product id for the options request.
3. `/public/engine` with `Operation: "options"` to persist options and choices.

The runner logs a JSON summary and warning list. It does not calculate prices and does not call `optionsandprice`.

## Sprint 8 Admin Trigger

The same catalog synchronization can be triggered from the admin UI through:

```http
POST /pjm-sync/admin/sync
```

The endpoint remains a backend-only integration point. It uses `productEngines/list` and `Operation: "options"` through the existing PJM client, then persists the normalized engines, price groups, mappings, options and choices with Prisma.

It still does not call `optionsandprice`. Price calculation remains PJM/Pressero responsibility.
