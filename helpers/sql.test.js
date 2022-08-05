const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: partail update", function () {
    const result = sqlForPartialUpdate(
        { firstName: "test" },
        { firstName: "first_name", lastName: "last_name" });
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ["test"],
    });
  });

  test("works: all fields", function () {
    const result = sqlForPartialUpdate(
        { firstName: "test", lastName: "testson" },
        { firstName: "first_name", lastName: "last_name" });
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"last_name\"=$2",
      values: ["test", "testson"],
    });
  });
});
