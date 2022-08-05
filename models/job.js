"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle as "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, itle, salary, equity, companyHandle }, ...]
   * */

  static async findAll(filters) {
    let query = `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle as "companyHandle"
                 FROM jobs`;

    let filterNames = [];
    let filterValues = [];

    // if the request includes filters, destructures them
    // and creates the appropriate selectos to be added to the query
    if (filters) {
      const { title, minSalary, hasEquity } = filters;

      if (title) {
        filterValues.push(`%${title}%`);
        filterNames.push(`title ILIKE $${filterValues.length}`);
      }

      if (minSalary !== undefined) {
        filterValues.push(minSalary);
        filterNames.push(`salary >= $${filterValues.length}`);
      }

      if (hasEquity) {
        filterNames.push(`equity > 0`);
      }

      if (filterNames.length) {
        query += " WHERE " + filterNames.join(" AND ");
      }
    }

    query += " ORDER BY id";
    const jobsRes = await db.query(query, filterValues);
    return jobsRes.rows;
  }


  /** Given a job handle, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const result = await db.query(
           `SELECT id,
                   title,
                   salary,
                   equity,
                   company_handle as "companyHandle"
            FROM jobs
           WHERE id = $1`,
        [id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          minSalary: "min_salary",
          equity: "equity"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${handleVarIdx}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle as "companyHandle"`
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
