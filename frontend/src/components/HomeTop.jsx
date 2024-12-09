import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";

const HomeTop = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const {
    data: shops,
    isLoading: shopLoading,
    error: shopError,
  } = useGetShopProductsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  const { allProducts = [], lowStockinshop = [] } = shops || {};

  // Calculate total store value (sum of all buying prices)
  const totalStoreValue = products.reduce(
    (total, product) => total + product.buyingPrice * product.quantity,
    0
  );

  const totalShopValue = allProducts.reduce(
    (total, inshop) => total + inshop.buying_price * inshop.quantity,
    0
  );

  const totalItems = products.length;

  // Filter products with less than 3 in quantity
  const lowStockProducts = products.filter((product) => product.quantity < 3);

  return (
    <Row className="g-4">
      {/* Total Store Value Card */}
      <Col xs={12} md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Total Store Value</Card.Title>
            <Card.Text className="h4">{`${totalStoreValue} ETB`}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Current Shop Value Card */}
      <Col xs={12} md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Current Shop Value</Card.Title>
            <Card.Text className="h4">{`${totalShopValue} ETB`}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Low Stock Items Card */}
      <Col xs={12} md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Card.Title>Low Stock Items</Card.Title>
            <Card.Text className="h4">{lowStockProducts.length}</Card.Text>
            {lowStockProducts.length > 0 && (
              <Card.Text className="text-muted">
                {lowStockProducts.map((product) => product.name).join(", ")}
              </Card.Text>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HomeTop;
