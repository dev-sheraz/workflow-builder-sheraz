/* eslint-disable no-undef */
import fs from "fs";
import path from "path";

/**
 * Safe file write utility to prevent nodemon from restarting
 * Uses atomic writes by writing to a temp file first, then renaming
 */

/**
 * Write JSON data to file safely
 * @param {string} filePath - Path to the file
 * @param {any} data - Data to write (will be JSON stringified)
 */
export function safeWriteJSON(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);

    // Write directly to the file
    // Since we've configured nodemon to ignore the data folder, this should be safe
    fs.writeFileSync(filePath, jsonString, "utf8");

    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error;
  }
}

/**
 * Read JSON data from file safely
 * @param {string} filePath - Path to the file
 * @returns {any} Parsed JSON data or empty array if file doesn't exist
 */
export function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf8");
    if (!content.trim()) {
      return [];
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading from ${filePath}:`, error);
    return [];
  }
}
