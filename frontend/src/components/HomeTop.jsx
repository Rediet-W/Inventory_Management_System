import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useGetShopProductsQuery } from "../slices/shopApiSlice";

const HomeTop = () => {
  // Fetch store products
  const { data: products, isLoading, error } = useGetProductsQuery();

  const {
    data: shops,
    isLoading: shopLoading,
    error: shopError,
  } = useGetShopProductsQuery({});

  // Handle loading states
  if (isLoading || shopLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading store products</div>;
  if (shopError) return <div>Error loading shop products</div>;

  const { allProducts = [], lowStockProducts = [] } = shops || {};

  const totalStoreValue = products.reduce(
    (total, product) => total + product.buyingPrice * product.quantity,
    0
  );

  const totalShopValue = allProducts.reduce(
    (total, inshop) => total + inshop.buying_price * inshop.quantity,
    0
  );

  const totalItems = products.length;
  // Filter low stock items in store
  const lowStockProductsInStore = products.filter(
    (product) => product.quantity < 3
  );

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
            <Card.Title>Low Stock Items in shop</Card.Title>
            <Card.Text className="h4">
              {shops.lowStockProducts.length}
            </Card.Text>
            {lowStockProductsInStore.length > 0 && (
              <Card.Text className="text-muted">
                {lowStockProductsInStore
                  .map((product) => product.name)
                  .join(", ")}
              </Card.Text>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HomeTop;
