import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";

const App = () => {
  const [rentals, setRentals] = useState([]);
  const [formData, setFormData] = useState({
    rentAmount: 0,
    platformFee: 0,
    userPays: 0,
    ownerReceives: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedRentId, setSelectedRentId] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    const calculatedOwnerReceives = formData.userPays - formData.platformFee;
    const newOwnerReceives = Math.max(calculatedOwnerReceives, 0);

    setFormData((prevData) => ({
      ...prevData,
      ownerReceives: newOwnerReceives.toFixed(2),
    }));
  }, [formData?.userPays, formData?.platformFee]);

  const fetchRentals = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/rents/getAllRent"
      );
      setRentals(response.data);
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const handleShowModal = (id) => {
    if (id) {
      const selectedRent = rentals.find((rental) => rental._id === id);
      setFormData(selectedRent);
      setSelectedRentId(id);
    } else {
      setFormData({
        rentAmount: 0,
        platformFee: 100,
        userPays: 0,
        ownerReceives: 0,
      });
      setSelectedRentId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRentId) {
        if (
          !formData?.rentAmount ||
          !formData?.ownerReceives ||
          !formData.userPays
        ) {
          return;
        }
        // for Updating existing rent data
        await axios.put(
          `http://localhost:3002/rents/updateRent/${selectedRentId}`,
          formData
        );
      } else {
        if (
          !formData?.rentAmount ||
          !formData?.ownerReceives ||
          !formData.userPays
        ) {
          return;
        }
        // for Creating new rent data
        await axios.post("http://localhost:3002/rents/newRent", formData);
      }
      fetchRentals();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving rental:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/rents/deleteRent/${id}`);
      fetchRentals();
    } catch (error) {
      console.error("Error deleting rental:", error);
    }
  };

  return (
    <div className="container">
      <h1>Rental App</h1>
      <Button variant="success" onClick={() => handleShowModal()}>
        Pay Rent
      </Button>
      <div className="table-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Rent Amount</th>
              <th>Platform Fee</th>
              <th>User Pays</th>
              <th>Owner Receives</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals?.map((rental) => (
              <tr key={rental._id}>
                <td>{rental.rentAmount}</td>
                <td>{rental.platformFee}</td>
                <td>{rental.userPays}</td>
                <td>{rental.ownerReceives}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleShowModal(rental._id)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(rental._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="modal-container"
      >
        <Modal.Header closeButton>
          <Modal.Title><h2 style={{ marginTop: 50 }}>{selectedRentId ? "Edit Rent" : "Pay Rent"}</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formRentAmount" className="col">
                <Form.Label>Rent Amount</Form.Label>
                {' '}
                <Form.Control
                  type="text"
                  name="rentAmount"
                  value={formData?.rentAmount}
                  onChange={handleInputChange}
                  required={true}
                />
              </Form.Group>

              <Form.Group controlId="formPlatformFee" className="col">
                <Form.Label>Platform Fee</Form.Label>
                {' '}
                <Form.Control
                  type="text"
                  name="platformFee"
                  value={formData?.platformFee}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formUserPays" className="col">
                <Form.Label>User Pays</Form.Label>
                {' '}
                <Form.Control
                  type="text"
                  name="userPays"
                  value={formData?.userPays}
                  onChange={handleInputChange}
                  required
                  min={formData.rentAmount + formData.platformFee}
                />
              </Form.Group>

              <Form.Group controlId="formOwnerReceives" className="col">
                <Form.Label>Owner Receives</Form.Label>
                {' '}
                <Form.Control
                  type="text"
                  name="ownerReceives"
                  value={formData?.ownerReceives}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
              </Form.Group>

            <Button variant="primary" type="submit">
              {selectedRentId ? "Update" : "Save"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default App;
