import React, { useState, useEffect } from "react";

const OrderForm = () => {
  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderLine, setOrderLine] = useState([{ productId: "", quantity: 1 }]);
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch the products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://koa-trial.onrender.com/products");
        const data = await response.json();
        if (data.products) {
          setProducts(data.products);
        } else {
          setErrorMessage("Failed to fetch products");
        }
      } catch (error) {
        setErrorMessage("Error fetching products: " + error.message);
      }
    };
    fetchProducts();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId || !orderId || orderLine.some((item) => !item.productId)) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    const orderData = {
      customerId,
      orderId,
      orderLine,
    };

    try {
      const response = await fetch("https://koa-trial.onrender.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order placed successfully!");
        setCustomerId("");
        setOrderId("");
        setOrderLine([{ productId: "", quantity: 1 }]);
      } else {
        setErrorMessage(data.error || "Error placing order");
      }
    } catch (error) {
      setErrorMessage("Error placing order: " + error.message);
    }
  };

  // Handle adding/removing products in order line
  const handleProductChange = (index, event) => {
    const updatedOrderLine = [...orderLine];
    updatedOrderLine[index][event.target.name] = event.target.value;
    setOrderLine(updatedOrderLine);
  };

  const addProductRow = () => {
    setOrderLine([...orderLine, { productId: "", quantity: 1 }]);
  };

  const removeProductRow = (index) => {
    const updatedOrderLine = orderLine.filter((_, i) => i !== index);
    setOrderLine(updatedOrderLine);
  };

  return (
    <div className="order-form">
      <h2>Place Your Order</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="customerId">Customer ID:</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="orderId">Order ID:</label>
          <input
            type="text"
            id="orderId"
            name="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>

        {orderLine.map((line, index) => (
          <div key={index} className="order-line">
            <div>
              <label htmlFor={`productId-${index}`}>Product ID:</label>
              <select
                id={`productId-${index}`}
                name="productId"
                value={line.productId}
                onChange={(e) => handleProductChange(index, e)}
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`quantity-${index}`}>Quantity:</label>
              <input
                type="number"
                id={`quantity-${index}`}
                name="quantity"
                value={line.quantity}
                onChange={(e) => handleProductChange(index, e)}
                min="1"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => removeProductRow(index)}
              disabled={orderLine.length === 1}
            >
              Remove Product
            </button>
          </div>
        ))}
        <button type="button" onClick={addProductRow}>
          Add Another Product
        </button>

        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default OrderForm;
