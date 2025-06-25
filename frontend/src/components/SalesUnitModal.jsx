import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  useGetSaleUnitsQuery,
  useCreateSaleUnitMutation,
  useUpdateSaleUnitMutation,
  useDeleteSaleUnitMutation,
} from "../slices/salesunitApiSlice";

const SalesUnitsModal = ({ product, show, onClose }) => {
  const { data: saleUnitResponse = {}, refetch } = useGetSaleUnitsQuery(
    product?.id,
    { skip: !product }
  );
  const [createUnit] = useCreateSaleUnitMutation();
  const [updateUnit] = useUpdateSaleUnitMutation();
  const [deleteUnit] = useDeleteSaleUnitMutation();

  // State Management
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({
    name: "",
    unitQuantity: "",
    sellingPrice: "",
    baseUnit: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize units when data loads or changes
  useEffect(() => {
    if (saleUnitResponse.data) {
      setUnits([...saleUnitResponse.data]);
    }
  }, [saleUnitResponse.data]);

  // Handlers
  const handleUnitChange = (index, field, value) => {
    setUnits((prevUnits) => {
      // Create a deep copy of the units array
      const updatedUnits = prevUnits.map((unit) => ({ ...unit }));

      // Update the specific field for the changed unit
      updatedUnits[index] = {
        ...updatedUnits[index],
        [field]:
          field === "baseUnit"
            ? value
            : field === "unitQuantity" || field === "sellingPrice"
            ? Number(value)
            : value,
      };

      // If setting as base unit, unset all others
      if (field === "baseUnit" && value) {
        updatedUnits.forEach((unit, i) => {
          if (i !== index) {
            updatedUnits[i] = {
              ...unit,
              baseUnit: false,
            };
          }
        });
      }

      return updatedUnits;
    });
  };

  const handleNewUnitChange = (field, value) => {
    setNewUnit((prev) => ({
      ...prev,
      [field]:
        field === "baseUnit"
          ? value
          : field === "unitQuantity" || field === "sellingPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First update all existing units
      await Promise.all(
        units.map((unit) => updateUnit({ unitId: unit.id, ...unit }).unwrap())
      );
      toast.success("Sale units updated successfully");
      await refetch();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.data?.message || "Failed to update units");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnit.name || !newUnit.unitQuantity) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      await createUnit({
        productId: product.id,
        ...newUnit,
        baseUnit: units.length === 0 ? true : newUnit.baseUnit, // Auto-set as base if first unit
      }).unwrap();
      toast.success("New unit added successfully");
      setNewUnit({
        name: "",
        unitQuantity: "",
        sellingPrice: "",
        baseUnit: false,
      });
      await refetch();
    } catch (err) {
      console.error("Add error:", err);
      toast.error(err.data?.message || "Failed to add new unit");
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;

    try {
      await deleteUnit(unitId).unwrap();
      toast.success("Unit deleted successfully");
      await refetch();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete unit");
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Sales Units for: {product?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity (per base)</th>
              <th>Selling Price</th>
              <th>Base Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit.id}>
                <td>
                  <Form.Control
                    value={unit.name}
                    onChange={(e) =>
                      handleUnitChange(index, "name", e.target.value)
                    }
                    size="sm"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={unit.unitQuantity}
                    onChange={(e) =>
                      handleUnitChange(index, "unitQuantity", e.target.value)
                    }
                    size="sm"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={unit.sellingPrice}
                    onChange={(e) =>
                      handleUnitChange(index, "sellingPrice", e.target.value)
                    }
                    size="sm"
                  />
                </td>
                <td className="text-center">
                  <Form.Check
                    type="radio"
                    name="baseUnit"
                    checked={unit.baseUnit}
                    onChange={(e) =>
                      handleUnitChange(index, "baseUnit", e.target.checked)
                    }
                  />
                </td>
                <td className="text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUnit(unit.id)}
                    disabled={units.length <= 1 && unit.baseUnit}
                    title={
                      units.length <= 1 && unit.baseUnit
                        ? "Cannot delete the only base unit"
                        : ""
                    }
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {/* Add New Unit Row */}
            <tr>
              <td>
                <Form.Control
                  value={newUnit.name}
                  onChange={(e) => handleNewUnitChange("name", e.target.value)}
                  size="sm"
                  placeholder="Unit name"
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={newUnit.unitQuantity || ""}
                  onChange={(e) =>
                    handleNewUnitChange("unitQuantity", e.target.value)
                  }
                  size="sm"
                  placeholder="Quantity"
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={newUnit.sellingPrice || ""}
                  onChange={(e) =>
                    handleNewUnitChange("sellingPrice", e.target.value)
                  }
                  size="sm"
                  placeholder="Price"
                />
              </td>
              <td className="text-center">
                <Form.Check
                  type="checkbox"
                  checked={newUnit.baseUnit}
                  onChange={(e) =>
                    handleNewUnitChange("baseUnit", e.target.checked)
                  }
                  disabled={units.some((u) => u.baseUnit) && !newUnit.baseUnit}
                />
              </td>
              <td className="text-center">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAddUnit}
                  disabled={!newUnit.name || !newUnit.unitQuantity}
                >
                  Add
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SalesUnitsModal;
