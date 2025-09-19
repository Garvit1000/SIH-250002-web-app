// src/lib/veramo.js
// ESM module for Node server runtime (Next.js API route should run in nodejs runtime).
// Implements in-memory DID store with importDID etc. to satisfy Veramo DIDManager.

import { createAgent } from '@veramo/core';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager } from '@veramo/did-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyDIDProvider, getDidKeyResolver } from '@veramo/did-provider-key';
import { Resolver } from 'did-resolver';
import { CredentialIssuer } from '@veramo/credential-w3c';

/* -----------------------------
   Minimal in-memory PrivateKeyStore
   (implements methods KMS expects)
   ----------------------------- */
class InMemoryPrivateKeyStore {
  constructor() {
    this._store = new Map(); // kid -> entry
  }

  // importKey({ alias, type, privateKeyHex, publicKeyHex, meta })
  async importKey({ alias, type, privateKeyHex, publicKeyHex, meta }) {
    const kid = alias || `key_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const entry = {
      kid,
      alias: kid,
      type: type || 'Ed25519',
      privateKeyHex,
      publicKeyHex,
      meta: meta || {},
    };
    this._store.set(kid, entry);
    return entry;
  }

  // getKey({ alias })
  async getKey({ alias }) {
    const entry = this._store.get(alias);
    if (!entry) throw new Error(`privateKey_not_found: ${alias}`);
    return entry;
  }

  // listKeys()
  async listKeys() {
    return Array.from(this._store.values());
  }

  // deleteKey({ alias })
  async deleteKey({ alias }) {
    return this._store.delete(alias);
  }
}

/* -----------------------------
   Proper in-memory DID store implementing AbstractDIDStore methods
   (importDID, getDID, listDIDs, deleteDID)
   ----------------------------- */
class InMemoryDIDStore {
  constructor() {
    // Map key = did string (identifier.did) -> identifier object
    this._map = new Map();
  }

  /**
   * importDID(identifier: IIdentifier): Promise<boolean>
   * Veramo calls this during didManagerCreate to persist new identifier.
   */
  async importDID(identifier) {
    if (!identifier || !identifier.did) {
      throw new Error('importDID: invalid identifier');
    }
    // Store the full identifier object
    this._map.set(identifier.did, identifier);
    return true;
  }

  /**
   * getDID({ did }): Promise<IIdentifier | undefined>
   */
  async getDID({ did }) {
    return this._map.get(did);
  }

  /**
   * listDIDs({ alias? }): Promise<IIdentifier[]>
   * If alias filtering is required, you can implement it; for now just return all.
   */
  async listDIDs({ alias } = {}) {
    const all = Array.from(this._map.values());
    if (!alias) return all;
    return all.filter((id) => id.alias === alias || id?.meta?.alias === alias);
  }

  /**
   * deleteDID({ did }): Promise<boolean>
   */
  async deleteDID({ did }) {
    return this._map.delete(did);
  }
}

/* -----------------------------
   Minimal in-memory Key metadata store (use Veramo's MemoryKeyStore)
   ----------------------------- */
// MemoryKeyStore imported from @veramo/key-manager is fine to use

/* -----------------------------
   KMS: instantiate KeyManagementSystem with our privateKeyStore
   ----------------------------- */
const privateKeyStore = new InMemoryPrivateKeyStore();
const kms = new KeyManagementSystem(privateKeyStore);
const memoryKeyStore = new MemoryKeyStore();

/* -----------------------------
   Create Veramo agent with plugins
   ----------------------------- */
export const agent = createAgent({
  plugins: [
    new KeyManager({
      store: memoryKeyStore,
      kms: { local: kms },
    }),
    new DIDManager({
      // our DID store implements importDID/getDID/listDIDs/deleteDID
      store: new InMemoryDIDStore(),
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getDidKeyResolver(),
      }),
    }),
    new CredentialIssuer(),
  ],
});

/* -----------------------------
   Helper API
   ----------------------------- */
export const veramoHelpers = {
  async createDID() {
    try {
      const identifier = await agent.didManagerCreate({ provider: 'did:key' });
      return identifier;
    } catch (error) {
      console.error('createDID error:', error);
      throw error;
    }
  },

  async issueCredential({ issuerDid, subjectDid, credentialSubject }) {
    try {
      const vc = await agent.createVerifiableCredential({
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'TouristCredential'],
          issuer: { id: issuerDid },
          issuanceDate: new Date().toISOString(),
          credentialSubject: { id: subjectDid, ...credentialSubject },
        },
        proofFormat: 'jwt',
      });
      return vc;
    } catch (error) {
      console.error('issueCredential error:', error);
      throw error;
    }
  },

  async verifyCredential(verifiableCredential) {
    try {
      const result = await agent.verifyCredential({ credential: verifiableCredential });
      return result;
    } catch (error) {
      console.error('verifyCredential error:', error);
      throw error;
    }
  },

  async resolveDID(did) {
    try {
      const res = await agent.resolveDid({ didUrl: did });
      return res;
    } catch (error) {
      console.error('resolveDID error:', error);
      throw error;
    }
  },
};
