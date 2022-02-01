module.exports = {
  getAllWithPagination: async (model, page, perPage) => {
    page = page ? parseInt(page) : 0;
    perPage = perPage ? parseInt(perPage) : 10;
    return await model
      .find({})
      .skip(parseInt(page) * parseInt(perPage))
      .limit(parseInt(perPage));
  },
};
