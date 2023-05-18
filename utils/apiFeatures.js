class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = {...this.queryString};
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach(element => delete queryObj[element]);

    if (queryObj.month && queryObj.year) {
      this.query = this.query.find({
        $expr: {
          $and: [
            {$eq: [{$month: '$paidAt'}, queryObj.month * 1]},
            {$eq: [{$year: '$paidAt'}, queryObj.year * 1]},
          ],
        },
      });
      delete queryObj['month'];
      delete queryObj['year'];
    } else if (queryObj.month) {
      this.query = this.query.find({
        $expr: {
          $and: [
            {$eq: [{$month: '$paidAt'}, queryObj.month * 1]},
            {$eq: [{$year: '$paidAt'}, new Date().getFullYear()]},
          ],
        },
      });
      delete queryObj['month'];
    }

    const queryString = JSON.stringify(queryObj);

    const query = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(query));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-paidAt');
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');
    return this;
  }
}

module.exports = APIFeatures;
