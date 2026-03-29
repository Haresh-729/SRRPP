const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(parseInt(query.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, getPaginationMeta };