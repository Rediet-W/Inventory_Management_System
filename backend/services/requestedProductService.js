import RequestedProduct from "../models/requestedProductModel.js";

export const getAllRequestedProducts = async () => {
  return await RequestedProduct.findAll();
};

export const createRequestedProduct = async (data) => {
  return await RequestedProduct.create(data);
};

export const updateRequestedProduct = async (id, quantity) => {
  const requestedProduct = await RequestedProduct.findByPk(id);
  if (!requestedProduct) return null;

  requestedProduct.quantity = quantity;
  await requestedProduct.save();
  return requestedProduct;
};

export const deleteRequestedProduct = async (id) => {
  const requestedProduct = await RequestedProduct.findByPk(id);
  if (!requestedProduct) return null;

  await requestedProduct.destroy();
  return { message: "Requested product removed successfully" };
};
