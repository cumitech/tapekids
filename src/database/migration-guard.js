"use strict";

/**
 * Schema helpers for migrations that may run against a database which already
 * has some or all of the change (for example a restored schema with an empty
 * SequelizeMeta table). Each helper no-ops when the object is already present
 * or already gone, and ignores the matching MySQL duplicate/missing errors.
 */

function errnoOf(error) {
  return error?.original?.errno ?? error?.parent?.errno ?? error?.errno;
}

function isAlreadyPresent(error) {
  const errno = errnoOf(error);
  // 1022 duplicate key, 1050 table exists, 1060 duplicate column,
  // 1061 duplicate key name, 1826 duplicate foreign key name
  return errno === 1022 || errno === 1050 || errno === 1060 || errno === 1061 || errno === 1826;
}

function isAlreadyAbsent(error) {
  const errno = errnoOf(error);
  // 1051 unknown table, 1091 can't drop missing column/key, 1146 table doesn't exist
  return errno === 1051 || errno === 1091 || errno === 1146;
}

function tableNameOf(entry) {
  if (typeof entry === "string") {
    return entry;
  }
  if (entry && typeof entry === "object") {
    return entry.tableName || entry.TABLE_NAME || Object.values(entry)[0] || "";
  }
  return "";
}

async function tableExists(queryInterface, table) {
  const tables = await queryInterface.showAllTables();
  return tables.some(
    (entry) => tableNameOf(entry).toLowerCase() === String(table).toLowerCase()
  );
}

async function columnExists(queryInterface, table, column) {
  if (!(await tableExists(queryInterface, table))) {
    return false;
  }
  const description = await queryInterface.describeTable(table);
  return Object.prototype.hasOwnProperty.call(description, column);
}

function indexFields(index) {
  return (index.fields || []).map((field) =>
    typeof field === "string" ? field : field.attribute || field.name
  );
}

function sameFields(index, fields) {
  const current = indexFields(index);
  if (current.length !== fields.length) {
    return false;
  }
  return fields.every((field, index) => current[index] === field);
}

async function listIndexes(queryInterface, table) {
  if (!(await tableExists(queryInterface, table))) {
    return [];
  }
  return queryInterface.showIndex(table);
}

async function ensureTable(queryInterface, table, attributes, options) {
  if (await tableExists(queryInterface, table)) {
    return false;
  }
  try {
    await queryInterface.createTable(table, attributes, options);
  } catch (error) {
    if (isAlreadyPresent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

async function dropTableIfExists(queryInterface, table) {
  if (!(await tableExists(queryInterface, table))) {
    return false;
  }
  try {
    await queryInterface.dropTable(table);
  } catch (error) {
    if (isAlreadyAbsent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

async function ensureColumn(queryInterface, table, column, definition) {
  if (await columnExists(queryInterface, table, column)) {
    return false;
  }
  try {
    await queryInterface.addColumn(table, column, definition);
  } catch (error) {
    if (isAlreadyPresent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

async function dropColumnIfExists(queryInterface, table, column) {
  if (!(await columnExists(queryInterface, table, column))) {
    return false;
  }
  try {
    await queryInterface.removeColumn(table, column);
  } catch (error) {
    if (isAlreadyAbsent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

async function changeColumnIfExists(queryInterface, table, column, definition) {
  if (!(await columnExists(queryInterface, table, column))) {
    return false;
  }
  await queryInterface.changeColumn(table, column, definition);
  return true;
}

async function ensureIndex(queryInterface, table, fieldsOrOptions, maybeOptions) {
  const options = Array.isArray(fieldsOrOptions)
    ? { ...(maybeOptions || {}) }
    : { ...(fieldsOrOptions || {}) };
  const fields = Array.isArray(fieldsOrOptions) ? fieldsOrOptions : options.fields || [];
  const indexes = await listIndexes(queryInterface, table);
  if (options.name && indexes.some((index) => index.name === options.name)) {
    return false;
  }
  if (
    fields.length &&
    indexes.some((index) => {
      if (!sameFields(index, fields)) {
        return false;
      }
      return options.unique ? Boolean(index.unique) : true;
    })
  ) {
    return false;
  }
  try {
    if (Array.isArray(fieldsOrOptions)) {
      await queryInterface.addIndex(table, fields, options);
    } else {
      await queryInterface.addIndex(table, options);
    }
  } catch (error) {
    if (isAlreadyPresent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

async function dropIndexesOnColumns(queryInterface, table, fields, { uniqueOnly = false } = {}) {
  const indexes = await listIndexes(queryInterface, table);
  for (const index of indexes) {
    if (index.primary) {
      continue;
    }
    if (uniqueOnly && !index.unique) {
      continue;
    }
    if (!sameFields(index, fields)) {
      continue;
    }
    try {
      await queryInterface.removeIndex(table, index.name);
    } catch (error) {
      if (!isAlreadyAbsent(error)) {
        throw error;
      }
    }
  }
}

async function constraintExists(queryInterface, table, name) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME AS name
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :table
       AND CONSTRAINT_NAME = :name
     LIMIT 1`,
    { replacements: { table, name } }
  );
  return rows.length > 0;
}

async function dropConstraintIfExists(queryInterface, table, name) {
  if (!(await constraintExists(queryInterface, table, name))) {
    return false;
  }
  try {
    await queryInterface.removeConstraint(table, name);
  } catch (error) {
    if (isAlreadyAbsent(error)) {
      return false;
    }
    throw error;
  }
  return true;
}

module.exports = {
  tableExists,
  columnExists,
  constraintExists,
  ensureTable,
  dropTableIfExists,
  ensureColumn,
  dropColumnIfExists,
  changeColumnIfExists,
  ensureIndex,
  dropIndexesOnColumns,
  dropConstraintIfExists,
};
