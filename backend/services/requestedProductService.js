import RequestedProduct from "../models/requestedProductModel.js";

export const getAllRequestedProducts = async () => {
  return await RequestedProduct.findAll();
};

export const createRequestedProduct = async (data) => {
  return await RequestedProduct.create({
    name: data.name,
    description: data.description,
    quantity: data.quantity || 1,
    status: data.status || "pending",
  });
};

export const updateRequestedProduct = async (id, updates) => {
  const requestedProduct = await RequestedProduct.findByPk(id);
  if (!requestedProduct) return null;

  if (updates.quantity !== undefined) {
    requestedProduct.quantity = updates.quantity;
  }
  if (updates.status !== undefined) {
    requestedProduct.status = updates.status;
  }

  await requestedProduct.save();
  return requestedProduct;
};

// ✅ Delete requested product
export const deleteRequestedProduct = async (id) => {
  const requestedProduct = await RequestedProduct.findByPk(id);
  if (!requestedProduct) return null;

  await requestedProduct.destroy();
  return { message: "Requested product deleted successfully" };
};
