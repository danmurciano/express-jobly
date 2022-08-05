const { BadRequestError } = require("../expressError");

/**
* Takes data to update in JS and turns it to SQL SET statement.
*
* dataToUpdate: {Object} {field: value...}
* jsToSql: {Object} converts JS data field names to SQL column names. {minSalary: "min_salary"}
*
* returns {object} {setCols, values}
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
