class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObj = { ...this.queryString };

    // Only leave in the query the key value pairs to flter
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortStr = this.queryString.sort.replace(',', ' ');
      this.query.sort(sortStr);
    } else {
      //Default sorting
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fieldStr = this.queryString.fields.replaceAll(',', ' ');
      this.query = this.query.select(fieldStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 13;
    const skip = (page - 1) * limit;

    // Use limit and after skip, otherwise it won't work
    this.query = this.query.limit(limit).skip(skip);

    return this;
  }
}

module.exports = APIFeatures;
