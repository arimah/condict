This directory contains Condict's GraphQL schema. All `.graphql` files are merged together into a single declaration file. The GraphQL schema is stored outside [packages](../packages) so that it can be referenced by any package that requires it.

The GraphQL files in the schema make use of the custom directives `@id` and `@marshal`. For details on what that means, see [graphql-typer](../packages/graphql-typer).
