import React, { useState } from "react";
import { Form, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
}) => {
  const handleSelect = (eventKey) => {
    setSearchType(eventKey);
  };

  return (
    <InputGroup className="mb-3">
      <Form.Control
        placeholder={`Search by ${
          searchType === "productName" ? "Product Name" : "Batch Number"
        }`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <DropdownButton
        // variant="outline-secondary"
        title={searchType === "productName" ? "Product Name" : "Batch Number"}
        id="search-type-dropdown"
        onSelect={handleSelect}
        className="bg-[#0076f5] "
      >
        <Dropdown.Item eventKey="productName">Product Name</Dropdown.Item>
        <Dropdown.Item eventKey="batchNumber">Batch Number</Dropdown.Item>
      </DropdownButton>
    </InputGroup>
  );
};

export default SearchBar;
