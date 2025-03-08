import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";
import { FaBox, FaExclamationTriangle, FaStore } from "react-icons/fa";

const HomeTop = () => {
  // Fetch store products
  const { data: products, isLoading, error } = useGetProductsQuery();

  // Fetch shop products
  const {
    data: shops,
    isLoading: shopLoading,
    error: shopError,
  } = useGetShopProductsQuery({});

  // Handle loading states
  if (isLoading || shopLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading store products</div>;
  if (shopError) return <div>Error loading shop products</div>;

  const { allProducts = [] } = shops || {};

  // Count products in store with non-zero quantity
  const totalProductsInStore = products.filter(
    (product) => product.quantity > 0
  ).length;

  // Count low stock products (quantity <= reorderLevel)
  const lowStockProductsCount = products.filter(
    (product) => product.quantity <= product.reorderLevel
  ).length;

  // Count items in shop (length of shop products)
  const totalItemsInShop = allProducts.filter(
    (product) => product.quantity > 0
  ).length;

  const zeroItemsInShop = allProducts.filter(
    (product) => product.quantity == 0
  ).length;

  const cardData = [
    {
      icon: <FaBox size={30} />,
      number: totalProductsInStore,
      title: "Products in Store",
    },
    {
      icon: <FaExclamationTriangle size={30} />,
      number: lowStockProductsCount,
      title: "Low Stock Products(store)",
    },
    {
      icon: <FaStore size={30} />,
      number: totalItemsInShop,
      title: "Items in Shop",
    },
    {
      icon: <FaStore size={30} />,
      number: zeroItemsInShop,
      title: "zero quantity items in Shop",
    },
  ];

  return (
    <Row className="g-4">
      {cardData.map((item, index) => (
        <Col xs={12} md={3} key={index} className="rounded-full ">
          <Card
            className="text-center shadow-sm rounded-full "
            style={{ backgroundColor: "white", color: "#007bff" }}
          >
            <Card.Body>
              <div className="mb-2">{item.icon}</div>
              <Card.Text className="h3 fw-bold">{item.number}</Card.Text>
              <Card.Title className="text-wrap">{item.title}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default HomeTop;
