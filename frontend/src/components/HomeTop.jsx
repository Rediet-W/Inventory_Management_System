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
      icon: <FaBox size={24} color="#1E43FA" />,
      number: totalProductsInStore,
      title: "Products in Store",
      bgColor: "rgba(30, 67, 250, 0.05)",
    },
    {
      icon: <FaExclamationTriangle size={24} color="#FF6B6B" />,
      number: lowStockProductsCount,
      title: "Low Stock Products",
      bgColor: "rgba(255, 107, 107, 0.05)",
    },
    {
      icon: <FaStore size={24} color="#4CAF50" />,
      number: totalItemsInShop,
      title: "Items in Shop",
      bgColor: "rgba(76, 175, 80, 0.05)",
    },
    {
      icon: <FaStore size={24} color="#FF9800" />,
      number: zeroItemsInShop,
      title: "Out of Stock Items",
      bgColor: "rgba(255, 152, 0, 0.05)",
    },
  ];

  return (
    <Row className="g-4">
      {cardData.map((item, index) => (
        <Col xs={12} md={6} lg={3} key={index}>
          <Card
            className="text-center h-100 border-0"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              background: item.bgColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
          >
            <Card.Body className="p-4">
              <div
                className="mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                {item.icon}
              </div>
              <Card.Text
                className="h3 fw-bold mb-2"
                style={{ color: "#1A1A1A" }}
              >
                {item.number}
              </Card.Text>
              <Card.Title
                className="text-wrap"
                style={{ color: "#666", fontSize: "0.9rem" }}
              >
                {item.title}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default HomeTop;
