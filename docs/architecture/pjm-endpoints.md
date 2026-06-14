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

## Sprint 4 Client Boundary

`src/modules/pjm-sync/pjmClient.ts` contains the isolated PJM HTTP client.

Responsibilities:

- authenticate and cache the PJM token;
- call `productEngines/list`;
- call `/public/engine` with `Operation: "options"`;
- call `/public/engine` with `Operation: "optionsandprice"`;
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
