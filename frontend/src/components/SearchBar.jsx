import React, { useState } from "react";
import { Form, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
}) => {
  // Handle the selected search type (Product Name or Batch Number)
  const handleSelect = (eventKey) => {
    setSearchType(eventKey); // Set the selected search type (either 'productName' or 'batchNumber')
  };

  return (
    <InputGroup className="mb-3">
      {/* Search Input */}

      <Form.Control
        placeholder={`Search by ${
          searchType === "productName" ? "Product Name" : "Batch Number"
        }`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <DropdownButton
        variant="outline-secondary"
        title={searchType === "productName" ? "Product Name" : "Batch Number"}
        id="search-type-dropdown"
        onSelect={handleSelect}
      >
        <Dropdown.Item eventKey="productName">Product Name</Dropdown.Item>
        <Dropdown.Item eventKey="batchNumber">Batch Number</Dropdown.Item>
      </DropdownButton>

      {/* Dropdown Button to select search type */}
    </InputGroup>
  );
};

export default SearchBar;
