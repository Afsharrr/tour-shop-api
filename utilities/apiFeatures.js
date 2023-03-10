class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObject = { ...this.queryString };
    const excludes = ["limit", "sort", "fields", "page"];
    excludes.forEach((ex) => delete queryObject[ex]);

    queryObject = JSON.stringify(queryObject);
    queryObject = JSON.parse(
      queryObject.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );

    this.query = this.query.find(queryObject);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortFields);
    } else {
      this.query = this.query.sort("createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const page = +this.queryString.page || 1;
      const limit = +this.queryString.limit || 100;
      const skip = (page - 1) * limit;
      console.log(page, limit, skip);

      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

module.exports = APIFeatures;
