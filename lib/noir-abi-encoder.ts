/**
 * ============================================================
 * NOIR ABI ENCODER (AZTEC NETWORK ZERO-KNOWLEDGE)
 * ============================================================
 * In Aztec 3, smart contracts are written in Noir.
 * Before generating a proof, input arguments must be mapped into
 * the ACIR (Abstract Circuit Intermediate Representation) Witness Map.
 * This engine natively encodes TypeScript primitives into Noir Fields.
 * ============================================================
 */

import { ethers } from 'ethers';

// A Noir Field is effectively a 254-bit prime field integer.
// In hexadecimal, it is a 32-byte representation.
export type NoirField = `0x${string}`;

// Noir ABI Types
export type NoirType = 
  | 'Field' 
  | 'Integer' 
  | 'Boolean' 
  | 'String' 
  | { kind: 'Array'; length: number; type: NoirType }
  | { kind: 'Struct'; fields: Record<string, NoirType> };

// Representation of a fully encoded witness map
export type WitnessMap = Map<number, NoirField>;

/**
 * Utility to convert an arbitrary string/number into a 32-byte Noir Field Hex.
 */
export function toNoirField(value: string | number | bigint | boolean): NoirField {
  if (typeof value === 'boolean') {
    return ethers.zeroPadValue(value ? '0x01' : '0x00', 32) as NoirField;
  }
  
  if (typeof value === 'number' || typeof value === 'bigint') {
    const hex = ethers.toBeHex(value);
    return ethers.zeroPadValue(hex, 32) as NoirField;
  }

  if (typeof value === 'string') {
    if (value.startsWith('0x')) {
      // It's already hex, just pad it
      return ethers.zeroPadValue(value, 32) as NoirField;
    } else {
      // It's a string literal. Encode to bytes, then hex, then pad.
      const bytes = ethers.toUtf8Bytes(value);
      const hex = ethers.hexlify(bytes);
      return ethers.zeroPadValue(hex, 32) as NoirField;
    }
  }

  throw new Error(`Unsupported value type for NoirField: ${typeof value}`);
}

/**
 * Recursively flattens complex data structures (Arrays, Structs) into a linear
 * array of NoirFields as expected by the ACIR witness generator.
 */
export function encodeNoirABI(
  data: any,
  typeDef: NoirType
): NoirField[] {
  if (typeDef === 'Field' || typeDef === 'Integer' || typeDef === 'Boolean' || typeDef === 'String') {
    return [toNoirField(data)];
  }

  if (typeof typeDef === 'object' && typeDef.kind === 'Array') {
    if (!Array.isArray(data)) throw new Error("Expected array data");
    if (data.length !== typeDef.length) throw new Error(`Expected array of length ${typeDef.length}`);
    
    let encoded: NoirField[] = [];
    for (const item of data) {
      encoded = encoded.concat(encodeNoirABI(item, typeDef.type));
    }
    return encoded;
  }

  if (typeof typeDef === 'object' && typeDef.kind === 'Struct') {
    if (typeof data !== 'object') throw new Error("Expected object data for Struct");
    
    let encoded: NoirField[] = [];
    for (const [key, structFieldType] of Object.entries(typeDef.fields)) {
      if (!(key in data)) throw new Error(`Missing struct field: ${key}`);
      encoded = encoded.concat(encodeNoirABI(data[key], structFieldType));
    }
    return encoded;
  }

  throw new Error(`Unknown NoirType definition`);
}

/**
 * Builds the initial Witness Map that the Barretenberg Prover consumes.
 * Assigns an incrementing index to each linear field.
 */
export function buildWitnessMap(
  abiDefinition: { name: string; type: NoirType }[],
  args: Record<string, any>
): WitnessMap {
  let witnessIndex = 1; // Witness indices typically start at 1
  const map: WitnessMap = new Map();

  for (const param of abiDefinition) {
    if (!(param.name in args)) {
      throw new Error(`Missing argument: ${param.name}`);
    }

    const fields = encodeNoirABI(args[param.name], param.type);
    for (const field of fields) {
      map.set(witnessIndex, field);
      witnessIndex++;
    }
  }

  return map;
}

/**
 * Helper to serialize the Witness Map into a format suitable for network
 * transmission to a remote Proving server or local WASM boundary.
 */
export function serializeWitnessMap(map: WitnessMap): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [index, value] of map.entries()) {
    obj[index.toString()] = value;
  }
  return obj;
}
