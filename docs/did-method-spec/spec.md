# Element DID method specification

Element is an implementation of the Sidetree protocol that uses the Ethereum blockchain as the ledger layer and IPFS as the Content-addressable storage layer

For more information, see [the reference protocol documentation](https://github.com/decentralized-identity/sidetree/blob/master/docs/protocol.md)

## Method syntax

The namestring identifying this did method is `elem`

A DID that uses this method MUST begin with the following prefix: `did:elem`. Per the DID specification, this string MUST be in lowercase.

An additional optional network specific identifier may be added as such
- `did:elem:ropsten:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`
- `did:elem:mainnet:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`
- `did:elem:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`

By default, if the network specific identifier is not present, then the default is `ropsten`.
The default may change in the future once `mainnet` is supported.

The remainder of a DID after the prefix, called the did unique suffix, MUST be `SHA256` hash of the encoded create payload (see below)

## Format and Encoding

See https://github.com/decentralized-identity/sidetree/blob/master/docs/protocol.md#format-and-encoding

## CRUD Operations

Element supports the 4 CRUD operations. Each operation is performed by submitting a Sidetree payload to a Sidetree client (either via the [sdk](../../packages/element-lib) or via the [api](../../packages/element-api))

A Sidetree payload looks like this:
```json
{
  "protected": "Encoded header.",
  "payload": "Encoded payload of the operation.",
  "signature": "Encoded signature."
}
```

### Create

The `payload` for a create operation MUST be a did document model, that is to say the did document without the `id` property, and without the `controller` property for the publicKeys.

The JSON schema used to validate the did document model can be found [here](../../packages/element-lib/src/schema/sidetree/didDocumentModel.json)

A did document model should look like this

```json
{
  "@context": "https://w3id.org/did/v1",
  "publicKey": [
    {
      "id": "#primary",
      "usage": "signing",
      "type": "Secp256k1VerificationKey2018",
      "publicKeyHex": "03eaaf1be82a8cfcfa6fb7c3769e7fa06de18350b743e8545c21e58c34235a3606"
    },
    {
      "id": "#recovery",
      "usage": "recovery",
      "type": "Secp256k1VerificationKey2018",
      "publicKeyHex": "02e6cf34913e71386a063c6ef9342a8478907a6e22264622f812c63440b30f555f"
    }
  ]
}
```

### Read

In order to resolve a did into a did document, one MUST use the resolve API of an Element node.

See [the Sidetree protocol](https://github.com/decentralized-identity/sidetree/blob/master/docs/protocol.md) for more details on how a read operation is performed by an Element node

### Update

The `payload` for an update operation MUST be of the following format:
```json
{
  "didUniqueSuffix": "The did unique suffix (the did without the did:elem part)",
  "previousOperationHash": "The operation hash of the latest CREATE or UPDATE operation returned by the Sidetree client",
  "patches": [
    "a list of",
    "supported",
    "patches to apply",
    "to the did document"
  ],
}
```

The list of patches currently supported is:

- `add-public-keys`
- `add-authentication`
- `remove-authentication`
- `add-assertion-method`
- `remove-assertion-method`
- `add-capability-delegation`
- `remove-capability-delegation`
- `add-capability-invocation`
- `remove-capability-invocation`
- `add-key-agreement`
- `remove-key-agreement`
- `add-service-endpoint`
- `remove-service-endpoint`

See [this test file](../../packages/element-lib/src/sidetree/resolve/patches.spec.js) for the syntax of the patches

An update payload SHOULD look like this

```json
{
  "didUniqueSuffix": "EiDV20SIx04vrz-2iea-UE7G6y7eRwo7lnCKJNYTfZ3rcQ",
  "previousOperationHash": "EiAZSwY92kqd5oeaWULYe2EjZc6TxTL9yHWgWOVKJraw9w",
  "patches": [
    {
      "action": "add-public-keys",
      "publicKeys": [
        {
          "id": "#newKey2",
          "usage": "signing",
          "type": "Secp256k1VerificationKey2018",
          "publicKeyHex": "02e500d3778f8725e3e83103f60325ed67224808212fe2cb628cc43670b8ed907a"
        },
        {
          "id": "#newKey3",
          "usage": "signing",
          "type": "Secp256k1VerificationKey2018",
          "publicKeyHex": "022f67333d0ee1951474aa0bd6f533ce26994ca505e3220df5e5a530b1a1d515b9"
        }
      ]
    },
    {
      "action": "remove-public-keys",
      "publicKeys": [
        "#primary"
      ]
    }
  ]
}
```

### Delete

The `payload` for a DELETE operation MUST be:

```json
{
  "didUniqueSuffix": "The did unique suffix (the did without the did:elem part)"
}
```

## Security and privacy considerations

A Sidetree did document need not contain a `proof` property. Indeed, all operations are authenticated with the `signature` field of the payload sent to the Sidetree node. This signature is generaged using a key specified in the corresponding DID Document.