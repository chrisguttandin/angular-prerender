import { isValue } from './value.js';

export const isValueArray = (valueArray: unknown): valueArray is string[] => Array.isArray(valueArray) && valueArray.every(isValue);
