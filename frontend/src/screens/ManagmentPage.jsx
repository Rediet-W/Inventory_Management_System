// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Button,
//   Pagination,
//   Alert,
//   Row,
//   Col,
//   Form,
//   Spinner,
//   Tab,
//   Tabs,
//   Badge,
// } from "react-bootstrap";
// import {
//   useGetProductsQuery,
//   useUpdateProductMutation,
// } from "../slices/productApiSlice";
// import { useSelector, useDispatch } from "react-redux";
// import { triggerRefresh } from "../slices/refreshSlice";
// import SearchBar from "../components/SearchBar";
// import { toast } from "react-toastify";
// import SalesUnitsModal from "../components/SalesUnitModal";

// const ManagementPage = () => {
//   const dispatch = useDispatch();
//   const refreshKey = useSelector((state) => state.refresh.refreshKey);
//   const { data: products, isLoading, error, refetch } = useGetProductsQuery();
//   const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchType, setSearchType] = useState("batchNumber");
//   const [editedProducts, setEditedProducts] = useState({});
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showSalesUnitsModal, setShowSalesUnitsModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("inventory");
//   const openSalesUnitsModal = (product) => {
//     setSelectedProduct(product);
//     setShowSalesUnitsModal(true);
//   };

//   const closeSalesUnitsModal = () => {
//     setSelectedProduct(null);
//     setShowSalesUnitsModal(false);
//   };

//   useEffect(() => {
//     refetch();
//   }, [refreshKey, refetch]);

//   if (isLoading)
//     return (
//       <div className="text-center py-4">
//         <Spinner animation="border" variant="primary" />
//       </div>
//     );
//   if (error)
//     return (
//       <Alert variant="danger" className="text-center">
//         Error loading products
//       </Alert>
//     );

//   // **Search Logic**
//   let filteredProducts = products || [];
//   if (searchQuery.trim() !== "") {
//     filteredProducts = filteredProducts.filter((product) => {
//       if (searchType === "batchNumber") {
//         return product.batchNumber
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase());
//       } else {
//         return product.name.toLowerCase().includes(searchQuery.toLowerCase());
//       }
//     });
//   }

//   // **Sort (Avoid Immutable Sort Error)**
//   const sortedProducts = [...filteredProducts].sort(
//     (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
//   );

//   // **Pagination**
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProducts = sortedProducts.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//   // **Handle Input Changes & Validation**
//   const handleChange = (productId, field, value) => {
//     const updatedProduct = {
//       ...editedProducts[productId],
//       [field]:
//         field === "sellingPrice" || field === "reorderLevel"
//           ? Number(value)
//           : value,
//     };

//     setEditedProducts((prev) => ({ ...prev, [productId]: updatedProduct }));
//     // setEditedProducts((prev) => ({
//     //   ...prev,
//     //   [productId]: {
//     //     ...prev[productId],
//     //     [field]: value,
//     //   },
//     // }));

//     // **Validation for Selling Price & Remark**
//     const product = products.find((p) => p.id === productId);
//     if (field === "sellingPrice") {
//       if (value < product.averageCost) {
//         setValidationErrors((prev) => ({
//           ...prev,
//           [productId]:
//             "Remark is required when selling price is lower than average cost.",
//         }));
//       } else {
//         setValidationErrors((prev) => {
//           const newErrors = { ...prev };
//           delete newErrors[productId]; // Remove error if fixed
//           return newErrors;
//         });
//       }
//     }

//     if (field === "remark") {
//       if (
//         editedProducts[productId]?.sellingPrice < product.averageCost &&
//         value.trim() === ""
//       ) {
//         setValidationErrors((prev) => ({
//           ...prev,
//           [productId]:
//             "Remark cannot be empty if selling price < average cost.",
//         }));
//       } else {
//         setValidationErrors((prev) => {
//           const newErrors = { ...prev };
//           delete newErrors[productId];
//           return newErrors;
//         });
//       }
//     }
//   };

//   // **Save Updated Products**
//   const handleSave = async () => {
//     if (Object.keys(validationErrors).length > 0) {
//       toast.error("Cannot save: Fix validation errors first.");
//       return;
//     }

//     try {
//       const updates = Object.entries(editedProducts).map(([id, changes]) => ({
//         id,
//         ...changes,
//       }));

//       await Promise.all(
//         updates.map((product) => updateProduct(product).unwrap())
//       );

//       toast.success("Products updated successfully!");
//       setEditedProducts({});
//       setValidationErrors({});
//       dispatch(triggerRefresh());
//     } catch (error) {
//       console.error("Failed to update products", error);
//       toast.error("Failed to update products");
//     }
//   };

//   //   return (
//   //     <div className="container mt-4">
//   //       <div className="bg-white p-4 rounded-3 shadow-sm">
//   //         <h3 className="text-center mb-4">Product Management</h3>

//   //         {/* Search Bar and Save Button in One Row */}
//   //         <Row className="align-items-center mb-4 flex justify-between">
//   //           <Col md={6}>
//   //             <SearchBar
//   //               searchQuery={searchQuery}
//   //               setSearchQuery={setSearchQuery}
//   //               searchType={searchType}
//   //               setSearchType={setSearchType}
//   //             />
//   //           </Col>
//   //           <Col md={4} className="text-end">
//   //             <Button
//   //               variant="primary"
//   //               onClick={handleSave}
//   //               disabled={isUpdating || Object.keys(validationErrors).length > 0}
//   //               style={{ backgroundColor: "#1E43FA", borderColor: "#1E43FA" }}
//   //             >
//   //               {isUpdating ? (
//   //                 <>
//   //                   <span
//   //                     className="spinner-border spinner-border-sm me-2"
//   //                     role="status"
//   //                     aria-hidden="true"
//   //                   ></span>
//   //                   Saving...
//   //                 </>
//   //               ) : (
//   //                 "Save Changes"
//   //               )}
//   //             </Button>
//   //           </Col>
//   //         </Row>

//   //         {/* Product Table */}
//   //         <div className="table-responsive">
//   //           <Table striped bordered hover className="mt-3">
//   //             <thead className="table-light">
//   //               <tr>
//   //                 <th>No.</th>
//   //                 <th>Batch No</th>
//   //                 <th>Description</th>
//   //                 <th>UOM</th>
//   //                 <th>Quantity</th>
//   //                 <th>Reorder Level</th>
//   //                 <th>Average Cost</th>
//   //                 <th>Selling Price</th>

//   //                 <th>Remark</th>
//   //                 <th>Sales Units</th>
//   //               </tr>
//   //             </thead>
//   //             <tbody>
//   //               {currentProducts.map((product, index) => {
//   //                 const isSellingBelowAverage =
//   //                   editedProducts[product.id]?.sellingPrice <
//   //                   product.averageCost;

//   //                 return (
//   //                   <tr key={product.id}>
//   //                     <td>{indexOfFirstItem + index + 1}</td>
//   //                     <td>
//   //                       <Form.Control
//   //                         type="text"
//   //                         value={
//   //                           editedProducts[product.id]?.batchNumber ??
//   //                           product.batchNumber
//   //                         }
//   //                         onChange={(e) =>
//   //                           handleChange(
//   //                             product.id,
//   //                             "batchNumber",
//   //                             e.target.value
//   //                           )
//   //                         }
//   //                         className="form-control-sm"
//   //                       />
//   //                     </td>
//   //                     <td>
//   //                       <Form.Control
//   //                         type="text"
//   //                         value={editedProducts[product.id]?.name ?? product.name}
//   //                         onChange={(e) =>
//   //                           handleChange(product.id, "name", e.target.value)
//   //                         }
//   //                         className="form-control-sm"
//   //                       />
//   //                     </td>
//   //                     <td>
//   //                       {/* <Form.Control
//   //                           type="text"
//   //                           value={
//   //                             editedProducts[product.id]?.unitOfMeasurement ??
//   //                             product.unitOfMeasurement
//   //                           } */}
//   //                       {/* onChange={(e) =>
//   //                           //   handleChange(
//   //                           //     product.id,
//   //                           //     "unitOfMeasurement",
//   //                           //     e.target.value
//   //                           //   )
//   //                           // }
//   //                           // className="form-control-sm"
//   //                         //   className="text-center"
//   //                         // />*/}
//   //                       {product.unitOfMeasurement || "N/A"}
//   //                     </td>
//   //                     <td className="text-center">{product.quantity}</td>

//   //                     <td>
//   //                       <Form.Control
//   //                         type="number"
//   //                         value={
//   //                           editedProducts[product.id]?.reorderLevel ??
//   //                           product.reorderLevel
//   //                         }
//   //                         onChange={(e) =>
//   //                           handleChange(
//   //                             product.id,
//   //                             "reorderLevel",
//   //                             e.target.value
//   //                           )
//   //                         }
//   //                         min="0"
//   //                         className="form-control-sm"
//   //                       />
//   //                     </td>
//   //                     <td className="text-center">{product.averageCost}</td>

//   //                     <td>
//   //                       <Form.Control
//   //                         type="number"
//   //                         value={
//   //                           editedProducts[product.id]?.sellingPrice ??
//   //                           product.sellingPrice
//   //                         }
//   //                         onChange={(e) =>
//   //                           handleChange(
//   //                             product.id,
//   //                             "sellingPrice",
//   //                             e.target.value
//   //                           )
//   //                         }
//   //                         min="0"
//   //                         className={`form-control-sm ${
//   //                           validationErrors[product.id] ? "is-invalid" : ""
//   //                         }`}
//   //                       />
//   //                       {validationErrors[product.id] && (
//   //                         <div className="invalid-feedback">
//   //                           {validationErrors[product.id]}
//   //                         </div>
//   //                       )}
//   //                     </td>
//   //                     <td>
//   //                       <Form.Control
//   //                         type="text"
//   //                         value={
//   //                           editedProducts[product.id]?.remark ??
//   //                           product.remark ??
//   //                           ""
//   //                         }
//   //                         onChange={(e) =>
//   //                           handleChange(product.id, "remark", e.target.value)
//   //                         }
//   //                         className={`form-control-sm ${
//   //                           isSellingBelowAverage ? "is-invalid" : ""
//   //                         }`}
//   //                         placeholder={
//   //                           isSellingBelowAverage ? "Required" : "Enter remark"
//   //                         }
//   //                       />
//   //                     </td>
//   //                     <td>
//   //                       <Button
//   //                         variant="outline-primary"
//   //                         size="sm"
//   //                         onClick={() => openSalesUnitsModal(product)}
//   //                       >
//   //                         View/Edit
//   //                       </Button>
//   //                     </td>
//   //                   </tr>
//   //                 );
//   //               })}
//   //             </tbody>
//   //           </Table>
//   //         </div>

//   //         {/* Pagination */}
//   //         {totalPages > 1 && (
//   //           <Pagination className="justify-content-center mt-4">
//   //             <Pagination.Prev
//   //               onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
//   //               disabled={currentPage === 1}
//   //             />
//   //             {[...Array(totalPages).keys()].map((number) => (
//   //               <Pagination.Item
//   //                 key={number + 1}
//   //                 active={number + 1 === currentPage}
//   //                 onClick={() => handlePageChange(number + 1)}
//   //               >
//   //                 {number + 1}
//   //               </Pagination.Item>
//   //             ))}
//   //             <Pagination.Next
//   //               onClick={() =>
//   //                 handlePageChange(Math.min(totalPages, currentPage + 1))
//   //               }
//   //               disabled={currentPage === totalPages}
//   //             />
//   //           </Pagination>
//   //         )}
//   //       </div>
//   //       {showSalesUnitsModal && selectedProduct && (
//   //         <SalesUnitsModal
//   //           show={showSalesUnitsModal}
//   //           onClose={closeSalesUnitsModal}
//   //           product={selectedProduct}
//   //         />
//   //       )}
//   //     </div>
//   //   );
//   // };

//   // export default ManagementPage;
//   return (
// //     <div className="container-fluid py-4">
// //       <div className="card shadow-sm">
// //         <div className="card-header bg-white border-bottom-0">
// //           <h3 className="mb-0">Product Management</h3>
// //           <p className="text-muted mb-0">
// //             Manage inventory, pricing, and product details
// //           </p>
// //         </div>

// //         <div className="card-body">
// //           <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
// //             <Tab
// //               eventKey="inventory"
// //               title={
// //                 <>
// //                   <i className="bi bi-box-seam me-2"></i> Inventory
// //                 </>
// //               }
// //             >
// //               <InventoryTab
// //                 products={products}
// //                 editedProducts={editedProducts}
// //                 handleChange={handleChange}
// //                 validationErrors={validationErrors}
// //                 openSalesUnitsModal={openSalesUnitsModal}
// //               />
// //             </Tab>

// //             <Tab
// //               eventKey="pricing"
// //               title={
// //                 <>
// //                   <i className="bi bi-tag me-2"></i> Pricing
// //                 </>
// //               }
// //             >
// //               <PricingTab
// //                 products={products}
// //                 editedProducts={editedProducts}
// //                 handleChange={handleChange}
// //                 validationErrors={validationErrors}
// //               />
// //             </Tab>

// //             <Tab
// //               eventKey="units"
// //               title={
// //                 <>
// //                   <i className="bi bi-rulers me-2"></i> Units
// //                 </>
// //               }
// //             >
// //               <UnitsTab
// //                 products={products}
// //                 openSalesUnitsModal={openSalesUnitsModal}
// //               />
// //             </Tab>
// //           </Tabs>

// //           <div className="d-flex justify-content-end mt-3">
// //             <Button
// //               variant="primary"
// //               onClick={handleSave}
// //               disabled={Object.keys(editedProducts).length === 0}
// //             >
// //               Save All Changes
// //             </Button>
// //           </div>
// //         </div>
// //       </div>

// //       {showSalesUnitsModal && (
// //         <SalesUnitsModal
// //           show={showSalesUnitsModal}
// //           onClose={() => setShowSalesUnitsModal(false)}
// //           product={selectedProduct}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // // Sub-components for each tab
// // const InventoryTab = ({
// //   products,
// //   editedProducts,
// //   handleChange,
// //   validationErrors,
// //   openSalesUnitsModal,
// // }) => (
// //   <div className="mt-3">
// //     <div className="table-responsive">
// //       <Table hover className="align-middle">
// //         <thead className="table-light">
// //           <tr>
// //             <th>Product</th>
// //             <th>Batch No</th>
// //             <th>Current Qty</th>
// //             <th>Reorder Level</th>
// //             <th>Units</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {products.map((product) => (
// //             <tr key={product.id}>
// //               <td>{product.name}</td>
// //               <td>
// //                 <Form.Control
// //                   size="sm"
// //                   value={
// //                     editedProducts[product.id]?.batchNumber ||
// //                     product.batchNumber
// //                   }
// //                   onChange={(e) =>
// //                     handleChange(product.id, "batchNumber", e.target.value)
// //                   }
// //                 />
// //               </td>
// //               <td className="text-center">{product.quantity}</td>
// //               <td>
// //                 <Form.Control
// //                   type="number"
// //                   size="sm"
// //                   value={
// //                     editedProducts[product.id]?.reorderLevel ??
// //                     product.reorderLevel
// //                   }
// //                   onChange={(e) =>
// //                     handleChange(product.id, "reorderLevel", e.target.value)
// //                   }
// //                 />
// //               </td>
// //               <td>
// //                 <Button
// //                   variant="outline-primary"
// //                   size="sm"
// //                   onClick={() => openSalesUnitsModal(product)}
// //                 >
// //                   Manage Units
// //                 </Button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </Table>
// //     </div>
// //   </div>
// // );

// // const PricingTab = ({
// //   products,
// //   editedProducts,
// //   handleChange,
// //   validationErrors,
// // }) => (
// //   <div className="mt-3">
// //     <div className="table-responsive">
// //       <Table hover className="align-middle">
// //         <thead className="table-light">
// //           <tr>
// //             <th>Product</th>
// //             <th>Cost</th>
// //             <th>Current Price</th>
// //             <th>New Price</th>
// //             <th>Status</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {products.map((product) => {
// //             const sellingPrice =
// //               editedProducts[product.id]?.sellingPrice ?? product.sellingPrice;
// //             const status = sellingPrice
// //               ? sellingPrice >= product.averageCost
// //                 ? "success"
// //                 : "warning"
// //               : "danger";

// //             return (
// //               <tr key={product.id}>
// //                 <td>{product.name}</td>
// //                 <td>{product.averageCost}</td>
// //                 <td>{product.sellingPrice}</td>
// //                 <td>
// //                   <Form.Control
// //                     type="number"
// //                     size="sm"
// //                     value={sellingPrice}
// //                     onChange={(e) =>
// //                       handleChange(product.id, "sellingPrice", e.target.value)
// //                     }
// //                     className={validationErrors[product.id] ? "is-invalid" : ""}
// //                   />
// //                 </td>
// //                 <td>
// //                   <Badge bg={status} className="w-100">
// //                     {status === "success"
// //                       ? "Profitable"
// //                       : status === "warning"
// //                       ? "Below Cost"
// //                       : "Not Set"}
// //                   </Badge>
// //                 </td>
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </Table>
// //     </div>
// //   </div>
// // );

// // const UnitsTab = ({ products, openSalesUnitsModal }) => (
// //   <div className="mt-3">
// //     <div className="table-responsive">
// //       <Table hover className="align-middle">
// //         <thead className="table-light">
// //           <tr>
// //             <th>Product</th>
// //             <th>Base Unit</th>
// //             <th>Available Units</th>
// //             <th>Actions</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {products.map((product) => (
// //             <tr key={product.id}>
// //               <td>{product.name}</td>
// //               <td>{product.unitOfMeasurement || "Not set"}</td>
// //               <td>{product.saleUnits?.length || 0} units</td>
// //               <td>
// //                 <Button
// //                   variant="outline-primary"
// //                   size="sm"
// //                   onClick={() => openSalesUnitsModal(product)}
// //                 >
// //                   Configure Units
// //                 </Button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </Table>
// //     </div>
// //   </div>
// // );

// // export default ManagementPage;
import React, { useState, useEffect } from "react";
import {
  Tab,
  Tabs,
  Table,
  Button,
  Alert,
  Form,
  Spinner,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../slices/productApiSlice";
import { useGetSaleUnitsQuery } from "../slices/salesunitApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { triggerRefresh } from "../slices/refreshSlice";
import SearchBar from "../components/SearchBar";
import { toast } from "react-toastify";
import SalesUnitsModal from "../components/SalesUnitModal";

const ManagementPage = () => {
  const dispatch = useDispatch();
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSalesUnitsModal, setShowSalesUnitsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [editedProducts, setEditedProducts] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("batchNumber");

  useEffect(() => {
    refetch();
  }, [dispatch, refetch]);

  if (isLoading)
    return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error)
    return (
      <Alert variant="danger" className="text-center">
        Error loading products
      </Alert>
    );

  // Filter products based on search
  const filteredProducts =
    products?.filter((product) =>
      searchQuery.trim() === ""
        ? true
        : searchType === "batchNumber"
        ? product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
        : product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const openSalesUnitsModal = (product) => {
    setSelectedProduct(product);
    setShowSalesUnitsModal(true);
  };

  const handleChange = (productId, field, value) => {
    const updatedProduct = {
      ...editedProducts[productId],
      [field]:
        field === "sellingPrice" || field === "reorderLevel"
          ? Number(value)
          : value,
    };

    setEditedProducts((prev) => ({ ...prev, [productId]: updatedProduct }));

    // Validation logic
    const product = products.find((p) => p.id === productId);
    if (field === "sellingPrice") {
      if (value < product.averageCost) {
        setValidationErrors((prev) => ({
          ...prev,
          [productId]:
            "Remark is required when selling price is lower than average cost",
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[productId];
          return newErrors;
        });
      }
    }
  };

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      await Promise.all(
        Object.entries(editedProducts).map(([id, changes]) =>
          updateProduct({ id, ...changes }).unwrap()
        )
      );
      toast.success("Changes saved successfully");
      setEditedProducts({});
      setValidationErrors({});
      dispatch(triggerRefresh());
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };
  const ProductUnitRow = ({
    product,
    index,
    indexOfFirstItem,
    openSalesUnitsModal,
  }) => {
    const { data: unitsData } = useGetSaleUnitsQuery(product.id, {
      skip: !product.id,
    });

    return (
      <tr key={product.id}>
        <td>{indexOfFirstItem + index + 1}</td>
        <td>{product.batchNumber}</td>
        <td>{product.name}</td>
        <td>{product.unitOfMeasurement || "Not set"}</td>
        <td>{unitsData?.data?.length || 0}</td>
        <td>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => openSalesUnitsModal(product)}
          >
            Configure Units
          </Button>
        </td>
      </tr>
    );
  };
  return (
    <div className="container-fluid py-3">
      <h3 className="mb-3">Product Management</h3>

      {/* Save button at the top */}
      <Row className="mb-3">
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={Object.keys(editedProducts).length === 0}
          >
            Save All Changes
          </Button>
        </Col>

        {/* Search bar */}
        <Col>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        <Tab eventKey="inventory" title="Inventory">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Batch No</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product, index) => (
                  <tr key={product.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <Form.Control
                        size="sm"
                        value={
                          editedProducts[product.id]?.batchNumber ||
                          product.batchNumber
                        }
                        onChange={(e) =>
                          handleChange(
                            product.id,
                            "batchNumber",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        value={editedProducts[product.id]?.name || product.name}
                        onChange={(e) =>
                          handleChange(product.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>{product.unitOfMeasurement || "N/A"}</td>
                    <td className="text-center">{product.quantity}</td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={
                          editedProducts[product.id]?.reorderLevel ??
                          product.reorderLevel
                        }
                        onChange={(e) =>
                          handleChange(
                            product.id,
                            "reorderLevel",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openSalesUnitsModal(product)}
                      >
                        Manage Units
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="pricing" title="Pricing">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Average Cost</th>
                  <th>Current Selling Price</th>
                  <th>New Selling Price</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product, index) => (
                  <tr key={product.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.averageCost}</td>
                    <td>{product.sellingPrice}</td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={
                          editedProducts[product.id]?.sellingPrice ??
                          product.sellingPrice
                        }
                        onChange={(e) =>
                          handleChange(
                            product.id,
                            "sellingPrice",
                            e.target.value
                          )
                        }
                        className={
                          validationErrors[product.id] ? "is-invalid" : ""
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        size="sm"
                        value={
                          editedProducts[product.id]?.remark ??
                          product.remark ??
                          ""
                        }
                        onChange={(e) =>
                          handleChange(product.id, "remark", e.target.value)
                        }
                        placeholder={
                          (editedProducts[product.id]?.sellingPrice ??
                            product.sellingPrice) < product.averageCost
                            ? "Required"
                            : "Optional"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="units" title="Units">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Batch No</th>
                  <th>Product</th>
                  <th>Base Unit</th>
                  <th>Available Units</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product, index) => (
                  <ProductUnitRow
                    key={product.id}
                    product={product}
                    index={index}
                    indexOfFirstItem={indexOfFirstItem}
                    openSalesUnitsModal={openSalesUnitsModal}
                  />
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => setCurrentPage(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}

      {showSalesUnitsModal && (
        <SalesUnitsModal
          show={showSalesUnitsModal}
          onClose={() => setShowSalesUnitsModal(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ManagementPage;
